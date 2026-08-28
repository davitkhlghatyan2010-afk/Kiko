"use client";

import { useState } from "react";
import { MAX_TOTAL_MINUTES, MIN_TOTAL_MINUTES } from "@/lib/pomodoro";

// Shared by the initial Start (which also fires startDay()) and by
// re-launching a fresh Pomodoro later in the day once startDay() has
// already happened -- onStart just receives the validated minute count.
export function FocusMinutesForm({ onStart, buttonLabel, busyLabel }) {
  const [minutes, setMinutes] = useState(String(MIN_TOTAL_MINUTES));
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    const n = Number(minutes);
    if (!Number.isInteger(n) || n < MIN_TOTAL_MINUTES || n > MAX_TOTAL_MINUTES) {
      setError(`Enter a whole number between ${MIN_TOTAL_MINUTES} and ${MAX_TOTAL_MINUTES}`);
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await onStart(n);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <label className="block font-pixel-body text-[10px] uppercase tracking-wide text-stone">
        Focus minutes ({MIN_TOTAL_MINUTES}-{MAX_TOTAL_MINUTES})
        <input
          type="number"
          min={MIN_TOTAL_MINUTES}
          max={MAX_TOTAL_MINUTES}
          className="mt-1 w-full border-2 border-ink bg-sky-cloud px-3 py-2 font-pixel-display text-xl tracking-normal text-ink outline-none focus:border-wood-mid"
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
        />
      </label>
      {error && <p className="font-pixel-body text-xs text-dead">{error}</p>}
      <button
        onClick={handleClick}
        disabled={busy}
        className="w-full border-4 border-ink bg-wood-mid px-5 py-3 font-pixel-display text-[10px] uppercase tracking-wide text-sky-cloud shadow-[4px_4px_0_0_var(--color-ink)] transition-transform hover:bg-wood-dark active:translate-x-1 active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? busyLabel : buttonLabel}
      </button>
    </div>
  );
}
