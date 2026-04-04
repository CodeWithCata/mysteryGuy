import { Server } from "socket.io";

// --- Shared Schemas & Types ---
import { RoomSchema, Player } from "@shared/index";

// --- Backend Internal Logic & Helpers ---
import { getRoomData, setRoom } from "@/lib/redis.helpers";
import { calculateScores, selectHint } from "@/core/game.logic";

// Main phase timers: one per room (discussion → voting)
const activeTimers     = new Map<string, NodeJS.Timeout>();

// Hint timers: separate so they don't cancel the discussion timer
const activeHintTimers = new Map<string, NodeJS.Timeout>();

// ─── Cancel main timer ────────────────────────────────────────────────────────

export function cancelTimer(roomId: string): void {
  const timerId = activeTimers.get(roomId);
  if (timerId) {
    clearTimeout(timerId);
    activeTimers.delete(roomId);
    console.log(`⏹️  Timer cancelled for room ${roomId}`);
  }
}

// ─── Discussion phase timer ───────────────────────────────────────────────────

export function startDiscussionTimer(
  io: Server,
  roomId: string,
  durationSeconds: number
): void {
  cancelTimer(roomId);

  console.log(`💬 Discussion timer started for room ${roomId} (${durationSeconds}s)`);
  io.to(roomId).emit("phase_started", { phase: "DISCUSSION", durationSeconds });

  const timerId = setTimeout(async () => {
    activeTimers.delete(roomId);
    try {
      const raw = await getRoomData(roomId);
      if (!raw) return;

      const room = RoomSchema.parse(raw);
      if (room.status !== "PLAYING") return;

      room.status = "VOTING";
      await setRoom(roomId, room);

      console.log(`🗳️  Discussion ended — room ${roomId} moved to VOTING`);
      startVotingTimer(io, roomId, room.settings.timers.votingDuration);
    } catch (error) {
      console.error(`[TimerService] Discussion timer error for room ${roomId}:`, error);
    }
  }, durationSeconds * 1000);

  activeTimers.set(roomId, timerId);
}

// ─── Voting phase timer ───────────────────────────────────────────────────────

export function startVotingTimer(
  io: Server,
  roomId: string,
  durationSeconds: number
): void {
  cancelTimer(roomId);

  console.log(`🗳️  Voting timer started for room ${roomId} (${durationSeconds}s)`);
  io.to(roomId).emit("phase_started", { phase: "VOTING", durationSeconds });

  const timerId = setTimeout(async () => {
    activeTimers.delete(roomId);
    try {
      const raw = await getRoomData(roomId);
      if (!raw) return;

      const room = RoomSchema.parse(raw);
      if (room.status !== "VOTING") return;

      console.log(`⏰ Voting timer expired for room ${roomId} — force-ending game`);

      const impostor = room.players.find((p: Player) => p.isImpostor);

      // Calculate scores inline (avoids circular import with game.service)
      room.players = calculateScores(
        room.players,
        impostor?.id ?? "",
        { reason: "time_up", eliminatedId: null },
        room.settings.mechanics.scoreMultiplier
      );

      room.status = "FINISHED";
      await setRoom(roomId, room);

      io.to(roomId).emit("vote_ended", { roomId, reason: "time_up" });
      io.to(roomId).emit("game_ended", {
        impostorId:   impostor?.id            ?? null,
        impostorName: impostor?.name          ?? "Unknown",
        secretWord:   room.word?.word         ?? "Unknown",
        category:     room.word?.category     ?? "Unknown",
        players:      room.players,
        reason:       "time_up",
      });
    } catch (error) {
      console.error(`[TimerService] Voting timer error for room ${roomId}:`, error);
    }
  }, durationSeconds * 1000);

  activeTimers.set(roomId, timerId);
}

// ─── Hint timer ───────────────────────────────────────────────────────────────

export function startHintTimer(
  io: Server,
  roomId: string,
  hints: string[],
  revealAtSecond: number
): void {
  // Cancel any leftover hint timer for this room
  const existing = activeHintTimers.get(roomId);
  if (existing) {
    clearTimeout(existing);
    activeHintTimers.delete(roomId);
  }

  console.log(`💡 Hint timer set for room ${roomId} — fires at ${revealAtSecond}s`);

  const timerId = setTimeout(() => {
    activeHintTimers.delete(roomId);
    const hint = selectHint(hints);
    console.log(`💡 Hint revealed for room ${roomId}: "${hint}"`);
    io.to(roomId).emit("hint_revealed", { hint });
  }, revealAtSecond * 1000);

  activeHintTimers.set(roomId, timerId);
}

// ─── Clear all timers for a room ──────────────────────────────────────────────

export function clearRoomTimers(roomId: string): void {
  cancelTimer(roomId);

  const hintTimer = activeHintTimers.get(roomId);
  if (hintTimer) {
    clearTimeout(hintTimer);
    activeHintTimers.delete(roomId);
  }

  console.log(`🧹 All timers cleared for room ${roomId}`);
}