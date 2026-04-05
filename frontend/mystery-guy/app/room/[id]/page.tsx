"use client";

import React, { useState } from "react";
import { CharacterFrame } from "@/components/animations/CharacterFrame";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Users, Timer, ShieldAlert, Fingerprint } from "lucide-react";
import { cn } from "@/lib/utils";

export default function GameRoomPage() {
  const [isRevealed, setIsRevealed] = useState(false);
  
  // Mock Data for UI
  const role = "Innocent"; // or "Impostor"
  const secretWord = "Astronaut";

  return (
    <main className="relative min-h-screen w-full bg-slate-950 pb-20">
      <CharacterFrame>
        <div className="w-full max-w-4xl mx-auto space-y-6">
          
          {/* 1. TOP STATS BAR */}
          <div className="flex justify-between items-center px-6 py-4 bg-slate-900/80 border border-slate-800 rounded-2xl backdrop-blur-md shadow-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/20 rounded-lg">
                <Timer className="w-5 h-5 text-indigo-400 animate-pulse" />
              </div>
              <div>
                <p className="text-[10px] uppercase text-slate-500 font-bold leading-none">Discussion</p>
                <p className="text-xl font-black text-white font-mono">01:42</p>
              </div>
            </div>

            <div className="flex gap-4">
               <div className="text-right">
                <p className="text-[10px] uppercase text-slate-500 font-bold leading-none">Players</p>
                <div className="flex items-center gap-2 justify-end">
                  <Users className="w-4 h-4 text-slate-400" />
                  <p className="text-lg font-black text-white">8/12</p>
                </div>
              </div>
            </div>
          </div>

          {/* 2. THE MAIN ROLE CARD */}
          <Card className="relative overflow-hidden bg-slate-900/40 border-slate-800 backdrop-blur-2xl border-2 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
            
            <CardContent className="p-12 flex flex-col items-center text-center space-y-8">
              {/* Role Badge */}
              <div className="space-y-2">
                <Badge className={cn(
                  "px-4 py-1 text-sm uppercase tracking-[0.2em] font-black border-none shadow-lg",
                  role === "Impostor" ? "bg-red-600 text-white" : "bg-emerald-600 text-white"
                )}>
                  {role === "Impostor" ? <ShieldAlert className="w-4 h-4 mr-2 inline" /> : <Fingerprint className="w-4 h-4 mr-2 inline" />}
                  Verified {role}
                </Badge>
              </div>

              {/* The Secret Content */}
              <div className="relative w-full max-w-sm aspect-video flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-700 bg-slate-950/50 transition-all">
                {isRevealed ? (
                  <div className="animate-in zoom-in-95 duration-300">
                    <p className="text-xs uppercase text-indigo-400 font-bold mb-2 tracking-widest">Your Secret Word</p>
                    <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter italic">
                      {role === "Impostor" ? "???" : secretWord}
                    </h2>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-4 text-slate-500">
                    <EyeOff className="w-12 h-12 opacity-20" />
                    <p className="font-bold text-sm uppercase tracking-tighter">Card Hidden</p>
                  </div>
                )}
              </div>

              {/* Reveal Toggle */}
              <Button 
                onClick={() => setIsRevealed(!isRevealed)}
                variant="outline" 
                className="w-full max-w-xs py-8 border-slate-700 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all active:scale-95"
              >
                {isRevealed ? (
                  <><EyeOff className="mr-2 w-5 h-5" /> Hide Info</>
                ) : (
                  <><Eye className="mr-2 w-5 h-5" /> Reveal Role</>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* 3. QUICK ACTION FOOTER */}
          <div className="grid grid-cols-2 gap-4">
             <Button variant="ghost" className="h-16 border border-slate-800 bg-slate-900/20 text-slate-400 hover:text-white hover:bg-red-500/10 hover:border-red-500/50 font-bold rounded-2xl">
                Emergency Meeting
             </Button>
             <Button variant="ghost" className="h-16 border border-slate-800 bg-slate-900/20 text-slate-400 hover:text-white hover:bg-indigo-500/10 hover:border-indigo-500/50 font-bold rounded-2xl">
                Call a Guess
             </Button>
          </div>

        </div>
      </CharacterFrame>
    </main>
  );
} 