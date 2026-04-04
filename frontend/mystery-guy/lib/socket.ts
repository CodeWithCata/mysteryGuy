import { io, Socket } from "socket.io-client";

// In production, this would be your deployed backend URL
// In development, it's likely http://localhost:3001
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

export const socket: Socket = io(SOCKET_URL, {
  autoConnect: false,     // We manually connect when the user joins a room
  withCredentials: true,  // Important if you're using cookies/sessions
  transports: ["websocket"], // Forces WebSocket (skips HTTP polling for speed)
});

// Optional: Add global debug listeners
if (process.env.NODE_ENV === "development") {
  socket.on("connect", () => {
    console.log("✅ Connected to Socket Server:", socket.id);
  });

  socket.on("connect_error", (err) => {
    console.error("❌ Socket Connection Error:", err.message);
  });
}