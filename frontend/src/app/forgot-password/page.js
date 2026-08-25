"use client";

import { useState } from "react";
import { forgotPassword } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const body = await forgotPassword({ email });
      setResult(body);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-sky-cloud px-6">
      <div className="w-full max-w-sm rounded bg-wall p-6 text-ink">
        <h1 className="mb-6 text-2xl font-semibold">Reset your password</h1>

        {result ? (
          <div className="text-sm">
            <p className="mb-3">{result.message}</p>
            {result.devResetUrl && (
              <div className="rounded bg-stone/40 px-3 py-2">
                <p className="mb-1 font-mono text-xs uppercase tracking-wide text-stone">
                  No email service is wired up yet — dev link:
                </p>
                <a href={result.devResetUrl} className="break-all underline">
                  {result.devResetUrl}
                </a>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <label className="mb-3 block text-sm">
              Email
              <input
                type="email"
                className="mt-1 w-full rounded border border-stone bg-sky-cloud px-3 py-2 text-ink"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            {error && <p className="mb-3 rounded bg-stone/40 px-3 py-2 text-sm text-ink">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded bg-alert px-4 py-2 font-semibold text-sky-cloud disabled:opacity-60"
            >
              {submitting ? "Sending..." : "Send reset link"}
            </button>
          </form>
        )}

        <p className="mt-4 text-center text-sm">
          <a href="/login" className="underline">
            Back to log in
          </a>
        </p>
      </div>
    </main>
  );
}
