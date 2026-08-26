"use client";

import { useCallback } from "react";
import { PixelCanvas } from "@/components/PixelCanvas";
import { KikoRoomCanvas } from "@/components/KikoRoomCanvas";
import { PixelWorld } from "@/lib/pixelWorld";

// The garden world scene as a full-bleed page backdrop behind auth cards.
// PixelCanvas's `fill` mode stretches the native 380x210 world buffer to
// cover the whole content area (cropping, not integer-scaling) via
// object-fit: cover, so it reaches every edge instead of sitting in a
// fixed-size framed box.
//
// `stretch`: pages with one centered card (login, declare, ...) want the
// default center/center layout. Home wants its children spread from the
// top of the sky to the bottom of the screen instead -- stretch swaps in a
// flex column sized via flex-1 (a real flex-grow relationship, not a
// percentage height, which doesn't reliably resolve through this many
// nested flex layers) so justify-between actually has real space to spread
// children across instead of collapsing them into a centered cluster.
//
// `scene`: "garden" (default) or "room". "room" renders the Kiko Pixel Kit's
// isometric room+character (lib/kikoArt.js) instead of the garden -- used
// while a Pomodoro block is running, so the backdrop itself reads as
// "inside". `roomState` ("work" | "break" | "done") picks which animation
// plays; it maps directly onto the Pomodoro work/rest/complete phases.
export function PixelBackdrop({ children, tier = "green", stretch = false, scene = "garden", roomState = "work" }) {
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
        // `fill` mode crops this 380px-wide world via object-fit: cover,
        // centered on the container -- on a narrow (phone) viewport, most
        // of the width is cropped away. The library's default charX=60
        // (near the world's left edge) would fall outside that centered
        // crop, so pin the character+dog near the world's horizontal
        // center (190) instead.
        charX: 210,
      });
    },
    [tier],
  );

  return (
    <main className="relative flex flex-1 flex-col overflow-hidden bg-sky-cloud px-6">
      {scene === "room" ? (
        <KikoRoomCanvas roomState={roomState} fill className="pointer-events-none absolute inset-0" />
      ) : (
        <PixelCanvas draw={draw} fill className="pointer-events-none absolute inset-0" />
      )}
      <div
        className={
          stretch
            ? "relative z-10 flex flex-1 flex-col items-center justify-between py-8"
            : "relative z-10 flex flex-1 flex-col items-center justify-center"
        }
      >
        {children}
      </div>
    </main>
  );
}
