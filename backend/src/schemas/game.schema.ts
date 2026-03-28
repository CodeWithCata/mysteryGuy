import { z } from "zod";

// Validating a "Vote" event
export const VoteEventSchema = z.object({
  voterId: z.string().uuid(),
  targetId: z.string().uuid(),
});

// Validating a "Guess" event (if the impostor tries to guess the word)
export const GuessWordSchema = z.object({
  playerId: z.string().uuid(),
  guessedWord: z.string().min(1).trim().toLowerCase(),
});

export type VoteEvent = z.infer<typeof VoteEventSchema>;