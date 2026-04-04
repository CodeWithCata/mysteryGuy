import { z } from "zod";

// The single source of truth for options
export const DifficultyEnum = z.enum(["EASY", "MEDIUM", "HARD"]);

// The single source of truth for the DEFAULT value
export const DEFAULT_DIFFICULTY = "MEDIUM" as const;

export type Difficulty = z.infer<typeof DifficultyEnum>;