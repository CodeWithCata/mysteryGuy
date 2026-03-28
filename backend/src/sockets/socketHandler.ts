import { Server, Socket } from "socket.io";
import { redis } from "../lib/redis";
import { RoomSchema } from "../schemas/room.schema";

import {SocketJoinSchema} from "../schemas/room.schema";




export const setupSocketHandlers = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    // 1. Join a specific Room
    socket.on("join_room", async (data) => {
  // 1. SANITIZE: Validate the socket payload immediately
  const validation = SocketJoinSchema.safeParse(data);
  
  if (!validation.success) {
    socket.emit("error", { message: "Invalid room or player ID format" });
    return;
  }

  const { roomId, playerId } = validation.data;

  // 2. FETCH: Get the room from Redis
  const roomData = await redis.get(`room:${roomId}`);
  if (!roomData) {
    socket.emit("error", { message: "Room not found" });
    return;
  }

  const room = RoomSchema.parse(JSON.parse(roomData));

  // 3. IDENTIFY: Does this playerId actually exist in this room?
  const player = room.players.find((p) => p.id === playerId);
  
  if (!player) {
    socket.emit("error", { message: "Player not found in this room" });
    return;
  }

  // 4. EXECUTE: Join the socket room and notify others
  socket.join(roomId);
  
  io.to(roomId).emit("player_joined", {
    players: room.players,
    newPlayer: player
  });
});

    
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};