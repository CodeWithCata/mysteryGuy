import { getRoom } from "./room.service";
import { ChatMessageSchema } from "@/schemas/chat.schema";

export interface ChatResult {
  playerId:   string;
  playerName: string;
  message:    string;
  timestamp:  number;
}

export async function sendMessage(
  roomId: string,
  playerId: string,
  message: string
): Promise<ChatResult> {
  const validation = ChatMessageSchema.safeParse({ playerId, message });
  if (!validation.success) throw new Error("Invalid message format.");

  const room = await getRoom(roomId);

  if (room.status !== "PLAYING")
    throw new Error("Chat is only available during the discussion phase.");

  const player = room.players.find((p) => p.id === playerId);
  if (!player)        throw new Error("Player not found in this room.");
  if (!player.online) throw new Error("Offline players cannot send messages.");

  return {
    playerId,
    playerName: player.name,
    message:    validation.data.message,
    timestamp:  Date.now(),
  };
}