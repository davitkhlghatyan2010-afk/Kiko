"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { login } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { PixelBackdrop } from "@/components/PixelBackdrop";

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { token, user } = await login({ identifier, password });
      signIn(token, user);
      router.push("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PixelBackdrop>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm border-4 border-ink bg-wall p-6 text-ink shadow-[6px_6px_0_0_var(--color-ink)]"
      >
        <h1 className="mb-6 font-pixel-display text-lg tracking-wide">Log in to Kiko</h1>

        <label className="mb-3 block font-pixel-body text-[10px] uppercase tracking-wide text-stone">
          Username or email
          <input
            className="mt-1 w-full border-2 border-ink bg-sky-cloud px-3 py-2 text-sm font-normal normal-case tracking-normal text-ink outline-none focus:border-wood-mid"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
        </label>

        <label className="mb-1 block font-pixel-body text-[10px] uppercase tracking-wide text-stone">
          Password
          <input
            type="password"
            className="mt-1 w-full border-2 border-ink bg-sky-cloud px-3 py-2 text-sm font-normal normal-case tracking-normal text-ink outline-none focus:border-wood-mid"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <p className="mb-3 text-right text-sm">
          <a href="/forgot-password" className="font-pixel-body underline">
            Forgot password?
          </a>
        </p>

        {error && <p className="mb-3 font-pixel-body text-xs text-dead">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full border-4 border-ink bg-wood-mid px-4 py-3 font-pixel-display text-[10px] uppercase tracking-wide text-sky-cloud shadow-[4px_4px_0_0_var(--color-ink)] transition-transform hover:bg-wood-dark active:translate-x-1 active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Logging in..." : "Log in"}
        </button>

        <p className="mt-4 text-center text-sm">
          New to Kiko?{" "}
          <a href="/register" className="font-pixel-body underline">
            Create an account
          </a>
        </p>
      </form>
    </PixelBackdrop>
  );
}
