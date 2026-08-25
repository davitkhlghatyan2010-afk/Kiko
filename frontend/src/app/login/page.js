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
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl border-2 border-ink bg-wall p-6 text-ink">
        <h1 className="mb-6 text-2xl font-semibold">Log in to Kiko</h1>

        <label className="mb-3 block text-sm">
          Username or email
          <input
            className="mt-1 w-full border-b-2 border-ink bg-transparent px-1 py-2 text-ink outline-none"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
        </label>

        <label className="mb-1 block text-sm">
          Password
          <input
            type="password"
            className="mt-1 w-full border-b-2 border-ink bg-transparent px-1 py-2 text-ink outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <p className="mb-3 text-right text-sm">
          <a href="/forgot-password" className="underline">
            Forgot password?
          </a>
        </p>

        {error && <p className="mb-3 text-sm text-dead">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-alert px-4 py-2 font-semibold text-sky-cloud disabled:opacity-60"
        >
          {submitting ? "Logging in..." : "Log in"}
        </button>

        <p className="mt-4 text-center text-sm">
          New to Kiko?{" "}
          <a href="/register" className="underline">
            Create an account
          </a>
        </p>
      </form>
    </PixelBackdrop>
  );
}
