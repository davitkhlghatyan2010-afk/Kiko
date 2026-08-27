"use client";

import { useEffect, useRef, useState } from "react";
import { Buf, ROOM, drawRoom } from "@/lib/kikoArt";

// Below Tailwind's `md` breakpoint (768px) -- kept in sync with every other
// mobile/desktop split in this app (Header, NavBar).
const MOBILE_QUERY = "(max-width: 767px)";

// Runs its own requestAnimationFrame loop (unlike PixelCanvas, which draws
// once) since the room's animation frame is picked from a live timestamp,
// not a one-shot draw. `roomState` is read from a ref each frame so the
// loop itself never restarts on a phase change -- only what it draws does.
//
// `scale` default: the room's on-screen size everywhere it's used (Home's
// backdrop, the admin preview). Must stay a whole number (3, 4, 5, ...) --
// the art is upscaled with hard pixel edges, and a fraction would make some
// pixels a different size than others instead of a clean block each. Below
// `md`, the room shrinks to ~60% of that (still rounded to a whole number)
// so it reads as a framed scene instead of getting cropped edge-to-edge by
// the page's overflow-hidden on a narrow phone.
export function KikoRoomCanvas({ roomState, scale = 5, fill = false, className }) {
  const canvasRef = useRef(null);
  const stateRef = useRef(roomState);
  // Lazy initializer reads the real value on the client's first render (so
  // there's no flash of the desktop size before an effect corrects it); the
  // effect below only needs to subscribe to later changes (resize, rotate).
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia(MOBILE_QUERY).matches,
  );

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    const onChange = (e) => setIsMobile(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  const effectiveScale = isMobile ? Math.max(1, Math.round(scale * 0.6)) : scale;

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
        buf.paint(canvas, effectiveScale);
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
  }, [effectiveScale, fill]);

  return <canvas ref={canvasRef} className={className} style={{ imageRendering: "pixelated" }} />;
}
