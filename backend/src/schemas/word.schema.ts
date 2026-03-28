import { z } from "zod";
import { DifficultyEnum, DEFAULT_DIFFICULTY } from "./constants.schema";
export const WordEntrySchema = z.object({
  _id: z.any().optional(), // MongoDB ObjectId
  category: z.string(),
  data: z.array(
    z.object({
      word: z.string().min(1),
      hint: z.string().min(3),
    })
  ),
  difficulty: DifficultyEnum.default(DEFAULT_DIFFICULTY),  
});

export type WordEntry = z.infer<typeof WordEntrySchema>;