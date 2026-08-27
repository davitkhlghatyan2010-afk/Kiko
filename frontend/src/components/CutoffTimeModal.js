"use client";

import { useState } from "react";
import { updateCutoffTime } from "@/lib/api";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function CutoffTimeModal({ user, onClose, onSaved }) {
  const [time, setTime] = useState(user.cutoffTime);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const availableAt = user.cutoffChangedAt ? new Date(new Date(user.cutoffChangedAt).getTime() + WEEK_MS) : null;
  const onCooldown = Boolean(availableAt && availableAt > new Date());

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { user: updated } = await updateCutoffTime(time);
      onSaved(updated);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-ink/50 px-6" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-none border-4 border-ink bg-wall p-6 text-ink shadow-[6px_6px_0_0_var(--color-ink)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-pixel-display text-sm tracking-wide">Cutoff time</h2>
          <button
            type="button"
            onClick={onClose}
            className="border-2 border-ink bg-wall px-3 py-1.5 font-pixel-body text-[10px] font-semibold uppercase tracking-wide text-ink hover:bg-wood-mid hover:text-sky-cloud"
          >
            Close
          </button>
        </div>

        {onCooldown ? (
          <p className="text-sm text-stone">
            Already changed this week. You can change it again on {availableAt.toLocaleDateString()}.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="block font-pixel-body text-[10px] uppercase tracking-wide text-stone">
              Deadline every day
              <input
                type="time"
                className="mt-1 w-full border-2 border-ink bg-sky-cloud px-3 py-2 text-xl font-normal normal-case tracking-normal text-ink outline-none focus:border-wood-mid"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </label>
            <p className="text-xs text-stone">
              Only applies to days you declare after saving — today&apos;s deadline won&apos;t change. Can only be
              changed once every 7 days.
            </p>
            {error && <p className="font-pixel-body text-xs text-dead">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="border-4 border-ink bg-wood-mid px-4 py-3 font-pixel-display text-[10px] uppercase tracking-wide text-sky-cloud shadow-[4px_4px_0_0_var(--color-ink)] transition-transform hover:bg-wood-dark active:translate-x-1 active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Saving..." : "Save"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
