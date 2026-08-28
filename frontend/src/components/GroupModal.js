"use client";

import { useState } from "react";
import { joinOrCreateGroup } from "@/lib/api";

// Joins the group with this code, or -- if no group has that code yet --
// creates one and makes the caller its admin. Same join-or-create rule as
// the group branch of registration, just reachable later for a solo
// account that decides to pick up a group after the fact.
export function GroupModal({ onClose, onSaved }) {
  const [inviteCode, setInviteCode] = useState("");
  const [groupName, setGroupName] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { user: updated } = await joinOrCreateGroup(inviteCode, groupName);
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
          <h2 className="font-pixel-display text-sm tracking-wide">Group</h2>
          <button
            type="button"
            onClick={onClose}
            className="border-2 border-ink bg-wall px-3 py-1.5 font-pixel-body text-[10px] font-semibold uppercase tracking-wide text-ink hover:bg-wood-mid hover:text-sky-cloud"
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="block font-pixel-body text-[10px] uppercase tracking-wide text-stone">
            Invite code
            <input
              className="mt-1 w-full border-2 border-ink bg-sky-cloud px-3 py-2 text-sm font-normal normal-case tracking-normal text-ink outline-none focus:border-wood-mid"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              minLength={3}
              placeholder="Someone's code, or make up your own"
              required
            />
          </label>

          <label className="block font-pixel-body text-[10px] uppercase tracking-wide text-stone">
            Group name <span className="normal-case text-stone">(only if this code doesn&apos;t exist yet)</span>
            <input
              className="mt-1 w-full border-2 border-ink bg-sky-cloud px-3 py-2 text-sm font-normal normal-case tracking-normal text-ink outline-none focus:border-wood-mid"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </label>

          <p className="text-xs text-stone">
            If that code already belongs to a group, you&apos;ll join it. If not, a new group is created with you as
            its admin.
          </p>

          {error && <p className="font-pixel-body text-xs text-dead">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="border-4 border-ink bg-wood-mid px-4 py-3 font-pixel-display text-[10px] uppercase tracking-wide text-sky-cloud shadow-[4px_4px_0_0_var(--color-ink)] transition-transform hover:bg-wood-dark active:translate-x-1 active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Saving..." : "Join / create group"}
          </button>
        </form>
      </div>
    </div>
  );
}
