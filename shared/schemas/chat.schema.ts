import { z } from "zod";

export const ChatMessageSchema = z.object({
  playerId: z.string().uuid(),
  message:  z.string().min(1).max(200).trim(),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;