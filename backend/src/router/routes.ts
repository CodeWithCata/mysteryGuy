import { Router } from "express";
import { createRoom, joinRoom } from "../controllers/room.controller";

const router = Router();

// POST /api/rooms/create
router.post("/create", createRoom);

// GET /api/rooms/join/:roomId (The "Link" validator)
router.get("/join/:roomId", joinRoom);

export default router;