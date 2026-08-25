"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/profile", label: "Profile" },
];

function NavLinks({ pathname }) {
  return LINKS.map(({ href, label }) => {
    const active = pathname === href;
    return (
      <Link
        key={href}
        href={href}
        className={`px-3 py-2 text-sm font-semibold ${active ? "text-ink underline" : "text-stone"}`}
      >
        {label}
      </Link>
    );
  });
}

// Desktop (`variant="top"`): a row under the header. Mobile (`variant="bottom"`):
// a fixed tab bar at the bottom of the viewport, with a same-height spacer
// rendered in the normal flow (placed after page content in layout.js) so
// content never sits underneath the fixed bar.
export function NavBar({ variant }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  if (loading || !user) return null;

  if (variant === "top") {
    return (
      <nav className="hidden h-12 items-center justify-center gap-6 border-b-2 border-ink bg-wall md:flex">
        <NavLinks pathname={pathname} />
      </nav>
    );
  }

  return (
    <>
      <div className="h-14 md:hidden" />
      <nav className="fixed inset-x-0 bottom-0 z-30 flex h-14 items-center justify-around border-t-2 border-ink bg-wall md:hidden">
        <NavLinks pathname={pathname} />
      </nav>
    </>
  );
}
