import GameLobby from "@/components/game/gameLobby";
import ParticlesBackground from "@/components/ui/particleBackground";
import GameFooter from "@/components/game/gameFooter";
import { Eye } from "@/components/animations/Eye";

export default function Page() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden ">
      <ParticlesBackground />
      
      {/* 1. CENTRAL ANCHOR: 
          This container should match the max-width of your GameLobby component.
          'mx-auto' keeps this entire unit centered on the screen.
      */}
      <div className="relative mx-auto w-full max-w-[1200px] min-h-screen">
        
        {/* 2. THE EYE OVERLAY:
            Positioned 'absolute' inside the anchor. 
            Now 'top-10' and 'inset-x-0' refer to the 1200px container, not the whole screen.
        */}
        <div className="absolute top-40 inset-x-0 z-50 flex justify-center gap-10 pointer-events-none">
          <Eye className="pointer-events-auto h-20 w-20 md:h-24 md:w-24 shadow-2xl" />
          <Eye className="pointer-events-auto h-20 w-20 md:h-24 md:w-24 shadow-2xl" />
        </div>

        {/* 3. THE CONTENT:
            Padding-top (pt-40) ensures the eyes don't visually overlap 
            the top of the lobby UI.
        */}
        <div className="relative pt-10 px-4">
          <GameLobby />
        </div>
      </div>

      <GameFooter />
    </main>
  );
}