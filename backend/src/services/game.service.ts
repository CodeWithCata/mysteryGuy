import { redis } from "../lib/redis";
import { RoomSchema, Room } from "../schemas/room.schema";
import { WordService } from "./word.service";
import { setupGameRound } from "../core/game.logic";
import { Player } from "../schemas/player.schema";
import { startDiscussionTimer, clearRoomTimers } from "./timer.service";
import { Server } from "socket.io";

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

  const wordData = await WordService.getRandomWordPair(
    room.settings.gameplay.difficulty,
    room.settings.gameplay.selectedCategory
  );

  const { players } = setupGameRound(room.players, wordData);

  room.players = players;
  room.status = "PLAYING";
  room.word = wordData;

  await redis.setex(`room:${roomId}`, 86400, JSON.stringify(room));

  // Kick off the discussion timer — it will auto-transition to VOTING when done
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
  const roomData = await redis.get(`room:${roomId}`);
  if (!roomData) return { room: null, newHostId: null, wasHostMigrated: false };

  const room = RoomSchema.parse(JSON.parse(roomData));

  // During active game: mark as not alive, don't remove
  if (room.status === "PLAYING" || room.status === "VOTING") {
    const player = room.players.find((p) => p.id === playerId);
    if (player) player.isAlive = false;

    await redis.setex(`room:${roomId}`, 86400, JSON.stringify(room));
    return { room, newHostId: null, wasHostMigrated: false };
  }

  // In LOBBY: remove entirely
  room.players = room.players.filter((p) => p.id !== playerId);

  if (room.players.length === 0) {
    await redis.del(`room:${roomId}`);
    clearRoomTimers(roomId); // clean up any lingering timers
    return { room: null, newHostId: null, wasHostMigrated: false };
  }

  const wasHost = room.hostId === playerId;
  if (wasHost) {
    const newHost = room.players[0];
    newHost.isHost = true;
    room.hostId = newHost.id;

    await redis.setex(`room:${roomId}`, 86400, JSON.stringify(room));
    return { room, newHostId: newHost.id, wasHostMigrated: true };
  }

  await redis.setex(`room:${roomId}`, 86400, JSON.stringify(room));
  return { room, newHostId: null, wasHostMigrated: false };
}

// ─────────────────────────────────────────────────────────────────────────────

export async function getRoom(roomId: string): Promise<Room> {
  const roomData = await redis.get(`room:${roomId}`);
  if (!roomData) throw new Error("Room not found.");
  return RoomSchema.parse(JSON.parse(roomData));
}