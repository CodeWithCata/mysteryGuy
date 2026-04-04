import { Room } from "@/schemas/room.schema";
import { getRandomWordPair } from "./word.service";
import { setupGameRound, processVotes, resolveGuess, calculateScores, ScoreContext } from "@/core/game.logic";
import { Player } from "@/schemas/player.schema";
import { startDiscussionTimer, startHintTimer, clearRoomTimers } from "./timer.service";
import { Server } from "socket.io";
import { getRoom } from "./room.service";
import { setRoom } from "@/lib/redis.helpers";
import { GuessWordSchema } from "@/schemas/game.schema";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StartGameResult {
  status:  Room["status"];
  players: (Player & { assignedWord: string })[];
  roomId:  string;
}

export interface CastVoteResult {
  room:      Room;
  allVoted:  boolean;
  eliminated: Player | null;
}

export interface EndGamePayload {
  impostorId:   string;
  impostorName: string;
  secretWord:   string;
  category:     string;
  players:      Player[];
}

export interface GuessWordResult {
  isCorrect:  boolean;
  secretWord: string;
  playerId:   string;
}

// ─── Start Game ───────────────────────────────────────────────────────────────

export async function startGame(
  io: Server,
  roomId: string,
  playerId: string
): Promise<StartGameResult> {
  const room = await getRoom(roomId);

  if (room.hostId !== playerId) throw new Error("Only the host can start the game.");
  if (room.status !== "LOBBY")  throw new Error("Game has already started.");
  if (room.players.length < 3)  throw new Error("At least 3 players are required to start.");

  const wordData = await getRandomWordPair(
    room.settings.gameplay.difficulty,
    room.settings.gameplay.selectedCategory
  );

  const { players } = setupGameRound(room.players, wordData);

  room.players = players;
  room.status  = "PLAYING";
  room.word    = wordData;

  await setRoom(roomId, room);

  startDiscussionTimer(io, roomId, room.settings.timers.discussionDuration);

  // Start hint timer if enabled — fires mid-discussion
  if (room.settings.mechanics.hintSystem.enabled) {
    startHintTimer(
      io,
      roomId,
      wordData.hints,
      room.settings.mechanics.hintSystem.revealHintAtSecond
    );
  }

  return {
    roomId,
    status:  room.status,
    players: room.players as (Player & { assignedWord: string })[],
  };
}

// ─── Cast Vote ────────────────────────────────────────────────────────────────

export async function castVote(
  roomId: string,
  voterId: string,
  targetId: string
): Promise<CastVoteResult> {
  const room = await getRoom(roomId);

  if (room.status !== "VOTING") throw new Error("Voting is not open right now.");

  const voter = room.players.find((p) => p.id === voterId);
  if (!voter)                  throw new Error("Voter not found in this room.");
  if (!voter.online)           throw new Error("Offline players cannot vote.");
  if (voter.votedFor !== null) throw new Error("You have already voted.");
  if (voterId === targetId)    throw new Error("You cannot vote for yourself.");

  const target = room.players.find((p) => p.id === targetId);
  if (!target) throw new Error("Target player not found.");

  voter.votedFor = targetId;

  const { allVoted, eliminatedId } = processVotes(room.players);

  const eliminated = allVoted && eliminatedId
    ? room.players.find((p) => p.id === eliminatedId) ?? null
    : null;

  await setRoom(roomId, room);

  return { room, allVoted, eliminated };
}

// ─── Guess Word ───────────────────────────────────────────────────────────────

export async function guessWord(
  roomId: string,
  playerId: string,
  guessedWord: string
): Promise<GuessWordResult> {
  const validation = GuessWordSchema.safeParse({ playerId, guessedWord });
  if (!validation.success) throw new Error("Invalid guess format.");

  const room = await getRoom(roomId);

  if (room.status !== "PLAYING")
    throw new Error("Guessing is only allowed during the discussion phase.");
  if (!room.settings.mechanics.allowImpostorGuess)
    throw new Error("Impostor guessing is disabled in this room.");

  const player = room.players.find((p) => p.id === playerId);
  if (!player)            throw new Error("Player not found in this room.");
  if (!player.isImpostor) throw new Error("Only the impostor can guess the word.");
  if (!player.online)     throw new Error("Offline players cannot guess.");
  if (!room.word)         throw new Error("Internal error: No word data found.");

  const isCorrect = resolveGuess(validation.data.guessedWord, room.word.word);

  return { isCorrect, secretWord: room.word.word, playerId };
}

// ─── End Game ─────────────────────────────────────────────────────────────────

export async function endGame(
  io: Server,
  roomId: string,
  context: ScoreContext = { reason: "vote", eliminatedId: null }
): Promise<void> {
  clearRoomTimers(roomId);

  const room = await getRoom(roomId);

  // Guard: prevent double-ending if timer and last vote race each other
  if (room.status === "FINISHED") return;

  const impostor = room.players.find((p) => p.isImpostor);
  if (!impostor)  throw new Error("Internal error: No impostor found.");
  if (!room.word) throw new Error("Internal error: No word data found.");

  // Calculate and persist scores before marking the room finished
  room.players = calculateScores(
    room.players,
    impostor.id,
    context,
    room.settings.mechanics.scoreMultiplier
  );

  room.status = "FINISHED";
  await setRoom(roomId, room);

  console.log(`🏁 Game finished for room ${roomId}. Impostor was: ${impostor.name}`);

  const payload: EndGamePayload = {
    impostorId:   impostor.id,
    impostorName: impostor.name,
    secretWord:   room.word.word,
    category:     room.word.category,
    players:      room.players, // includes updated scores
  };

  io.to(roomId).emit("game_ended", payload);
}