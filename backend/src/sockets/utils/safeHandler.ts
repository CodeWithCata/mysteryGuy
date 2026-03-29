import { Socket } from "socket.io";

/**
 * Wraps async socket handlers so unhandled errors never
 * silently crash the event loop.
 *
 * Usage:
 *   socket.on("event", safeHandler(socket, async (data) => { ... }));
 */
export const safeHandler = (
  socket: Socket,
  fn: (data: any) => Promise<void>
) => async (data: any) => {
  try {
    await fn(data);
  } catch (error: any) {
    console.error(`[Socket Error] ${error.message}`);
    socket.emit("error", { message: error.message ?? "Internal server error" });
  }
};