import { Request, Response } from "express";
import { CreateRoomSchema, Room } from "../schemas/room.schema";
import { Player } from "../schemas/player.schema";
import { nanoid } from "nanoid";
import { randomUUID } from "crypto";
import { PlayerSchema } from "../schemas/player.schema";
import { JoinRoomSchema } from "../schemas/room.schema";
import { RoomService } from "../services/room.service";
import { setRoom, getRoomData } from "../lib/redis.helpers";

export const createRoom = async (req: Request, res: Response) => {
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

  await setRoom(roomId, newRoom);

  res.status(201).json({
    roomId,
    hostId,
    player: hostPlayer,
    message: "Room created successfully.",
  });
};

export const joinRoom = async (req: Request, res: Response) => {
  const validation = JoinRoomSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.format() });
  }

  const { name, roomId } = validation.data;

  try {
    const raw = await getRoomData(roomId);
    if (!raw) return res.status(404).json({ error: "Room not found." });

    const room: Room = raw;

    RoomService.ensureRoomIsJoinable(room);
    RoomService.ensureRoomIsNotFull(room);
    RoomService.ensureNameIsUnique(room, name);

    const newPlayer = PlayerSchema.parse({
      id: randomUUID(),
      name,
      isHost: false,
    });

    room.players.push(newPlayer);
    await setRoom(roomId, room);

    res.status(200).json({
      roomId: room.roomId,
      playerId: newPlayer.id,
      player: newPlayer,
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};