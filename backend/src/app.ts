

import express from "express";


import userRouter from "./router/routes";

import cors from "cors";
import { env } from "./config/env";

export function createApp() {


  
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
app.use(cors({
    // Express takes the array from Zod and handles the checking logic automatically
    origin: env.ALLOWED_ORIGINS, 
    methods: ["GET", "POST"],
    credentials: true
  }));


  // Routes
  app.use("/api", userRouter);

  return app;
}