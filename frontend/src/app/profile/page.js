"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStreak } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { PixelBackdrop } from "@/components/PixelBackdrop";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [streak, setStreak] = useState(null);
  const [gardenTier, setGardenTier] = useState("bloom");

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    getStreak()
      .then(({ streak, gardenTier }) => {
        setStreak(streak);
        setGardenTier(gardenTier);
      })
      .catch(() => {});
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <PixelBackdrop>
        <p className="rounded-xl border-2 border-ink bg-wall px-4 py-2 text-sm text-ink">Loading...</p>
      </PixelBackdrop>
    );
  }

  return (
    <PixelBackdrop tier={gardenTier}>
      <div className="w-full max-w-sm rounded-2xl border-2 border-ink bg-wall p-6 text-ink">
        <h1 className="mb-1 text-2xl font-semibold">{user.username}</h1>
        <p className="mb-6 text-sm text-stone">
          {user.accountType}
          {user.isAdmin ? ", admin" : ""}
        </p>

        <p className="font-mono text-xs uppercase tracking-wide text-stone">Current streak</p>
        <p className="text-4xl font-semibold">{streak ?? "—"}</p>
      </div>
    </PixelBackdrop>
  );
}
