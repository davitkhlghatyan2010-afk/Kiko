"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { PixelBackdrop } from "@/components/PixelBackdrop";

// Shell for now -- ranking real users by streak needs a backend endpoint
// (group members' streaks, global streaks) that doesn't exist yet.
export default function LeaderboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.push("/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <PixelBackdrop>
        <p className="rounded-xl border-2 border-ink bg-wall px-4 py-2 text-sm text-ink">Loading...</p>
      </PixelBackdrop>
    );
  }

  return (
    <PixelBackdrop>
      <div className="w-full max-w-sm rounded-2xl border-2 border-ink bg-wall p-6 text-center text-ink">
        <h1 className="mb-2 text-2xl font-semibold">Leaderboard</h1>
        <p className="text-sm text-stone">
          Coming soon — this will rank your group, and everyone else, by streak.
        </p>
      </div>
    </PixelBackdrop>
  );
}
