"use client";

import { useEffect, useRef } from "react";

// Thin wrapper around the Design System's canvas renderer (src/lib/pixelWorld.js).
// `draw` receives the raw <canvas> element and calls one of PixelWorld's
// draw* functions on it -- this component owns none of the pixel-art logic
// itself, just the React lifecycle around a plain <canvas>.
export function PixelCanvas({ draw, className, style }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) draw(ref.current);
  }, [draw]);

  return <canvas ref={ref} className={className} style={style} />;
}
