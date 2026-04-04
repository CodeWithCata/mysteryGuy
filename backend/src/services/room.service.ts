import { Player, Room, RoomSchema } from "@shared/index";
import { getRoomData, setRoom, deleteRoom } from "@/lib/redis.helpers";
import { clearRoomTimers } from "@/services/timer.service";
import { resetPlayers } from "@/core/game.logic";

// ─── Guards ───────────────────────────────────────────────────────────────────

export const ensureNameIsUnique = (room: Room, name: string): void => {
  const isTaken = room.players.some(
    (p : Player) => p.name.toLowerCase() === name.toLowerCase()
  );
  if (isTaken) throw new Error("This name is already taken in this room.");
};

export const ensureRoomIsNotFull = (room: Room): void => {
  if (room.players.length >= room.settings.roomConfig.maxPlayers)
    throw new Error("This room is already full.");
};

export const ensureRoomIsJoinable = (room: Room): void => {
  if (room.status !== "LOBBY")
    throw new Error("Cannot join a game that has already started.");
};

// ─── Disconnect ───────────────────────────────────────────────────────────────

interface MigrateHostResult {
  room:             Room | null;
  newHostId:        string | null;
  wasHostMigrated:  boolean;
}

export async function handlePlayerDisconnect(
  roomId: string,
  playerId: string
): Promise<MigrateHostResult> {
  const raw = await getRoomData(roomId);
  if (!raw) return { room: null, newHostId: null, wasHostMigrated: false };

  const room = RoomSchema.parse(raw);

  if (room.status === "PLAYING" || room.status === "VOTING") {
    const player = room.players.find((p :Player) => p.id === playerId);
    if (player) player.online = false;
    await setRoom(roomId, room);
    return { room, newHostId: null, wasHostMigrated: false };
  }

  room.players = room.players.filter((p: Player) => p.id !== playerId);

  if (room.players.length === 0) {
    await deleteRoom(roomId);
    clearRoomTimers(roomId);
    return { room: null, newHostId: null, wasHostMigrated: false };
  }

  const wasHost = room.hostId === playerId;
  if (wasHost) {
    const newHost  = room.players[0];
    newHost.isHost = true;
    room.hostId    = newHost.id;

    await setRoom(roomId, room);
    return { room, newHostId: newHost.id, wasHostMigrated: true };
  }

  await setRoom(roomId, room);
  return { room, newHostId: null, wasHostMigrated: false };
}

// ─── Get Room ─────────────────────────────────────────────────────────────────

export async function getRoom(roomId: string): Promise<Room> {
  const raw = await getRoomData(roomId);
  if (!raw) throw new Error("Room not found.");
  return RoomSchema.parse(raw);
}

// ─── Reset Room (play again) ──────────────────────────────────────────────────

export async function resetRoom(roomId: string, playerId: string): Promise<Room> {
  const room = await getRoom(roomId);

  if (room.hostId !== playerId)   throw new Error("Only the host can reset the room.");
  if (room.status !== "FINISHED") throw new Error("Room can only be reset after the game ends.");

  // Clear game state — preserve players, settings, and scores
  room.players = resetPlayers(room.players);
  room.status  = "LOBBY";
  room.word    = null;

  await setRoom(roomId, room);
  return room;
}