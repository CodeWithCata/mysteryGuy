import { Server, Socket } from "socket.io";
import { sendMessage } from "@/services/chat.service";
import { safeHandler } from "@/sockets/utils/safeHandler";

export function registerChatHandlers(io: Server, socket: Socket): void {

  // ── SEND MESSAGE ───────────────────────────────────────────────────────────
  socket.on(
    "send_message",
    safeHandler(socket, async (data) => {
      const { roomId } = data;
      if (!roomId) {
        socket.emit("error", { message: "roomId is required." });
        return;
      }

      const result = await sendMessage(roomId, data.playerId, data.message);

      // Broadcast to the entire room so everyone sees it
      io.to(roomId).emit("new_message", result);
    })
  );
}