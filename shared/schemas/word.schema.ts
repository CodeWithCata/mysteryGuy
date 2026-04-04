import { z } from "zod";
import { DifficultyEnum, DEFAULT_DIFFICULTY } from "./constants.schema";

export const GameWordSchema = z.object({
  category: z.string(),
  word: z.string().min(1),
  hints: z.array(z.string().min(3)).length(3),
  difficulty: DifficultyEnum.default(DEFAULT_DIFFICULTY),
});

export type GameWord = z.infer<typeof GameWordSchema>;