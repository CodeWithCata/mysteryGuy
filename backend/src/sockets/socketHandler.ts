import { Server, Socket } from "socket.io";
import { SocketJoinSchema } from "../schemas/room.schema";
import { startGame, getRoom, handlePlayerDisconnect } from "../services/game.service";
import { redis } from "../lib/redis";

// ─── Utility: wraps async socket handlers so unhandled errors
//     never silently crash the event loop ────────────────────────────────────
const safeHandler = (
  socket: Socket,
  fn: (data: any) => Promise<void>
) => async (data: any) => {
  try {
    await fn(data);
  } catch (error: any) {
    console.error(`[Socket Error] ${error.message}`);
    socket.emit("error", { message: error.message ?? "Internal server error" });
  }
};

export const setupSocketHandlers = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    // ── 1. JOIN ROOM ─────────────────────────────────────────────────────────
    socket.on(
      "join_room",
      safeHandler(socket, async (data) => {
        const validation = SocketJoinSchema.safeParse(data);
        if (!validation.success) {
          socket.emit("error", { message: "Invalid room or player ID format" });
          return;
        }

        const { roomId, playerId } = validation.data;
        const room = await getRoom(roomId);

        const player = room.players.find((p) => p.id === playerId);
        if (!player) {
          socket.emit("error", { message: "Player not found in this room" });
          return;
        }

        // Map socketId → { playerId, roomId } — needed for disconnect handling
        await redis.set(
          `socket:${socket.id}`,
          JSON.stringify({ playerId, roomId }),
          "EX",
          86400
        );

        socket.join(roomId);

        io.to(roomId).emit("player_joined", {
          players: room.players,
          newPlayer: player,
        });
      })
    );

    // ── 2. START GAME ────────────────────────────────────────────────────────
    // io is passed to startGame so it can fire the discussion timer internally
    socket.on(
      "start_game",
      safeHandler(socket, async ({ roomId, playerId }) => {
        const result = await startGame(io, roomId, playerId);

        io.to(roomId).emit("game_started", {
          status: result.status,
          players: result.players,
        });

        // phase_started (DISCUSSION + duration) is emitted inside startDiscussionTimer
        // so the frontend gets it automatically — no extra emit needed here
      })
    );

    // ── 3. DISCONNECT ────────────────────────────────────────────────────────
    socket.on(
      "disconnect",
      safeHandler(socket, async () => {
        console.log(`❌ User disconnected: ${socket.id}`);

        const mapping = await redis.get(`socket:${socket.id}`);
        if (!mapping) return;

        const { playerId, roomId } = JSON.parse(mapping);
        await redis.del(`socket:${socket.id}`);

        const { room, wasHostMigrated, newHostId } =
          await handlePlayerDisconnect(roomId, playerId);

        if (!room) {
          console.log(`🗑️ Room ${roomId} deleted — no players left`);
          return;
        }

        io.to(roomId).emit("player_disconnected", {
          playerId,
          players: room.players,
        });

        if (wasHostMigrated && newHostId) {
          io.to(roomId).emit("host_migrated", { newHostId });
          console.log(`👑 Host migrated to ${newHostId} in room ${roomId}`);
        }
      })
    );
  });
};