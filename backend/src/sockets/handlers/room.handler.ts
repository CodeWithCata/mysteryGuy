import { Server, Socket } from "socket.io";
import { Player, SocketJoinSchema } from "@shared/index";
import { getRoom, handlePlayerDisconnect, resetRoom } from "@/services/room.service";
import { setSocketMapping, getSocketMapping, deleteSocketMapping } from "@/lib/redis.helpers";
import { safeHandler } from "@/sockets/utils/safeHandler";

export function registerRoomHandlers(io: Server, socket: Socket): void {

  // ── JOIN ROOM ──────────────────────────────────────────────────────────────
  socket.on(
    "join_room",
    safeHandler(socket, async (data) => {
      const validation = SocketJoinSchema.safeParse(data);
      if (!validation.success) {
        socket.emit("error", { message: "Invalid room or player ID format" });
        return;
      }

      const { roomId, playerId } = validation.data;
      const room   = await getRoom(roomId);
      const player = room.players.find((p : Player) => p.id === playerId);

      if (!player) {
        socket.emit("error", { message: "Player not found in this room" });
        return;
      }

      await setSocketMapping(socket.id, { playerId, roomId });
      socket.join(roomId);

      io.to(roomId).emit("player_joined", {
        players:   room.players,
        newPlayer: player,
      });
    })
  );

  // ── RESET ROOM (play again) ────────────────────────────────────────────────
  socket.on(
    "reset_room",
    safeHandler(socket, async (data) => {
      const { roomId, playerId } = data;
      if (!roomId || !playerId) {
        socket.emit("error", { message: "roomId and playerId are required." });
        return;
      }

      const room = await resetRoom(roomId, playerId);

      // Broadcast the clean state to everyone in the room
      io.to(roomId).emit("room_reset", {
        status:  room.status,
        players: room.players,
      });
    })
  );

  // ── DISCONNECT ─────────────────────────────────────────────────────────────
  socket.on(
    "disconnect",
    safeHandler(socket, async () => {
      console.log(`❌ User disconnected: ${socket.id}`);

      const mapping = await getSocketMapping(socket.id);
      if (!mapping) return;

      await deleteSocketMapping(socket.id);

      const { room, wasHostMigrated, newHostId } =
        await handlePlayerDisconnect(mapping.roomId, mapping.playerId);

      if (!room) {
        console.log(`🗑️ Room ${mapping.roomId} deleted — no players left`);
        return;
      }

      io.to(mapping.roomId).emit("player_disconnected", {
        playerId: mapping.playerId,
        players:  room.players,
      });

      if (wasHostMigrated && newHostId) {
        io.to(mapping.roomId).emit("host_migrated", { newHostId });
        console.log(`👑 Host migrated to ${newHostId} in room ${mapping.roomId}`);
      }
    })
  );
}