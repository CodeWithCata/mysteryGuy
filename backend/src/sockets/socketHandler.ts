import { Server, Socket } from "socket.io";
import { registerRoomHandlers } from "./handlers/room.handler";
import { registerGameHandlers } from "./handlers/game.handler";

/**
 * Entry point for all socket logic.
 * Only responsible for accepting connections and delegating to handlers.
 * No game logic lives here.
 */
export const setupSocketHandlers = (io: Server): void => {
  io.on("connection", (socket: Socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    registerRoomHandlers(io, socket);
    registerGameHandlers(io, socket);
  });
};