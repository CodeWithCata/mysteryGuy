import { Server } from "socket.io";
import { RoomSchema } from "@/schemas/room.schema";
import { getRoomData, setRoom } from "@/lib/redis.helpers";

// In-memory map: roomId → active timer
const activeTimers = new Map<string, NodeJS.Timeout>();

// ─── Cancel a room's active timer ─────────────────────────────────────────────
export function cancelTimer(roomId: string): void {
  if (activeTimers.has(roomId)) {
    clearTimeout(activeTimers.get(roomId)!);
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

      console.log(`⏰ Voting timer expired for room ${roomId}`);
      io.to(roomId).emit("vote_ended", { roomId });
    } catch (error) {
      console.error(`[TimerService] Voting timer error for room ${roomId}:`, error);
    }
  }, durationSeconds * 1000);

  activeTimers.set(roomId, timerId);
}

// ─── Clean up all timers for a room ──────────────────────────────────────────
export function clearRoomTimers(roomId: string): void {
  cancelTimer(roomId);
  console.log(`🧹 All timers cleared for room ${roomId}`);
}