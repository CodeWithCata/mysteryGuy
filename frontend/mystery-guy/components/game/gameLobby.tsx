'use client';
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Users, PlusCircle, LogIn } from "lucide-react";

export default function GameLobby() {
  const [roomCode, setRoomCode] = useState("");
  const [playerName, setPlayerName] = useState("");

  const handleCreateRoom = () => {
    console.log("Creating room for:", playerName);
    // Logic for backend room creation goes here
  };

  const handleJoinRoom = () => {
    console.log("Joining room:", roomCode, "as", playerName);
    // Logic for joining existing room goes here
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-transparent  p-4">
     
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-md border-white/20 shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">
            Guess The Impostor
          </CardTitle>
          <CardDescription>
            Enter your name and join a room to start the hunt.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="grid w-full items-center gap-4 mb-6">
            <div className="flex flex-col space-y-1.5">

              <Input 
                id="name" 
                placeholder="e.g. Sherlock" 
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
              />
            </div>
          </div>

          <Tabs defaultValue="join" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="join">Join Room</TabsTrigger>
              <TabsTrigger value="create">Create Room</TabsTrigger>
            </TabsList>

            {/* JOIN ROOM TAB */}
            <TabsContent value="join" className="space-y-4 pt-4">
              <div className="flex flex-col space-y-1.5">

                <Input 
                  id="code" 
                  placeholder="Enter 6-digit code" 
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="uppercase font-mono text-center text-lg tracking-widest"
                />
              </div>
              <Button className="w-full" onClick={handleJoinRoom} disabled={!roomCode || !playerName}>
                <LogIn className="mr-2 h-4 w-4" /> Join Game
              </Button>
            </TabsContent>

            {/* CREATE ROOM TAB */}
            <TabsContent value="create" className="space-y-4 pt-4">
              <div className="rounded-lg bg-slate-100 p-4 text-sm text-slate-600">
                Host a new game and invite your friends. You'll be the one setting the word lists!
              </div>
              <Button variant="default" className="w-full" onClick={handleCreateRoom} disabled={!playerName}>
                <PlusCircle className="mr-2 h-4 w-4" /> Create New Lobby
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex justify-center border-t pt-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="mr-2 h-4 w-4" />
            <span>128 players currently online</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}