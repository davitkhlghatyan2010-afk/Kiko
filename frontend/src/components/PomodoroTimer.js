"use client";

import { useEffect, useRef, useState } from "react";
import { logSession } from "@/lib/api";

function format(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

export function PomodoroTimer({ blocks, onStop }) {
  const [blockIndex, setBlockIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(blocks[0].minutes * 60);
  const [done, setDone] = useState(false);
  const intervalStartRef = useRef(new Date());

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
      <div className="flex w-full flex-col items-center gap-2 rounded border border-stone p-3 text-sm">
        <p>Focus session complete.</p>
        <button onClick={onStop} className="text-xs underline">
          Dismiss
        </button>
      </div>
    );
  }

  const phase = blocks[blockIndex].type;

  return (
    <div className="flex w-full flex-col items-center gap-3 rounded border border-stone p-3">
      <p className="font-mono text-xs uppercase tracking-wide text-stone">
        {phase === "work" ? "Working" : "Resting"} — block {blockIndex + 1} of {blocks.length}
      </p>
      <p className="font-mono text-3xl tabular-nums text-ink">{format(secondsLeft)}</p>

      <div className="relative flex h-12 w-full overflow-hidden rounded">
        <div className="flex flex-1 items-center justify-center bg-wood-mid text-xs uppercase tracking-wide text-sky-cloud">
          House
        </div>
        <div className="flex flex-1 items-center justify-center bg-foliage-mid text-xs uppercase tracking-wide text-sky-cloud">
          Garden
        </div>
        <div
          className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-ink transition-all duration-700 ease-in-out ${
            phase === "work" ? "left-[calc(25%-0.625rem)]" : "left-[calc(75%-0.625rem)]"
          }`}
        />
      </div>

      <button onClick={onStop} className="text-xs underline">
        Stop
      </button>
    </div>
  );
}
