
import Redis from "ioredis";
import { env } from "../config/env";


export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  showFriendlyErrorStack: env.NODE_ENV === "development",
});

// --- Event Listeners for Health Monitoring ---

redis.on("connect", () => {
  console.log("🚀 Redis: Connection established");
});

redis.on("error", (err) => {
  console.error("❌ Redis: Connection error", err);
});

redis.on("ready", () => {
  console.log("✅ Redis: Client ready and synchronized");
});

/**
 * Utility: A clean way to close the connection during 
 * graceful server shutdowns.
 */
export const closeRedis = async () => {
  await redis.quit();
  console.log("💤 Redis: Connection closed safely");
};