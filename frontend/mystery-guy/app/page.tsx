"use client"; // Required because we are using state (useState)

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner"; // Assuming you added sonner earlier

export default function Home() {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");

  const handleJoin = () => {
    if (!name || !room) {
      toast.error("Fill in your details, detective.");
      return;
    }
    toast.success(`Attempting to join room: ${room.toUpperCase()}`);
  };

  return (
    // We use 'dark' class here to force your dark theme variables from globals.css
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-6 dark">
      
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900/50 backdrop-blur-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-black tracking-tighter text-white italic">
            MYSTERY GUY
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Deduce. Deceive. Survive.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Testing the Input Component */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-zinc-500 ml-1">Nickname</label>
            <Input 
              placeholder="Enter your name..." 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white h-12 focus-visible:ring-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-zinc-500 ml-1">Room Code</label>
            <Input 
              placeholder="X Y Z 1" 
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white h-12 uppercase text-center font-mono text-xl tracking-widest"
              maxLength={4}
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          {/* Testing the Button Component */}
          <Button 
            onClick={handleJoin}
            className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all active:scale-95"
          >
            JOIN GAME
          </Button>
          
          <Button variant="ghost" className="w-full text-zinc-500 hover:text-white hover:bg-zinc-800">
            Host Private Match
          </Button>
        </CardFooter>
      </Card>

      {/* Quick check: Is tailwind v4 working? */}
      <p className="mt-8 text-xs text-zinc-600 uppercase tracking-widest">
        Powered by <span className="text-indigo-400">Tailwind v4</span> & <span className="text-indigo-400">Shadcn</span>
      </p>
    </div>
  );
}