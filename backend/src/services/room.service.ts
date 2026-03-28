// services/room.service.ts
import { Room } from "../schemas/room.schema";

export class RoomService {
  /**
   * Check if a name is already taken in the room
   */
  static ensureNameIsUnique(room: Room, name: string) {
    const isTaken = room.players.some(
      (p) => p.name.toLowerCase() === name.toLowerCase()
    );
    if (isTaken) {
      throw new Error("This name is already taken in this room.");
    }
  }

  /**
   * Check if the room has reached its maximum capacity
   */
  static ensureRoomIsNotFull(room: Room) {
    if (room.players.length >= room.settings.roomConfig.maxPlayers) {
      throw new Error("This room is already full.");
    }
  }

  /**
   * Check if the room is still in the LOBBY state
   */
  static ensureRoomIsJoinable(room: Room) {
    if (room.status !== "LOBBY") {
      throw new Error("Cannot join a game that has already started.");
    }
  }
}