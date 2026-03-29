import { redis } from "./redis";
import { Room } from "../schemas/room.schema";

// ─── Constants ────────────────────────────────────────────────────────────────
const ROOM_TTL_SECONDS = 86400;    // 24 hours
const SOCKET_TTL_SECONDS = 86400;  // 24 hours

// ─── Key builders — one place to change key format ───────────────────────────
const keys = {
  room: (roomId: string) => `room:${roomId}`,
  socket: (socketId: string) => `socket:${socketId}`,
};

// ─── Room helpers ─────────────────────────────────────────────────────────────

export async function setRoom(roomId: string, room: Room): Promise<void> {
  await redis.setex(keys.room(roomId), ROOM_TTL_SECONDS, JSON.stringify(room));
}

export async function getRoomData(roomId: string): Promise<Room | null> {
  const data = await redis.get(keys.room(roomId));
  if (!data) return null;
  return JSON.parse(data) as Room;
}

export async function deleteRoom(roomId: string): Promise<void> {
  await redis.del(keys.room(roomId));
}

// ─── Socket mapping helpers ───────────────────────────────────────────────────

export interface SocketMapping {
  playerId: string;
  roomId: string;
}

export async function setSocketMapping(
  socketId: string,
  mapping: SocketMapping
): Promise<void> {
  await redis.set(
    keys.socket(socketId),
    JSON.stringify(mapping),
    "EX",
    SOCKET_TTL_SECONDS
  );
}

export async function getSocketMapping(
  socketId: string
): Promise<SocketMapping | null> {
  const data = await redis.get(keys.socket(socketId));
  if (!data) return null;
  return JSON.parse(data) as SocketMapping;
}

export async function deleteSocketMapping(socketId: string): Promise<void> {
  await redis.del(keys.socket(socketId));
}