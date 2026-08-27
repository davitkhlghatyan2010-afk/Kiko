"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { resetPassword } from "@/lib/api";
import { isValidPassword, PASSWORD_RULES_MESSAGE } from "@/lib/password";
import { PixelBackdrop } from "@/components/PixelBackdrop";

function ResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!isValidPassword(password)) {
      setError(PASSWORD_RULES_MESSAGE);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword({ token, password, confirmPassword });
      setDone(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return <p className="text-sm">This reset link is missing its token. Request a new one from the forgot-password page.</p>;
  }

  if (done) {
    return <p className="text-sm">Password updated. Taking you to log in...</p>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <label className="mb-1 block font-pixel-body text-[10px] uppercase tracking-wide text-stone">
        New password
        <input
          type="password"
          className="mt-1 w-full border-2 border-ink bg-sky-cloud px-3 py-2 text-sm font-normal normal-case tracking-normal text-ink outline-none focus:border-wood-mid"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
        />
      </label>
      <p className="mb-3 text-xs text-ink">{PASSWORD_RULES_MESSAGE}</p>

      <label className="mb-3 block font-pixel-body text-[10px] uppercase tracking-wide text-stone">
        Confirm new password
        <input
          type="password"
          className="mt-1 w-full border-2 border-ink bg-sky-cloud px-3 py-2 text-sm font-normal normal-case tracking-normal text-ink outline-none focus:border-wood-mid"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          minLength={8}
          required
        />
      </label>

      {error && <p className="mb-3 font-pixel-body text-xs text-dead">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full border-4 border-ink bg-wood-mid px-4 py-3 font-pixel-display text-[10px] uppercase tracking-wide text-sky-cloud shadow-[4px_4px_0_0_var(--color-ink)] transition-transform hover:bg-wood-dark active:translate-x-1 active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Updating..." : "Update password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <PixelBackdrop>
      <div className="w-full max-w-sm border-4 border-ink bg-wall p-6 text-ink shadow-[6px_6px_0_0_var(--color-ink)]">
        <h1 className="mb-6 font-pixel-display text-lg tracking-wide">Set a new password</h1>
        <Suspense fallback={<p className="text-sm">Loading...</p>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </PixelBackdrop>
  );
}
