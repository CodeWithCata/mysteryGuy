"use client";
import { Eye } from "@/components/animations/Eye";
import { cn } from "@/lib/utils";

export const CharacterFrame = ({ children }: { children: React.ReactNode }) => {
  return (
    // We reduce the pt-40 to pt-24 to bring the lobby closer to the top
    <div className="relative w-full max-w-[1200px] mx-auto pt-24 px-4">
      
      {/* THE CHARACTER AREA */}
      <div className="absolute inset-x-0 top-0 flex flex-col items-center pointer-events-none">
        
        {/* Face/Head Base: 
            z-0 so it sits BEHIND the menu 
        */}
        <div className="relative z-0 w-48 h-32 bg-slate-900 rounded-t-full flex items-center justify-center gap-4 pb-6 shadow-2xl translate-y-4">
          <Eye className="pointer-events-auto w-12 h-12 border-slate-950 shadow-none" />
          <Eye className="pointer-events-auto w-12 h-12 border-slate-950 shadow-none" />
        </div>

        {/* THE HANDS: 
            z-20 and a specific top value ensures they sit ON TOP of the menu edges.
        */}
        <div className="absolute top-[110px] z-20 flex justify-between w-[300px] md:w-[400px]">
          {/* Left Hand - overlapping the lobby edge */}
          <div className="w-10 h-12 bg-slate-900 rounded-2xl border-2 border-slate-800 shadow-xl -rotate-12 translate-y-2" />
          
          {/* Right Hand - overlapping the lobby edge */}
          <div className="w-10 h-12 bg-slate-900 rounded-2xl border-2 border-slate-800 shadow-xl rotate-12 translate-y-2" />
        </div>
      </div>

      {/* THE MENU (GameLobby):
          z-10 puts it between the head (z-0) and the hands (z-20)
      */}
      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  );
};