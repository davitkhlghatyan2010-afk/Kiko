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
export function PixelCanvas({ draw, className, style, fill = false }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    draw(ref.current);
    if (fill) {
      ref.current.style.width = "100%";
      ref.current.style.height = "100%";
      ref.current.style.objectFit = "cover";
    }
  }, [draw, fill]);

  return <canvas ref={ref} className={className} style={style} />;
}
