// services/room.service.ts
import { Room,RoomSchema } from "@/schemas/room.schema";
import {getRoomData,setRoom,deleteRoom} from "@/lib/redis.helpers";
import { clearRoomTimers } from "@/services/timer.service";

export const ensureNameIsUnique = (room: Room, name: string): void => {
  const isTaken = room.players.some(
    (p) => p.name.toLowerCase() === name.toLowerCase()
  );
  if (isTaken) {
    throw new Error("This name is already taken in this room.");
  }
};

/**
 * Check if the room has reached its maximum capacity
 */
export const ensureRoomIsNotFull = (room: Room): void => {
  if (room.players.length >= room.settings.roomConfig.maxPlayers) {
    throw new Error("This room is already full.");
  }
};

/**
 * Check if the room is still in the LOBBY state
 */
export const ensureRoomIsJoinable = (room: Room): void => {
  if (room.status !== "LOBBY") {    
    throw new Error("Cannot join a game that has already started.");
  }
};



interface MigrateHostResult {
  room: Room | null;
  newHostId: string | null;
  wasHostMigrated: boolean;
}

export async function handlePlayerDisconnect(
  roomId: string,
  playerId: string
): Promise<MigrateHostResult> {
  const raw = await getRoomData(roomId);
  if (!raw) return { room: null, newHostId: null, wasHostMigrated: false };

  const room = RoomSchema.parse(raw);

  if (room.status === "PLAYING" || room.status === "VOTING") {
    const player = room.players.find((p) => p.id === playerId);
    if (player) player.online = false;

    await setRoom(roomId, room);
    return { room, newHostId: null, wasHostMigrated: false };
  }

  room.players = room.players.filter((p) => p.id !== playerId);

  if (room.players.length === 0) {
    await deleteRoom(roomId);
    clearRoomTimers(roomId);
    return { room: null, newHostId: null, wasHostMigrated: false };
  }

  const wasHost = room.hostId === playerId;
  if (wasHost) {
    const newHost = room.players[0];
    newHost.isHost = true;
    room.hostId = newHost.id;

    await setRoom(roomId, room);
    return { room, newHostId: newHost.id, wasHostMigrated: true };
  }

  await setRoom(roomId, room);
  return { room, newHostId: null, wasHostMigrated: false };
}

// ─────────────────────────────────────────────────────────────────────────────

export async function getRoom(roomId: string): Promise<Room> {
  const raw = await getRoomData(roomId);
  if (!raw) throw new Error("Room not found.");
  return RoomSchema.parse(raw);
}
