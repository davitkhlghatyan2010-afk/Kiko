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
      <label className="mb-1 block text-sm">
        New password
        <input
          type="password"
          className="mt-1 w-full border-b-2 border-ink bg-transparent px-1 py-2 text-ink outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
        />
      </label>
      <p className="mb-3 text-xs text-ink">{PASSWORD_RULES_MESSAGE}</p>

      <label className="mb-3 block text-sm">
        Confirm new password
        <input
          type="password"
          className="mt-1 w-full border-b-2 border-ink bg-transparent px-1 py-2 text-ink outline-none"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          minLength={8}
          required
        />
      </label>

      {error && <p className="mb-3 text-sm text-dead">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-alert px-4 py-2 font-semibold text-sky-cloud disabled:opacity-60"
      >
        {submitting ? "Updating..." : "Update password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <PixelBackdrop>
      <div className="w-full max-w-sm rounded-2xl border-2 border-ink bg-wall p-6 text-ink">
        <h1 className="mb-6 text-2xl font-semibold">Set a new password</h1>
        <Suspense fallback={<p className="text-sm">Loading...</p>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </PixelBackdrop>
  );
}
