"use client";

import { useEffect, useRef } from "react";
import { Buf, ROOM, drawRoom } from "@/lib/kikoArt";

// Runs its own requestAnimationFrame loop (unlike PixelCanvas, which draws
// once) since the room's animation frame is picked from a live timestamp,
// not a one-shot draw. `roomState` is read from a ref each frame so the
// loop itself never restarts on a phase change -- only what it draws does.
//
// `scale` default: the room's on-screen size everywhere it's used (Home's
// backdrop, the admin preview). Must stay a whole number (3, 4, 5, ...) --
// the art is upscaled with hard pixel edges, and a fraction would make some
// pixels a different size than others instead of a clean block each.
export function KikoRoomCanvas({ roomState, scale = 5, fill = false, className }) {
  const canvasRef = useRef(null);
  const stateRef = useRef(roomState);

  useEffect(() => {
    stateRef.current = roomState;
  }, [roomState]);

  useEffect(() => {
    let raf;
    function frame(t) {
      const canvas = canvasRef.current;
      if (canvas) {
        const buf = new Buf(ROOM.w, ROOM.h);
        drawRoom(buf, stateRef.current, t);
        buf.paint(canvas, scale);
        if (fill) {
          canvas.style.width = "100%";
          canvas.style.height = "100%";
          canvas.style.objectFit = "cover";
        }
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [scale, fill]);

  return <canvas ref={canvasRef} className={className} style={{ imageRendering: "pixelated" }} />;
}
