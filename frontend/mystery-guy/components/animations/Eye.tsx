"use client";
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";

export const Eye = ({ className }: { className?: string }) => {
  const eyeRef = useRef<HTMLDivElement>(null);
  const pupilRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const eye = eyeRef.current;
    const pupil = pupilRef.current;
    if (!eye || !pupil) return;

    // 1. Setup QuickSetters for high-performance tracking
    const xSetter = gsap.quickSetter(pupil, "x", "px");
    const ySetter = gsap.quickSetter(pupil, "y", "px");

    const handleMouseMove = (e: MouseEvent) => {
      const rect = eye.getBoundingClientRect();
      const eyeX = rect.left + rect.width / 2;
      const eyeY = rect.top + rect.height / 2;

      const angle = Math.atan2(e.clientY - eyeY, e.clientX - eyeX);
      const distance = rect.width * 0.2; // Keep pupil within eye bounds

      // Smoothly interpolate to the mouse position
      gsap.to({}, {
        duration: 0.5,
        overwrite: "auto",
        onUpdate: () => {
          xSetter(Math.cos(angle) * distance);
          ySetter(Math.sin(angle) * distance);
        }
      });
    };

    // 2. Self-contained Blink Logic (No State!)
    const blinkAction = gsap.timeline({
      repeat: -1,
      repeatDelay: Math.random() * 3 + 2
    });
    
    blinkAction.to(eye, { scaleY: 0.1, duration: 0.1 })
               .to(eye, { scaleY: 1, duration: 0.1 });

    window.addEventListener("mousemove", handleMouseMove);
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      blinkAction.kill(); // Cleanup GSAP on unmount
    };
  }, []);

  return (
    <div
      ref={eyeRef}
      className={cn(
        "h-16 w-16 bg-white rounded-full border-2 border-slate-800 flex items-center justify-center shadow-lg",
        className
      )}
    >
      <div ref={pupilRef} className="h-6 w-6 bg-slate-900 rounded-full" />
    </div>
  );
};