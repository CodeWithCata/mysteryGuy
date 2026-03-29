import { Server, Socket } from "socket.io";
import { startGame } from "../../services/game.service";
import { safeHandler } from "../utils/safeHandler";

export function registerGameHandlers(io: Server, socket: Socket): void {

  // ── START GAME ─────────────────────────────────────────────────────────────
  // io is passed to startGame so it can fire the discussion timer internally.
  // phase_started (DISCUSSION + duration) is emitted inside startDiscussionTimer
  // automatically — no extra emit needed here.
  socket.on(
    "start_game",
    safeHandler(socket, async ({ roomId, playerId }) => {
      const result = await startGame(io, roomId, playerId);

      io.to(roomId).emit("game_started", {
        status: result.status,
        players: result.players,
      });
    })
  );

  // cast_vote, guess_word, and other game events go here as you build them
}