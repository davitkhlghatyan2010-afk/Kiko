"use client";

import { useState } from "react";

// Placeholder copy, not reviewed legal text -- honest and plain-language for
// a small pilot, but replace before a real launch. Collapsible inline block,
// per the Design System's register-flow spec.
export function PrivacyPolicy({ accepted, onAcceptedChange }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-3 text-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="mb-1 font-pixel-body text-[10px] uppercase tracking-wide underline underline-offset-2"
      >
        {open ? "Hide" : "Read"} the Privacy Policy
      </button>

      {open && (
        <div className="mb-2 border-2 border-ink bg-sky-cloud/60 p-3 text-xs text-ink">
          <p className="mb-2">
            Kiko is a small pilot project. Here&apos;s what we collect and why: your username, email, and a
            hashed (never plaintext) password, to run your account. The tasks you declare, the summaries you
            write, and the AI-generated question and answer for each are stored so completion can be verified.
          </p>
          <p className="mb-2">
            If you&apos;re on a group account, your group&apos;s admin can see your submitted proofs to check for
            fakes — that&apos;s the pilot&apos;s verification mechanism, described in the product brief. Solo
            accounts are visible only to you.
          </p>
          <p>
            We don&apos;t sell or share your data with third parties. This is placeholder policy text for a
            pilot, not reviewed legal terms.
          </p>
        </div>
      )}

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => onAcceptedChange(e.target.checked)}
          className="sr-only"
          required
        />
        <span
          aria-hidden="true"
          className={`h-5 w-5 shrink-0 border-2 border-ink ${accepted ? "bg-wood-mid" : "bg-sky-cloud"}`}
        />
        I agree to the Privacy Policy
      </label>
    </div>
  );
}
