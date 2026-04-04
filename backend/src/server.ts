import http from "http";
import { Server } from "socket.io";
import { createApp } from "@/app";
import { env } from "@/config/env";
import { connectDB } from "@/lib/mongodb";
import { redis } from "@/lib/redis";
import { setupSocketHandlers } from "@/sockets/socketHandler";

const app = createApp();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: env.ALLOWED_ORIGINS,
    methods: ["GET", "POST"],
  },
});

async function startServer() {
  try {
    await connectDB();

    console.log("⏳ Initializing Game Engine services...");

    // Wire up all socket handlers
    setupSocketHandlers(io);
    console.log("🔌 Socket handlers registered");

    httpServer.listen(env.PORT, () => {
      console.log(`🚀 GuessTheImpostor running on port ${env.PORT} [${env.NODE_ENV}]`);
      console.log(`📡 CORS allowed for: ${env.ALLOWED_ORIGINS.join(", ")}`);
    });
  } catch (error) {
    console.error("💥 Failed to start server:", error);
    process.exit(1);
  }
}

process.on("SIGTERM", async () => {
  console.log("🛑 SIGTERM received. Shutting down gracefully...");
  await redis.quit();
  httpServer.close(() => {
    console.log("👋 Server closed.");
    process.exit(0);
  });
});

startServer();

export { io };