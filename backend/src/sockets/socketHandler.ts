import { Server, Socket } from "socket.io";
import { registerRoomHandlers } from "./handlers/room.handler";
import { registerGameHandlers } from "./handlers/game.handler";
import { registerChatHandlers } from "./handlers/chat.handler";

export const setupSocketHandlers = (io: Server): void => {
  io.on("connection", (socket: Socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    registerRoomHandlers(io, socket);
    registerGameHandlers(io, socket);
    registerChatHandlers(io, socket);
  });
};