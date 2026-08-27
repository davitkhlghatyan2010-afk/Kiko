"use client";

import { useState } from "react";
import { forgotPassword } from "@/lib/api";
import { PixelBackdrop } from "@/components/PixelBackdrop";

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
    <PixelBackdrop>
      <div className="w-full max-w-sm border-4 border-ink bg-wall p-6 text-ink shadow-[6px_6px_0_0_var(--color-ink)]">
        <h1 className="mb-6 font-pixel-display text-lg tracking-wide">Reset your password</h1>

        {result ? (
          <div className="text-sm">
            <p className="mb-3">{result.message}</p>
            {result.devResetUrl && (
              <div className="border-2 border-ink bg-sky-cloud/60 px-3 py-2">
                <p className="mb-1 font-pixel-body text-[10px] uppercase tracking-wide text-stone">
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
            <label className="mb-3 block font-pixel-body text-[10px] uppercase tracking-wide text-stone">
              Email
              <input
                type="email"
                className="mt-1 w-full border-2 border-ink bg-sky-cloud px-3 py-2 text-sm font-normal normal-case tracking-normal text-ink outline-none focus:border-wood-mid"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            {error && <p className="mb-3 font-pixel-body text-xs text-dead">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full border-4 border-ink bg-wood-mid px-4 py-3 font-pixel-display text-[10px] uppercase tracking-wide text-sky-cloud shadow-[4px_4px_0_0_var(--color-ink)] transition-transform hover:bg-wood-dark active:translate-x-1 active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Sending..." : "Send reset link"}
            </button>
          </form>
        )}

        <p className="mt-4 text-center text-sm">
          <a href="/login" className="font-pixel-body underline">
            Back to log in
          </a>
        </p>
      </div>
    </PixelBackdrop>
  );
}
