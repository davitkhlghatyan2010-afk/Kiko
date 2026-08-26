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
        className="w-full max-w-sm rounded-2xl border-2 border-ink bg-wall p-6 text-ink"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Email</h2>
          <button type="button" onClick={onClose} className="text-sm underline">
            Close
          </button>
        </div>

        {result ? (
          <div className="text-sm">
            <p className="mb-3">{result.message}</p>
            {result.devConfirmUrl && (
              <div className="rounded-xl border-2 border-ink px-3 py-2">
                <p className="mb-1 font-mono text-xs uppercase tracking-wide text-stone">
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
            <label className="text-sm">
              New email address
              <input
                type="email"
                className="mt-1 w-full border-b-2 border-ink bg-transparent px-1 py-2 text-ink outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <p className="text-xs text-stone">
              Doesn&apos;t take effect until you confirm the link sent to that address.
            </p>

            {error && <p className="text-sm text-dead">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-alert px-4 py-2 text-sm font-semibold text-sky-cloud disabled:opacity-60"
            >
              {submitting ? "Sending..." : "Send confirmation link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
