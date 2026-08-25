"use client";

import { useCallback } from "react";
import { PixelCanvas } from "@/components/PixelCanvas";
import { PixelWorld } from "@/lib/pixelWorld";

// The garden world scene as a page backdrop behind auth cards. Rendered at
// its native 380-wide world buffer, scale 2 (760px) -- a framed scene
// centered on the page, not a stretched full-bleed image (the source design
// is a fixed-size world buffer, not an infinitely tileable background).
export function PixelBackdrop({ children }) {
  const draw = useCallback((canvas) => {
    PixelWorld.drawWorld(canvas, {
      tier: "green",
      viewW: PixelWorld.WORLD_W,
      scale: 2,
      character: true,
      pose: "idle",
      who: "boy",
      dog: true,
      fauna: true,
    });
  }, []);

  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden bg-sky-cloud px-6">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <PixelCanvas draw={draw} />
      </div>
      <div className="relative z-10">{children}</div>
    </main>
  );
}
