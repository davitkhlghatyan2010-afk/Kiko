"use client";

import { useState } from "react";
import { requestEmailChange } from "@/lib/api";

// Sends a confirmation link instead of applying the change directly -- the
// new address isn't live until that link is opened (see /verify-email).
export function ChangeEmailModal({ user, onClose }) {
  const [email, setEmail] = useState(user.email);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      setResult(await requestEmailChange(email));
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
          <h2 className="font-pixel-display text-sm tracking-wide">Email</h2>
          <button
            type="button"
            onClick={onClose}
            className="border-2 border-ink bg-wall px-3 py-1.5 font-pixel-body text-[10px] font-semibold uppercase tracking-wide text-ink hover:bg-wood-mid hover:text-sky-cloud"
          >
            Close
          </button>
        </div>

        {result ? (
          <div className="text-sm">
            <p className="mb-3">{result.message}</p>
            {result.devConfirmUrl && (
              <div className="border-2 border-ink bg-sky-cloud/60 px-3 py-2">
                <p className="mb-1 font-pixel-body text-[10px] uppercase tracking-wide text-stone">
                  No email service is wired up yet — dev link:
                </p>
                <a href={result.devConfirmUrl} className="break-all underline">
                  {result.devConfirmUrl}
                </a>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="block font-pixel-body text-[10px] uppercase tracking-wide text-stone">
              New email address
              <input
                type="email"
                className="mt-1 w-full border-2 border-ink bg-sky-cloud px-3 py-2 text-sm font-normal normal-case tracking-normal text-ink outline-none focus:border-wood-mid"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <p className="text-xs text-stone">
              Doesn&apos;t take effect until you confirm the link sent to that address.
            </p>

            {error && <p className="font-pixel-body text-xs text-dead">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="border-4 border-ink bg-wood-mid px-4 py-3 font-pixel-display text-[10px] uppercase tracking-wide text-sky-cloud shadow-[4px_4px_0_0_var(--color-ink)] transition-transform hover:bg-wood-dark active:translate-x-1 active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Sending..." : "Send confirmation link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
