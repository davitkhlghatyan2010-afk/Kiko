"use client";

import { useCallback } from "react";
import { PixelCanvas } from "@/components/PixelCanvas";
import { PixelWorld } from "@/lib/pixelWorld";

// Deterministic per-id pick from the Design System's 8 portraits -- purely
// decorative, used where there's no real chosen avatar to show (other users'
// leaderboard rows).
function hashIndex(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return h;
}

// Pass `v` (0-7) directly for a real chosen avatar (e.g. the signed-in user's
// own); falls back to hashing `id` when `v` isn't given.
export function PixelAvatar({ id, v, scale = 2 }) {
  const index = v ?? hashIndex(id);
  const draw = useCallback(
    (canvas) => {
      PixelWorld.drawAvatar(canvas, { v: index, scale });
    },
    [index, scale],
  );
  return <PixelCanvas draw={draw} className="rounded-lg border-2 border-ink" />;
}
