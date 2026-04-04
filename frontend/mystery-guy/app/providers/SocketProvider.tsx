"use client";

import React, { createContext, useContext, useEffect } from "react";
import { socket } from "@/lib/socket";

const SocketContext = createContext(socket);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    // This ensures that when the app/tab closes, the socket disconnects
    return () => {
      if (socket.connected) socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook to use the socket in any component easily
export const useSocket = () => useContext(SocketContext);