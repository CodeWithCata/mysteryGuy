import { Request, Response } from "express";
import { redis } from "../lib/redis";
import { CreateRoomSchema, Room } from "../schemas/room.schema";
import { Player } from "../schemas/player.schema"; // Assuming this is where it's exported
import { nanoid } from "nanoid";
import { randomUUID } from "crypto";
import {GameSettings, GameSettingsSchema} from "../schemas/gameSettings.schema";
import { PlayerSchema } from "../schemas/player.schema";
import { JoinRoomSchema } from "../schemas/room.schema";
import { RoomService } from "../services/room.service";
export const createRoom = async (req: Request, res: Response) => {
  // 1. Validate Input (HostName and Settings from Dropdown)
  const validation = CreateRoomSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.format() });
  }

  const { hostName, settings } = validation.data;
  const roomId = nanoid(6).toUpperCase();
  const hostId = randomUUID();

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





// controllers/room.controller.ts


export const joinRoom = async (req: Request, res: Response) => {
  // 1. Validate Shape (Zod)
  const validation = JoinRoomSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.format() });
  }

  const { name, roomId } = validation.data;

  try {
    // 2. Fetch
    const roomKey = `room:${roomId}`;
    const roomData = await redis.get(roomKey);
    if (!roomData) return res.status(404).json({ error: "Room not found." });

    const room: Room = JSON.parse(roomData);

    // 3. Business Logic (Clean Service Calls)
    RoomService.ensureRoomIsJoinable(room);
    RoomService.ensureRoomIsNotFull(room);
    RoomService.ensureNameIsUnique(room, name);

    // 4. Action
    const newPlayer = PlayerSchema.parse({
      id: randomUUID(),
      name,
      isHost: false,
    });

    room.players.push(newPlayer);
    await redis.setex(roomKey, 86400, JSON.stringify(room));

    // 5. Response
    res.status(200).json({
      roomId: room.roomId,
      playerId: newPlayer.id,
      player: newPlayer,
    });
    
  } catch (error: any) {
    // This catches the "throw new Error" from the service
    return res.status(400).json({ error: error.message });
  }
};