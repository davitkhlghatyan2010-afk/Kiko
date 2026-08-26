"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { KikoLogo } from "@/components/KikoLogo";

// Brand + auth-state bar, always at the top. Screen navigation (Home /
// Leaderboard / Profile) lives in NavBar, which renders as a row under this
// on desktop and a fixed bottom tab bar on mobile.
export function Header() {
  const { user, loading, signOut } = useAuth();

  return (
    <header className="flex items-center justify-between border-b-2 border-ink bg-sky-cloud px-6 py-4">
      <Link href="/" aria-label="Kiko">
        <KikoLogo variant="plain" scale={2} />
      </Link>

      {!loading && (
        <div className="flex items-center gap-3 text-sm text-ink">
          {user ? (
            <>
              <span>{user.username}</span>
              <button onClick={signOut} className="underline">
                Log out
              </button>
            </>
          ) : (
            <>
              <a href="/login" className="underline">
                Log in
              </a>
              <a href="/register" className="underline">
                Create account
              </a>
            </>
          )}
        </div>
      )}
    </header>
  );
}
