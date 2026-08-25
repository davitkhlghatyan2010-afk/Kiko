"use client";

import { useCallback } from "react";
import { PixelCanvas } from "@/components/PixelCanvas";
import { PixelWorld } from "@/lib/pixelWorld";

// The garden world scene as a full-bleed page backdrop behind auth cards.
// PixelCanvas's `fill` mode stretches the native 380x210 world buffer to
// cover the whole content area (cropping, not integer-scaling) via
// object-fit: cover, so it reaches every edge instead of sitting in a
// fixed-size framed box.
export function PixelBackdrop({ children, tier = "green" }) {
  const draw = useCallback(
    (canvas) => {
      PixelWorld.drawWorld(canvas, {
        tier,
        viewW: PixelWorld.WORLD_W,
        character: true,
        pose: "idle",
        who: "boy",
        dog: true,
        fauna: true,
      });
    },
    [tier],
  );

  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden bg-sky-cloud px-6">
      <PixelCanvas draw={draw} fill className="pointer-events-none absolute inset-0" />
      <div className="relative z-10">{children}</div>
    </main>
  );
}
