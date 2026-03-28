import { z } from "zod";

export const PlayerSchema = z.object({
  id: z.string().uuid(), // Socket ID or unique UUID
  name: z.string().min(2).max(15).trim(),
  isHost: z.boolean().default(false),
  isAlive: z.boolean().default(true),
  isImpostor: z.boolean().default(false),
  score: z.number().int().nonnegative().default(0),
});

export type Player = z.infer<typeof PlayerSchema>;