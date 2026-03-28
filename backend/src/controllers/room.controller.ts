import { Request, Response } from "express";
import { redis } from "../lib/redis";
import { CreateRoomSchema, Room } from "../schemas/room.schema";
import { Player } from "../schemas/player.schema"; // Assuming this is where it's exported
import { nanoid } from "nanoid";
import { randomUUID } from "crypto";
import {GameSettings, GameSettingsSchema} from "../schemas/gameSettings.schema";
import { PlayerSchema } from "../schemas/player.schema";
import { JoinRoomSchema } from "../schemas/room.schema";

export const createRoom = async (req: Request, res: Response) => {
  // 1. Validate Input (HostName and Settings from Dropdown)
  const validation = CreateRoomSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.format() });
  }

  const { hostName, settings } = validation.data;
  const roomId = nanoid(6).toUpperCase();
  const hostId = randomUUID();

  // 2. USE THE SCHEMA: Let Zod build the object for you.
  // We only pass the fields that AREN'T the defaults.
  const hostPlayer: Player = PlayerSchema.parse({
    id: hostId,
    name: hostName,
    isHost: true, 
  }); 

  const newRoom: Room = {
    roomId,
    hostId, 
    status: "LOBBY",
    players: [hostPlayer],
    settings,
    word: null,
    createdAt: Date.now(),
  };


 

  

  // 4. Persistence
  await redis.setex(`room:${roomId}`, 86400, JSON.stringify(newRoom));

  // 5. Response
  res.status(201).json({ 
    roomId, 
    hostId, 
    player: hostPlayer,
    message: "Room created successfully." 
  });
};





export const joinRoom = async (req: Request, res: Response) => {
  // 1. Validate Input (Using your new JoinRoomSchema)
  const validation = JoinRoomSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.format() });
  }

  // Use the validated data (cleaned/trimmed by Zod)
  const { name, roomId } = validation.data;

  // 2. Fetch existing room from Redis
  const roomKey = `room:${roomId}`;
  const roomData = await redis.get(roomKey);

  if (!roomData) {
    return res.status(404).json({ error: "Room not found." });
  }

  const room: Room = JSON.parse(roomData);

  // 3. Logic Checks: Is the room joinable?
  if (room.status !== "LOBBY") {
    return res.status(400).json({ error: "Game already started." });
  }

  if (room.players.length >= room.settings.roomConfig.maxPlayers) {
    return res.status(400).json({ error: "Room is full." });
  }


  const newPlayer: Player = PlayerSchema.parse({
    id: randomUUID(),
    name: name,
    isHost: false,
  });

  // 5. Update the Room
  room.players.push(newPlayer);
  
  // Save the updated room back to Redis
  await redis.setex(roomKey, 86400, JSON.stringify(room));

  // 6. Response
  res.status(200).json({ 
    roomId: room.roomId, 
    playerId: newPlayer.id, // Important: User needs this to identify themselves
    player: newPlayer,
    message: "Joined successfully." 
  });
};

