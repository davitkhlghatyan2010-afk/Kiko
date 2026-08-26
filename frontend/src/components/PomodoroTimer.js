"use client";

import { useEffect, useRef, useState } from "react";
import { logSession } from "@/lib/api";

function format(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

// The room-vs-garden scene now lives on the page's own fullscreen backdrop
// (see page.js / PixelBackdrop's `scene` prop), driven by onPhaseChange --
// this card itself is just the countdown and controls.
export function PomodoroTimer({ blocks, onStop, onPhaseChange }) {
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
    return (
      <div className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-ink bg-wall p-3 text-sm">
        <p>Focus session complete.</p>
        <button onClick={onStop} className="text-xs underline">
          Dismiss
        </button>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-3 rounded-xl border-2 border-ink bg-wall p-3">
      <p className="font-mono text-xs uppercase tracking-wide text-stone">
        {phase === "work" ? "Working" : "Resting"} — block {blockIndex + 1} of {blocks.length}
      </p>
      <p className="font-mono text-3xl tabular-nums text-ink">{format(secondsLeft)}</p>

      <button onClick={onStop} className="text-xs underline">
        Stop
      </button>
    </div>
  );
}
