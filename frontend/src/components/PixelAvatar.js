"use client";

import { useCallback } from "react";
import { PixelCanvas } from "@/components/PixelCanvas";
import { PixelWorld } from "@/lib/pixelWorld";

// Deterministic per-id pick from the Design System's 8 portraits -- purely
// decorative, not tied to any real identity/character-selection feature.
function hashIndex(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return h;
}

export function PixelAvatar({ id, scale = 2 }) {
  const draw = useCallback(
    (canvas) => {
      PixelWorld.drawAvatar(canvas, { v: hashIndex(id), scale });
    },
    [id, scale],
  );
  return <PixelCanvas draw={draw} className="rounded-lg border-2 border-ink" />;
}
