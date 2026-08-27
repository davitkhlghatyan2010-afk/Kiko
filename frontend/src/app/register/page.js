"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { register } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { isValidPassword, PASSWORD_RULES_MESSAGE } from "@/lib/password";
import { PrivacyPolicy } from "@/components/PrivacyPolicy";
import { PixelBackdrop } from "@/components/PixelBackdrop";

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
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
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
    if (!privacyAccepted) {
      setError("You must accept the Privacy Policy");
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
        privacyAccepted,
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
    <PixelBackdrop>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm border-4 border-ink bg-wall p-6 text-ink shadow-[6px_6px_0_0_var(--color-ink)]"
      >
        <h1 className="mb-6 font-pixel-display text-lg tracking-wide">Join Kiko</h1>

        <div className="mb-4 flex border-2 border-ink p-1">
          <button
            type="button"
            onClick={() => setAccountType("solo")}
            className={`flex-1 px-3 py-1.5 font-pixel-body text-[10px] uppercase tracking-wide ${accountType === "solo" ? "bg-foliage-mid text-sky-cloud" : "text-ink"}`}
          >
            Go solo
          </button>
          <button
            type="button"
            onClick={() => setAccountType("group")}
            className={`flex-1 px-3 py-1.5 font-pixel-body text-[10px] uppercase tracking-wide ${accountType === "group" ? "bg-foliage-mid text-sky-cloud" : "text-ink"}`}
          >
            Join a group
          </button>
        </div>

        <label className="mb-3 block font-pixel-body text-[10px] uppercase tracking-wide text-stone">
          Username
          <input
            className="mt-1 w-full border-2 border-ink bg-sky-cloud px-3 py-2 text-sm font-normal normal-case tracking-normal text-ink outline-none focus:border-wood-mid"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            minLength={3}
            required
          />
        </label>

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

        <label className="mb-1 block font-pixel-body text-[10px] uppercase tracking-wide text-stone">
          Password
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
          Confirm password
          <input
            type="password"
            className="mt-1 w-full border-2 border-ink bg-sky-cloud px-3 py-2 text-sm font-normal normal-case tracking-normal text-ink outline-none focus:border-wood-mid"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength={8}
            required
          />
        </label>

        {accountType === "group" && (
          <>
            <label className="mb-3 block font-pixel-body text-[10px] uppercase tracking-wide text-stone">
              Invite code
              <input
                className="mt-1 w-full border-2 border-ink bg-sky-cloud px-3 py-2 text-sm font-normal normal-case tracking-normal text-ink outline-none focus:border-wood-mid"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                minLength={3}
                required
              />
            </label>
            <label className="mb-3 block font-pixel-body text-[10px] uppercase tracking-wide text-stone">
              Group name <span className="normal-case text-stone">(only if this code doesn&apos;t exist yet)</span>
              <input
                className="mt-1 w-full border-2 border-ink bg-sky-cloud px-3 py-2 text-sm font-normal normal-case tracking-normal text-ink outline-none focus:border-wood-mid"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </label>
          </>
        )}

        <PrivacyPolicy accepted={privacyAccepted} onAcceptedChange={setPrivacyAccepted} />

        {error && <p className="mb-3 font-pixel-body text-xs text-dead">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full border-4 border-ink bg-wood-mid px-4 py-3 font-pixel-display text-[10px] uppercase tracking-wide text-sky-cloud shadow-[4px_4px_0_0_var(--color-ink)] transition-transform hover:bg-wood-dark active:translate-x-1 active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Creating account..." : "Create account"}
        </button>

        <p className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <a href="/login" className="font-pixel-body underline">
            Log in
          </a>
        </p>
      </form>
    </PixelBackdrop>
  );
}
