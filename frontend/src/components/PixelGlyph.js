"use client";

import { useCallback } from "react";
import { PixelCanvas } from "@/components/PixelCanvas";
import { PixelWorld } from "@/lib/pixelWorld";

export function PixelGlyph({ kind, scale = 2 }) {
  const draw = useCallback(
    (canvas) => {
      PixelWorld.drawGlyph(canvas, { kind, scale });
    },
    [kind, scale],
  );
  return <PixelCanvas draw={draw} />;
}
