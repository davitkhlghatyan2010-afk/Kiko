"use client";

import { FocusMinutesForm } from "@/components/FocusMinutesForm";

// Choosing focus minutes now happens in its own window instead of inline on
// the home screen -- onStart is whichever handler (handleStart /
// handleStartPomodoro) is appropriate for the current day state; this modal
// just closes itself once that resolves.
export function StartSessionModal({ title, buttonLabel, onStart, onClose }) {
  async function handleStart(minutes) {
    await onStart(minutes);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center bg-ink/50 px-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl border-2 border-ink bg-wall p-6 text-ink"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button type="button" onClick={onClose} className="text-sm underline">
            Close
          </button>
        </div>

        <FocusMinutesForm onStart={handleStart} buttonLabel={buttonLabel} busyLabel="Starting..." />
      </div>
    </div>
  );
}
