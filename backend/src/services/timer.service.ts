import { Server } from "socket.io";
import { redis } from "../lib/redis";
import { RoomSchema } from "../schemas/room.schema";

// In-memory map: roomId → active timer
// Lives in the Node.js process — survives for the lifetime of the server
const activeTimers = new Map<string, NodeJS.Timeout>();

// ─── Cancel a room's active timer (call before starting a new one) ────────────
export function cancelTimer(roomId: string): void {
  if (activeTimers.has(roomId)) {
    clearTimeout(activeTimers.get(roomId)!);
    activeTimers.delete(roomId);
    console.log(`⏹️  Timer cancelled for room ${roomId}`);
  }
}

// ─── Start the discussion phase timer ────────────────────────────────────────
// When it expires → automatically transitions to VOTING
export function startDiscussionTimer(io: Server, roomId: string, durationSeconds: number): void {
  cancelTimer(roomId); // double-start protection

  console.log(`💬 Discussion timer started for room ${roomId} (${durationSeconds}s)`);

  // Broadcast to all clients how long the discussion phase lasts
  io.to(roomId).emit("phase_started", {
    phase: "DISCUSSION",
    durationSeconds,
  });

  const timerId = setTimeout(async () => {
    activeTimers.delete(roomId);

    try {
      const roomData = await redis.get(`room:${roomId}`);
      if (!roomData) return;

      const room = RoomSchema.parse(JSON.parse(roomData));

      // Guard: only transition if still in PLAYING
      if (room.status !== "PLAYING") return;

      room.status = "VOTING";
      await redis.setex(`room:${roomId}`, 86400, JSON.stringify(room));

      console.log(`🗳️  Discussion ended — room ${roomId} moved to VOTING`);

      // Start the voting timer immediately
      startVotingTimer(io, roomId, room.settings.timers.votingDuration);

    } catch (error) {
      console.error(`[TimerService] Discussion timer error for room ${roomId}:`, error);
    }
  }, durationSeconds * 1000);

  activeTimers.set(roomId, timerId);
}

// ─── Start the voting phase timer ────────────────────────────────────────────
// When it expires → emit vote_ended so game.service can tally results
export function startVotingTimer(io: Server, roomId: string, durationSeconds: number): void {
  cancelTimer(roomId); // double-start protection

  console.log(`🗳️  Voting timer started for room ${roomId} (${durationSeconds}s)`);

  io.to(roomId).emit("phase_started", {
    phase: "VOTING",
    durationSeconds,
  });

  const timerId = setTimeout(async () => {
    activeTimers.delete(roomId);

    try {
      const roomData = await redis.get(`room:${roomId}`);
      if (!roomData) return;

      const room = RoomSchema.parse(JSON.parse(roomData));

      // Guard: only fire if still in VOTING
      if (room.status !== "VOTING") return;

      console.log(`⏰ Voting timer expired for room ${roomId}`);

      // Signal the socket handler to tally votes and resolve the round
      io.to(roomId).emit("vote_ended", { roomId });

    } catch (error) {
      console.error(`[TimerService] Voting timer error for room ${roomId}:`, error);
    }
  }, durationSeconds * 1000);

  activeTimers.set(roomId, timerId);
}

// ─── Clean up all timers for a room (call on FINISHED or room deletion) ───────
export function clearRoomTimers(roomId: string): void {
  cancelTimer(roomId);
  console.log(`🧹 All timers cleared for room ${roomId}`);
}