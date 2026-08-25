"use client";

import { useCallback } from "react";
import { PixelCanvas } from "@/components/PixelCanvas";
import { PixelWorld } from "@/lib/pixelWorld";

// One plant per clean day, tier-colored -- fills at 14 (bedRow's own cap).
export function PixelBed({ days, tier, scale = 2 }) {
  const draw = useCallback(
    (canvas) => {
      PixelWorld.drawBed(canvas, { days, tier, scale });
    },
    [days, tier, scale],
  );
  return <PixelCanvas draw={draw} />;
}
