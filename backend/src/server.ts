import http from "http";
import { Server } from "socket.io";
import { createApp } from "./app";
import { env } from "./config/env";
import { connectDB } from "./lib/mongodb"; // Import MongoDB connector
import { redis } from "./lib/redis";      // Import Redis client

const app = createApp();
const httpServer = http.createServer(app);

// 1. Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: env.ALLOWED_ORIGINS, // Use your validated origins from env
    methods: ["GET", "POST"],
  },
});
async function startServer() {
  try {
    await connectDB();

    console.log("⏳ Initializing Game Engine services...");

    // 4. Start the HTTP/Socket server
    httpServer.listen(env.PORT, () => {
      console.log(`🚀 GuessTheImpostor running on port ${env.PORT} [${env.NODE_ENV}]`);
      console.log(`📡 CORS allowed for: ${env.ALLOWED_ORIGINS.join(", ")}`);
    });

  } catch (error) {
    console.error("💥 Failed to start server:", error);
    process.exit(1);
  }
}

// 5. Handle graceful shutdown
process.on("SIGTERM", async () => {
  console.log("🛑 SIGTERM received. Shutting down gracefully...");
  await redis.quit(); // Close Redis connection
  httpServer.close(() => {
    console.log("👋 Server closed.");
    process.exit(0);
  });
});

startServer();

// Export 'io' if you need to use it in other controllers/services
export { io };