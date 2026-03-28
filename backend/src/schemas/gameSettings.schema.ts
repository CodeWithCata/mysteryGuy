import { z } from "zod";
import { DifficultyEnum, DEFAULT_DIFFICULTY } from "./constants.schema";
export const GameSettingsSchema = z.object({
  roomConfig: z.object({
    maxPlayers: z.number().min(3).max(20).default(10),
    isPrivate: z.boolean().default(false),
    language: z.enum(["en", "es", "fr", "ro"]).default("en"),
  }),
  gameplay: z.object({
    difficulty: DifficultyEnum.default(DEFAULT_DIFFICULTY),
    selectedCategory: z.string().default("All"),
    impostorCount: z.number().min(1).max(3).default(1),
    revealRoleOnElimination: z.boolean().default(true),
  }),
  timers: z.object({
    lobbyWaitTime: z.number().min(5).max(120).default(30),
    discussionDuration: z.number().min(10).max(600).default(90),
    votingDuration: z.number().min(5).max(120).default(30),
    resultDisplayDuration: z.number().min(3).max(30).default(10),
  }),
  mechanics: z.object({
    allowImpostorGuess: z.boolean().default(true),
    anonymousVoting: z.boolean().default(false),
    scoreMultiplier: z.number().min(1).max(5).default(1.5),
    hintSystem: z.object({
      enabled: z.boolean().default(true),
      revealHintAtSecond: z.number().min(0).default(45),
    }),
  }),
});

// Use .infer to create the TypeScript type for your game state
export type GameSettings = z.infer<typeof GameSettingsSchema>;