"use client";

import { useEffect, useRef } from "react";

// Thin wrapper around the Design System's canvas renderer (src/lib/pixelWorld.js).
// `draw` receives the raw <canvas> element and calls one of PixelWorld's
// draw* functions on it -- this component owns none of the pixel-art logic
// itself, just the React lifecycle around a plain <canvas>.
//
// `fill`: PixelWorld.paint() always sets canvas.style.width/height to a fixed
// pixel size (native buffer size * integer scale) -- correct for crisp,
// pixel-perfect UI art, but a poor fit for a full-bleed backdrop. When `fill`
// is set, we override those inline styles after draw() runs so the canvas
// stretches to its container via object-fit: cover, cropping instead of
// scaling by an integer factor. image-rendering: pixelated (already set by
// paint()) keeps the crop looking like pixel art rather than blurring.
//
// `animate`: off by default (a single draw() call) since most callers here
// are static UI art (icons, avatars, the logo) redrawn only when their props
// change. When set, draw() instead runs in its own requestAnimationFrame
// loop and receives the live timestamp as a second argument -- for anything
// with its own motion (the garden's walking character), matching how
// KikoRoomCanvas already drives the room's animation.
export function PixelCanvas({ draw, className, style, fill = false, animate = false }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    function applyFill() {
      if (!fill) return;
      ref.current.style.width = "100%";
      ref.current.style.height = "100%";
      ref.current.style.objectFit = "cover";
    }

    if (!animate) {
      draw(ref.current);
      applyFill();
      return;
    }

    let raf;
    function frame(t) {
      draw(ref.current, t);
      applyFill();
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [draw, fill, animate]);

  return <canvas ref={ref} className={className} style={style} />;
}
