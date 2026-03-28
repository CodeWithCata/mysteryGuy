import { Router, Request, Response } from "express";

const userRouter = Router();

// This matches GET /api/users/
userRouter.get("/mue", (req: Request, res: Response) => {
  res.json({ message: "List of users" });
});

// This matches POST /api/users/
userRouter.post("/", (req: Request, res: Response) => {
  const { name } = req.body;
  res.status(201).json({ user: name });
});

export default userRouter;