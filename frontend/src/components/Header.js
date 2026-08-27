"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { KikoLogo } from "@/components/KikoLogo";
import { ADMIN_LINK, NAV_LINKS, NavLinks } from "@/components/NavBar";

function UserControls({ user, signOut }) {
  return (
    <div className="flex items-center gap-3 font-pixel-body text-xs text-ink">
      {user ? (
        <>
          <span className="font-semibold uppercase tracking-wide">{user.username}</span>
          <button
            onClick={signOut}
            className="border-2 border-ink bg-wall px-3 py-1.5 font-semibold uppercase tracking-wide text-ink hover:bg-wood-mid hover:text-sky-cloud"
          >
            Log out
          </button>
        </>
      ) : (
        <>
          <a
            href="/login"
            className="border-2 border-ink bg-wall px-3 py-1.5 font-semibold uppercase tracking-wide text-ink hover:bg-wood-mid hover:text-sky-cloud"
          >
            Log in
          </a>
          <a
            href="/register"
            className="border-2 border-ink bg-wood-mid px-3 py-1.5 font-semibold uppercase tracking-wide text-sky-cloud hover:bg-wood-dark"
          >
            Create account
          </a>
        </>
      )}
    </div>
  );
}

// Brand + auth controls + screen navigation (Home / Leaderboard / Profile /
// Admin). Desktop gets one unified row -- logo, nav, and account controls
// side by side, no second bar stacked underneath. Mobile keeps nav icons
// out of the top bar (logo + account only); those render as a fixed bottom
// dock instead, via NavBar (rendered after {children} in layout.js).
export function Header() {
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();
  const links = user?.isAdmin ? [...NAV_LINKS, ADMIN_LINK] : NAV_LINKS;
  const showNav = !loading && user;

  return (
    <>
      <header className="hidden h-16 items-center justify-between border-b-4 border-ink bg-wall px-6 md:flex">
        <Link href="/" aria-label="Kiko">
          <KikoLogo variant="plain" scale={2} />
        </Link>

        {showNav && (
          <nav className="flex items-center gap-6">
            <NavLinks pathname={pathname} links={links} />
          </nav>
        )}

        {!loading && <UserControls user={user} signOut={signOut} />}
      </header>

      <header className="flex items-center justify-between border-b-4 border-ink bg-wall px-4 py-4 md:hidden">
        <Link href="/" aria-label="Kiko">
          <KikoLogo variant="plain" scale={2} />
        </Link>

        {!loading && <UserControls user={user} signOut={signOut} />}
      </header>
    </>
  );
}
