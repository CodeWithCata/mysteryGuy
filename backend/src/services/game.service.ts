import { RoomSchema, Room } from "@/schemas/room.schema";
import { getRandomWordPair } from "./word.service";
import { setupGameRound,processVotes } from "@/core/game.logic";
import { Player } from "@/schemas/player.schema";
import { startDiscussionTimer, clearRoomTimers } from "./timer.service";
import { Server } from "socket.io";
import { getRoom } from "./room.service";
import { setRoom } from "@/lib/redis.helpers";


import { PlayerSchema } from "../schemas/player.schema";
export interface StartGameResult {
  status: Room["status"];
  players: (Player & { assignedWord: string })[];
  roomId: string;
}



export interface CastVoteResult {
  room: Room;
  allVoted: boolean;
  eliminated: Player | null; // null = tie, no one eliminated
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

export async function castVote(
  roomId: string,
  voterId: string,
  targetId: string
): Promise<CastVoteResult> {
  const room = await getRoom(roomId);

  // ── 1. Guards ──────────────────────────────────────────────────────────────
  if (room.status !== "VOTING") {
    throw new Error("Voting is not open right now.");
  }

  const voter = room.players.find((p) => p.id === voterId);
  if (!voter) throw new Error("Voter not found in this room.");
  if (!voter.online) throw new Error("Offline players cannot vote.");
  if (voter.votedFor !== null) throw new Error("You have already voted.");
  if (voterId === targetId) throw new Error("You cannot vote for yourself.");

  const target = room.players.find((p) => p.id === targetId);
  if (!target) throw new Error("Target player not found.");

  // ── 2. Register vote ───────────────────────────────────────────────────────
  voter.votedFor = targetId;

  // ── 3. Tally & Process (Core Logic) ────────────────────────────────────────
  const { allVoted, eliminatedId } = processVotes(room.players);

  // ── 4. Handle Results ──────────────────────────────────────────────────────
  let eliminated = null;

  if (allVoted && eliminatedId) {
    eliminated = room.players.find((p) => p.id === eliminatedId) || null;
    // Note: If you want to mark them as 'out' in the state, do it here.
  }

  // ── 5. Persist & Return ────────────────────────────────────────────────────
  await setRoom(roomId, room);

  return { 
    room, 
    allVoted, 
    eliminated 
  };
}



// ─────────────────────────────────────────────────────────────────────────────

export async function endGame(io: Server, roomId: string): Promise<void> {
  clearRoomTimers(roomId);

  const impostor = await getRoom(roomId).then((room) =>
    room.players.find((p) => p.isImpostor)
  );
  const validation = PlayerSchema.safeParse(impostor);
  if (!validation.success) {
    console.error("Invalid impostor data:", validation.error.format());
    throw new Error("Internal error: Invalid impostor data.");
  }
  const {id,isImpostor} = validation.data;
  
  io.to(roomId).emit("game_ended", { message: "Game has ended. Thanks for playing!" });


}
