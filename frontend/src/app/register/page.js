"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { register } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { isValidPassword, PASSWORD_RULES_MESSAGE } from "@/lib/password";

export default function RegisterPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [accountType, setAccountType] = useState("solo");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [groupName, setGroupName] = useState("");
  const [error, setError] = useState(null);
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
      const { token, user } = await register({
        username,
        email,
        password,
        confirmPassword,
        accountType,
        inviteCode,
        groupName,
      });
      signIn(token, user);
      router.push("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-sky-cloud px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded bg-wall p-6 text-ink">
        <h1 className="mb-6 text-2xl font-semibold">Join Kiko</h1>

        <div className="mb-4 flex rounded border border-stone p-1">
          <button
            type="button"
            onClick={() => setAccountType("solo")}
            className={`flex-1 rounded px-3 py-1.5 text-sm ${accountType === "solo" ? "bg-foliage-mid text-sky-cloud" : "text-ink"}`}
          >
            Go solo
          </button>
          <button
            type="button"
            onClick={() => setAccountType("group")}
            className={`flex-1 rounded px-3 py-1.5 text-sm ${accountType === "group" ? "bg-foliage-mid text-sky-cloud" : "text-ink"}`}
          >
            Join a group
          </button>
        </div>

        <label className="mb-3 block text-sm">
          Username
          <input
            className="mt-1 w-full rounded border border-stone bg-sky-cloud px-3 py-2 text-ink"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            minLength={3}
            required
          />
        </label>

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

        <label className="mb-1 block text-sm">
          Password
          <input
            type="password"
            className="mt-1 w-full rounded border border-stone bg-sky-cloud px-3 py-2 text-ink"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </label>
        <p className="mb-3 text-xs text-stone">{PASSWORD_RULES_MESSAGE}</p>

        <label className="mb-3 block text-sm">
          Confirm password
          <input
            type="password"
            className="mt-1 w-full rounded border border-stone bg-sky-cloud px-3 py-2 text-ink"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength={8}
            required
          />
        </label>

        {accountType === "group" && (
          <>
            <label className="mb-3 block text-sm">
              Invite code
              <input
                className="mt-1 w-full rounded border border-stone bg-sky-cloud px-3 py-2 text-ink"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                minLength={3}
                required
              />
            </label>
            <label className="mb-3 block text-sm">
              Group name <span className="text-stone">(only if this code doesn&apos;t exist yet)</span>
              <input
                className="mt-1 w-full rounded border border-stone bg-sky-cloud px-3 py-2 text-ink"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </label>
          </>
        )}

        {error && <p className="mb-3 rounded bg-stone/40 px-3 py-2 text-sm text-ink">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded bg-alert px-4 py-2 font-semibold text-sky-cloud disabled:opacity-60"
        >
          {submitting ? "Creating account..." : "Create account"}
        </button>

        <p className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <a href="/login" className="underline">
            Log in
          </a>
        </p>
      </form>
    </main>
  );
}
