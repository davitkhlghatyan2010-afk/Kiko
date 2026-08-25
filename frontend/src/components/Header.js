"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

// Web-appropriate top header, not the source design's mobile bottom tab bar
// (Home/Gardens/Me) -- there's nothing to navigate to yet besides Home
// (Gardens is Phase 6, Me is Phase 8), so this stays a simple wordmark + auth
// state bar until those screens exist to link to.
export function Header() {
  const { user, loading, signOut } = useAuth();

  return (
    <header className="flex items-center justify-between border-b-2 border-ink bg-sky-cloud px-6 py-4">
      <Link href="/" className="text-xl font-semibold text-ink">
        Kiko
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
