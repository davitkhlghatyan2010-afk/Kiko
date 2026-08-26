"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProfileStats } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { PixelBackdrop } from "@/components/PixelBackdrop";
import { PixelAvatar } from "@/components/PixelAvatar";
import { PixelGlyph } from "@/components/PixelGlyph";
import { ProfileEditModal } from "@/components/ProfileEditModal";
import { CutoffTimeModal } from "@/components/CutoffTimeModal";

function StatTile({ kind, value, label, sub }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border-2 border-ink bg-sky-cloud p-3">
      <div className="flex items-center gap-2">
        <PixelGlyph kind={kind} />
        <span className="font-mono text-2xl leading-none text-ink">{value}</span>
      </div>
      <div>
        <p className="text-sm text-ink">{label}</p>
        {sub && <p className="text-xs leading-snug text-stone">{sub}</p>}
      </div>
    </div>
  );
}

const HISTORY_COLOR = {
  full: "bg-foliage-dark",
  none: "bg-alert",
  empty: "bg-stone/30",
};

export default function ProfilePage() {
  const { user, loading, updateUser } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState(undefined);
  const [error, setError] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [cutoffOpen, setCutoffOpen] = useState(false);

  const refresh = useCallback(() => {
    getProfileStats()
      .then((data) => {
        setStats(data);
        setError(null);
      })
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    refresh();
  }, [loading, user, router, refresh]);

  if (loading || !user) {
    return (
      <PixelBackdrop>
        <p className="rounded-xl border-2 border-ink bg-wall px-4 py-2 text-sm text-ink">Loading...</p>
      </PixelBackdrop>
    );
  }

  return (
    <PixelBackdrop tier={stats?.gardenTier ?? "bloom"} stretch>
      <div className="flex w-full max-w-md flex-1 flex-col gap-4 overflow-y-auto py-8">
        <div className="flex items-center gap-4 rounded-2xl border-2 border-ink bg-wall p-4">
          <PixelAvatar v={user.avatar} scale={3} />
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-ink">{user.username}</h1>
            <p className="text-sm text-stone">
              {user.accountType}
              {user.isAdmin ? ", admin" : ""}
            </p>
          </div>
          <button type="button" onClick={() => setEditOpen(true)} className="text-sm underline">
            Edit
          </button>
        </div>

        {error && <p className="rounded-xl border-2 border-ink bg-wall p-4 text-sm text-dead">{error}</p>}

        {!error && stats === undefined && (
          <p className="rounded-xl border-2 border-ink bg-wall p-4 text-sm text-stone">Loading stats...</p>
        )}

        {!error && stats && (
          <>
            <div className="rounded-2xl border-2 border-ink bg-wall p-4">
              <p className="font-mono text-4xl font-medium leading-none text-ink">
                {stats.medianTimeLeftWhenStarted ?? "—"}
              </p>
              <p className="mt-1 text-sm text-ink">Median time left when you began</p>
              <p className="text-xs text-stone">The one number the pilot is measuring.</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <StatTile kind="sprout" value={stats.lifetimeCleanDays} label="Clean days" />
              <StatTile kind="lantern" value={stats.currentStreak} label="Current streak" />
              <StatTile kind="peak" value={stats.longestStreak} label="Longest streak" />
              <StatTile
                kind="hearth"
                value={stats.sessions.count}
                label="Focus sessions"
                sub={
                  stats.sessions.median
                    ? `Median ${stats.sessions.median} · Longest ${stats.sessions.longest}`
                    : null
                }
              />
              <StatTile kind="check" value={stats.totalTasksCompleted} label="Tasks done, all time" />
            </div>

            <div className="rounded-2xl border-2 border-ink bg-wall p-4">
              <p className="mb-2 text-sm text-stone">Last thirty days</p>
              <div className="grid grid-cols-10 gap-1">
                {stats.history.map((day) => (
                  <div
                    key={day.date}
                    title={`${new Date(day.date).toLocaleDateString()}: ${day.status}`}
                    className={`aspect-square rounded-sm ${HISTORY_COLOR[day.status]}`}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-2xl border-2 border-ink bg-wall p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <PixelGlyph kind="cog" />
                  <div>
                    <p className="text-sm text-ink">Cutoff time</p>
                    <p className="font-mono text-lg text-ink">{user.cutoffTime}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCutoffOpen(true)}
                  className="rounded-xl border-2 border-ink px-3 py-1 text-sm"
                >
                  Change
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {editOpen && (
        <ProfileEditModal user={user} onClose={() => setEditOpen(false)} onSaved={updateUser} />
      )}
      {cutoffOpen && (
        <CutoffTimeModal user={user} onClose={() => setCutoffOpen(false)} onSaved={updateUser} />
      )}
    </PixelBackdrop>
  );
}
