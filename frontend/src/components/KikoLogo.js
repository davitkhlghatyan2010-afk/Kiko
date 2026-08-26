"use client";

import { useCallback } from "react";
import { PixelCanvas } from "@/components/PixelCanvas";
import { Buf, LOGO, LOGO_PLAIN_W, drawWordmark } from "@/lib/kikoArt";

// variant: "plain" (letters only, no ball/speed-lines -- header lockup),
// "full" (adds the spark + top/bottom hairline), "dark" (light ink, for a
// dark background). Static art, no animation, so a plain PixelCanvas draw
// (not KikoRoomCanvas's own rAF loop) is enough.
export function KikoLogo({ variant = "plain", scale = 2, className }) {
  const draw = useCallback(
    (canvas) => {
      const w = variant === "plain" ? LOGO_PLAIN_W : LOGO.w;
      const buf = new Buf(w, LOGO.h);
      drawWordmark(buf, { dark: variant === "dark", spark: variant !== "plain", rule: variant === "full" });
      buf.paint(canvas, scale);
    },
    [variant, scale],
  );

  return <PixelCanvas draw={draw} className={className} style={{ imageRendering: "pixelated" }} />;
}
