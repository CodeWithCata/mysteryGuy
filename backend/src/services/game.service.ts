import { RoomSchema, Room } from "../schemas/room.schema";
import { getRandomWordPair } from "./word.service";
import { setupGameRound } from "../core/game.logic";
import { Player } from "../schemas/player.schema";
import { startDiscussionTimer, clearRoomTimers } from "./timer.service";
import { Server } from "socket.io";
import { setRoom, getRoomData, deleteRoom } from "../lib/redis.helpers";

export interface StartGameResult {
  status: Room["status"];
  players: (Player & { assignedWord: string })[];
  roomId: string;
}

export interface MigrateHostResult {
  room: Room | null;
  newHostId: string | null;
  wasHostMigrated: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────

export async function startGame(
  io: Server,
  roomId: string,
  playerId: string
): Promise<StartGameResult> {
  const room = await getRoom(roomId);

  if (room.hostId !== playerId) throw new Error("Only the host can start the game.");
  if (room.status !== "LOBBY") throw new Error("Game has already started.");
  if (room.players.length < 3) throw new Error("At least 3 players are required to start.");

 const wordData = await getRandomWordPair(
  room.settings.gameplay.difficulty,
  room.settings.gameplay.selectedCategory
);

  const { players } = setupGameRound(room.players, wordData);

  room.players = players;
  room.status = "PLAYING";
  room.word = wordData;

  await setRoom(roomId, room);

  startDiscussionTimer(io, roomId, room.settings.timers.discussionDuration);

  return {
    roomId,
    status: room.status,
    players: room.players as (Player & { assignedWord: string })[],
  };
}

// ─────────────────────────────────────────────────────────────────────────────

export async function handlePlayerDisconnect(
  roomId: string,
  playerId: string
): Promise<MigrateHostResult> {
  const raw = await getRoomData(roomId);
  if (!raw) return { room: null, newHostId: null, wasHostMigrated: false };

  const room = RoomSchema.parse(raw);

  // During active game: mark as not alive, don't remove
  if (room.status === "PLAYING" || room.status === "VOTING") {
    const player = room.players.find((p) => p.id === playerId);
    if (player) player.isAlive = false;

    await setRoom(roomId, room);
    return { room, newHostId: null, wasHostMigrated: false };
  }

  // In LOBBY: remove entirely
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