import { Server, Socket } from "socket.io";
import { startGame, castVote, guessWord, endGame } from "@/services/game.service";
import { VoteEventSchema, GuessWordSchema } from "@/schemas/game.schema";
import { safeHandler } from "@/sockets/utils/safeHandler";

export function registerGameHandlers(io: Server, socket: Socket): void {

  // ── START GAME ─────────────────────────────────────────────────────────────
  socket.on(
    "start_game",
    safeHandler(socket, async ({ roomId, playerId }) => {
      const result = await startGame(io, roomId, playerId);

      io.to(roomId).emit("game_started", {
        status:  result.status,
        players: result.players,
      });
      // "phase_started" (DISCUSSION) emitted by startDiscussionTimer
      // "hint_revealed" emitted by startHintTimer if enabled
    })
  );

  // ── CAST VOTE ──────────────────────────────────────────────────────────────
  socket.on(
    "cast_vote",
    safeHandler(socket, async (data) => {
      const validation = VoteEventSchema.safeParse(data);
      if (!validation.success) {
        socket.emit("error", { message: "Invalid vote format." });
        return;
      }

      const { voterId, targetId } = validation.data;
      const { roomId } = data;

      if (!roomId) {
        socket.emit("error", { message: "roomId is required." });
        return;
      }

      const { room, allVoted, eliminated } = await castVote(roomId, voterId, targetId);

      io.to(roomId).emit("vote_cast", { players: room.players, voterId });

      if (!allVoted) return;

      if (!eliminated) {
        io.to(roomId).emit("vote_result", {
          eliminated: null,
          message:    "It's a tie! No one was eliminated.",
          players:    room.players,
        });
      } else {
        io.to(roomId).emit("vote_result", {
          eliminated: {
            id:          eliminated.id,
            name:        eliminated.name,
            wasImpostor: eliminated.isImpostor,
          },
          players: room.players,
        });
      }

      // Pass the elimination context so scores are calculated correctly
      await endGame(io, roomId, {
        reason:       "vote",
        eliminatedId: eliminated?.id ?? null,
      });
    })
  );

  // ── GUESS WORD ─────────────────────────────────────────────────────────────
  socket.on(
    "guess_word",
    safeHandler(socket, async (data) => {
      const validation = GuessWordSchema.safeParse(data);
      if (!validation.success) {
        socket.emit("error", { message: "Invalid guess format." });
        return;
      }

      const { playerId, guessedWord } = validation.data;
      const { roomId } = data;

      if (!roomId) {
        socket.emit("error", { message: "roomId is required." });
        return;
      }

      const result = await guessWord(roomId, playerId, guessedWord);

      if (result.isCorrect) {
        io.to(roomId).emit("guess_result", {
          correct:  true,
          playerId,
          message:  "The impostor guessed the word! Impostor wins!",
        });
        await endGame(io, roomId, { reason: "correct_guess", eliminatedId: null });
      } else {
        socket.emit("guess_result", {
          correct: false,
          message: "Wrong guess. The discussion continues.",
        });
      }
    })
  );
}