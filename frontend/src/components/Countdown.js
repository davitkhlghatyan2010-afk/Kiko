"use client";

import { useEffect, useState } from "react";

function remaining(deadlineAt) {
  return new Date(deadlineAt).getTime() - Date.now();
}

function format(ms) {
  if (ms <= 0) return "00:00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

export function Countdown({ deadlineAt }) {
  const [ms, setMs] = useState(() => remaining(deadlineAt));

  useEffect(() => {
    const id = setInterval(() => setMs(remaining(deadlineAt)), 1000);
    return () => clearInterval(id);
  }, [deadlineAt]);

  const expired = ms <= 0;

  return (
    <p
      className={`font-mono text-6xl tabular-nums tracking-tight ${expired ? "text-alert" : "text-ink"}`}
      aria-label={expired ? "Deadline passed" : "Time remaining until deadline"}
    >
      {format(ms)}
    </p>
  );
}
