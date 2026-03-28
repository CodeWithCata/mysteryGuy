import mongoose from "mongoose";
import { env } from "../config/env";

/**
 * Connects to MongoDB using Mongoose.
 * This is an async function that handles the initial connection
 * and listens for common connection errors.
 */
export const connectDB = async (): Promise<void> => {
  try {
    // 1. Connection options for stability
    const connectionOptions = {
      autoIndex: true, // Useful for development to build indexes
    };

    // 2. Establish the connection
    const conn = await mongoose.connect(env.MONGO_URI, connectionOptions);

    console.log(`🍃 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    
    // In a game server, if the DB is down, we can't fetch words.
    // It's safer to exit the process so the orchestrator (like Docker/PM2) can restart it.
    process.exit(1);
  }
};

// 3. Monitor the connection after the initial start
mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ MongoDB disconnected! Attempting to reconnect...");
});

mongoose.connection.on("error", (err) => {
  console.error(`❌ MongoDB Runtime Error: ${err}`);
});