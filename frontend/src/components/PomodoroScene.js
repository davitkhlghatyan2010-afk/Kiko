"use client";

import { useCallback } from "react";
import { PixelCanvas } from "@/components/PixelCanvas";
import { PixelWorld } from "@/lib/pixelWorld";

// scale:1 (native pixel size, no 2x upscale) keeps this secondary to the
// deadline countdown, which stays the visually larger/primary timer.
const SCALE = 1;
const ROOM_W = 176;
const ROOM_H = 120;

export function PomodoroScene({ phase }) {
  const drawRoom = useCallback((canvas) => {
    PixelWorld.drawRoomSlot(canvas, { W: ROOM_W, H: ROOM_H, scale: SCALE });
  }, []);

  const drawCharacterInRoom = useCallback((canvas) => {
    PixelWorld.drawSprite(canvas, { pose: "idle", who: "boy", scale: SCALE });
  }, []);

  const drawGarden = useCallback((canvas) => {
    PixelWorld.drawWorld(canvas, {
      tier: "green",
      viewW: ROOM_W,
      scale: SCALE,
      character: true,
      pose: "walk",
      who: "boy",
      dog: true,
      fauna: true,
    });
  }, []);

  if (phase === "rest") {
    return (
      <div className="overflow-hidden rounded border border-stone">
        <PixelCanvas draw={drawGarden} />
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden rounded border border-stone"
      style={{ width: ROOM_W * SCALE, height: ROOM_H * SCALE }}
    >
      <PixelCanvas draw={drawRoom} className="absolute inset-0" />
      <PixelCanvas draw={drawCharacterInRoom} className="absolute" style={{ left: "45%", top: "56%" }} />
    </div>
  );
}
