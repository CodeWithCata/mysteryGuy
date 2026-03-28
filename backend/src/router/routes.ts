import { Router } from "express";
import { createRoom, joinRoom } from "../controllers/room.controller";

const router = Router();

// POST /api/rooms/create
router.post("/create", createRoom);

// FIX: Was GET — joinRoom reads req.body which is undefined on GET requests.
// Changed to POST so req.body is populated correctly.
router.post("/join", joinRoom);

export default router;