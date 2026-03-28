import { z } from "zod";
import { PlayerSchema } from "./player.schema";
import { GameSettingsSchema } from "./gameSettings.schema";
export const RoomStatusEnum = z.enum(["LOBBY", "STARTING", "PLAYING", "VOTING", "FINISHED"]);

export const RoomSchema = z.object({
  roomId: z.string().length(6).toUpperCase(),
  hostId: z.string().uuid(), // To track who can change settings
  status: RoomStatusEnum.default("LOBBY"),
  players: z.array(PlayerSchema),
  
  // The settings JSON you provided
  settings: GameSettingsSchema, 
  
  category: z.string().nullable() , 
  word: z.string().nullable(),     
  hint: z.string().nullable(),      // Added this for your new hint logic
  
  createdAt: z.number().default(() => Date.now()), // Auto-generate timestamp
});

export type Room = z.infer<typeof RoomSchema>;

export const CreateRoomSchema = z.object({
  hostName: z.string().min(2).max(15).trim(),
});