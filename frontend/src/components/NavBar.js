"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { PixelCanvas } from "@/components/PixelCanvas";
import { PixelWorld } from "@/lib/pixelWorld";

export const NAV_LINKS = [
  { href: "/", label: "Home", kind: "home" },
  { href: "/leaderboard", label: "Leaderboard", kind: "leaderboard" },
  { href: "/profile", label: "Profile", kind: "profile" },
];

export const ADMIN_LINK = { href: "/admin", label: "Admin", kind: "admin" };

export function NavIcon({ kind, active }) {
  const draw = (canvas) => PixelWorld.drawNavIcon(canvas, { kind, active, bg: null, scale: 2 });
  return <PixelCanvas draw={draw} />;
}

export function NavLinks({ pathname, links }) {
  return links.map(({ href, label, kind }) => {
    const active = pathname === href;
    return (
      <Link
        key={href}
        href={href}
        className={`flex flex-col items-center gap-1 border-2 px-3 py-1 font-pixel-body text-[10px] font-bold uppercase tracking-wide transition-colors ${
          active
            ? "border-ink bg-sky-cloud text-ink"
            : "border-transparent text-stone hover:border-ink hover:bg-sky-cloud/70 hover:text-ink"
        }`}
      >
        <NavIcon kind={kind} active={active} />
        {label}
      </Link>
    );
  });
}

// Mobile-only fixed bottom dock (Home / Leaderboard / Profile / Admin).
// Desktop navigation lives inline in Header's single unified row instead --
// this renders nothing there (`md:hidden` on both the bar and its spacer).
// The spacer is rendered here, after {children} in layout.js, so page
// content is pushed up above the fixed bar instead of sitting underneath it.
export function NavBar() {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  if (loading || !user) return null;

  const links = user.isAdmin ? [...NAV_LINKS, ADMIN_LINK] : NAV_LINKS;

  return (
    <>
      <div className="h-16 md:hidden" />
      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t-4 border-ink bg-wall py-1 md:hidden">
        <NavLinks pathname={pathname} links={links} />
      </nav>
    </>
  );
}
