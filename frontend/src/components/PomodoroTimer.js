"use client";

import { useEffect, useRef, useState } from "react";
import { logSession } from "@/lib/api";

function format(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

// Takes over the top slot Countdown normally occupies (see page.js) while a
// session is running -- same big/bare styling, no card. The room-vs-garden
// scene lives on the page's own fullscreen backdrop (PixelBackdrop's `scene`
// prop), driven by onPhaseChange; Stop/Dismiss lives in page.js's bottom
// button slot, wired straight to the same handler that clears pomodoroBlocks.
export function PomodoroTimer({ blocks, onPhaseChange }) {
  const [blockIndex, setBlockIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(blocks[0].minutes * 60);
  const [done, setDone] = useState(false);
  const intervalStartRef = useRef(new Date());

  const phase = blocks[blockIndex].type;

  useEffect(() => {
    onPhaseChange?.(done ? null : phase);
    // Clears the room/garden backdrop override on unmount too (e.g. Stop),
    // not just when a later phase change overwrites it.
    return () => onPhaseChange?.(null);
  }, [phase, done, onPhaseChange]);

  useEffect(() => {
    if (done) return;
    const id = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev > 1) return prev - 1;

        const endedAt = new Date();
        logSession({
          startedAt: intervalStartRef.current,
          endedAt,
          type: blocks[blockIndex].type,
        });

        const nextIndex = blockIndex + 1;
        if (nextIndex >= blocks.length) {
          setDone(true);
          return 0;
        }

        intervalStartRef.current = endedAt;
        setBlockIndex(nextIndex);
        return blocks[nextIndex].minutes * 60;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [blockIndex, blocks, done]);

  if (done) {
    return <p className="font-mono text-2xl font-medium text-ink">Focus session complete.</p>;
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <p className="font-mono text-xs uppercase tracking-wide text-stone">
        {phase === "work" ? "Working" : "Resting"} — block {blockIndex + 1} of {blocks.length}
      </p>
      <p className="font-mono text-[56px] font-medium tabular-nums tracking-tight text-ink">
        {format(secondsLeft)}
      </p>
    </div>
  );
}
