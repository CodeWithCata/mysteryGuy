import { Server, Socket } from "socket.io";
import { startGame, castVote } from "../../services/game.service";
import { VoteEventSchema } from "../../schemas/game.schema";
import { safeHandler } from "../utils/safeHandler";

export function registerGameHandlers(io: Server, socket: Socket): void {

  // ── START GAME ─────────────────────────────────────────────────────────────
  socket.on(
    "start_game",
    safeHandler(socket, async ({ roomId, playerId }) => {
      const result = await startGame(io, roomId, playerId);

      io.to(roomId).emit("game_started", {
        status: result.status,
        players: result.players,
      });
      // phase_started is emitted automatically inside startDiscussionTimer
    })
  );

  // ── CAST VOTE ──────────────────────────────────────────────────────────────
  socket.on(
    "cast_vote",
    safeHandler(socket, async (data) => {
      // Validate payload shape with existing VoteEventSchema
      const validation = VoteEventSchema.safeParse(data);
      if (!validation.success) {
        socket.emit("error", { message: "Invalid vote format." });
        return;
      }

      const { voterId, targetId } = validation.data;

      // VoteEventSchema only has voterId + targetId — roomId comes separately
      const { roomId } = data;
      if (!roomId) {
        socket.emit("error", { message: "roomId is required." });
        return;
      }

      const { room, allVoted, eliminated } = await castVote(
        roomId,
        voterId,
        targetId
      );

      // Always broadcast the updated player list so everyone sees who voted
      io.to(roomId).emit("vote_cast", {
        players: room.players,
        voterId,
      });

      // If not everyone voted yet — done for now
      if (!allVoted) return;

      // All votes in — broadcast the elimination result
      if (!eliminated) {
        // Tie — no elimination
        io.to(roomId).emit("vote_result", {
          eliminated: null,
          message: "It's a tie! No one was eliminated.",
          players: room.players,
        });
      } else {
        io.to(roomId).emit("vote_result", {
          eliminated: {
            id: eliminated.id,
            name: eliminated.name,
            wasImpostor: eliminated.isImpostor,
          },
          players: room.players,
        });
      }
    })
  );

  // ──SHOW RESULTS ──────────────────────────────────────────────────────────────
  socket.on(
    "game_ended",
    safeHandler(socket, async ({ roomId }) => { 



 } ))

}