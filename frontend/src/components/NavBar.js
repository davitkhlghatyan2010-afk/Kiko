"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { PixelCanvas } from "@/components/PixelCanvas";
import { PixelWorld } from "@/lib/pixelWorld";

const LINKS = [
  { href: "/", label: "Home", kind: "home" },
  { href: "/leaderboard", label: "Leaderboard", kind: "leaderboard" },
  { href: "/profile", label: "Profile", kind: "profile" },
];

const ADMIN_LINK = { href: "/admin", label: "Admin", kind: "admin" };

function NavIcon({ kind, active }) {
  const draw = (canvas) => PixelWorld.drawNavIcon(canvas, { kind, active, bg: null, scale: 2 });
  return <PixelCanvas draw={draw} />;
}

function NavLinks({ pathname, links }) {
  return links.map(({ href, label, kind }) => {
    const active = pathname === href;
    return (
      <Link
        key={href}
        href={href}
        className={`flex flex-col items-center gap-1 px-3 py-1 font-pixel-body text-[10px] font-semibold uppercase tracking-wide ${
          active ? "text-ink" : "text-stone"
        }`}
      >
        <NavIcon kind={kind} active={active} />
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

  const links = user.isAdmin ? [...LINKS, ADMIN_LINK] : LINKS;

  if (variant === "top") {
    return (
      <nav className="hidden items-center justify-center gap-6 border-b-4 border-ink bg-wall py-1 md:flex">
        <NavLinks pathname={pathname} links={links} />
      </nav>
    );
  }

  return (
    <>
      <div className="h-16 md:hidden" />
      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t-4 border-ink bg-wall py-1 md:hidden">
        <NavLinks pathname={pathname} links={links} />
      </nav>
    </>
  );
}
