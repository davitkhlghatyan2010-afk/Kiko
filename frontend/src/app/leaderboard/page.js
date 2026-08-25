"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getGlobalLeaderboard, getGroupLeaderboard } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { PixelBackdrop } from "@/components/PixelBackdrop";
import { PixelAvatar } from "@/components/PixelAvatar";

export default function LeaderboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  // null = "no explicit choice yet" -- falls back to group for group
  // accounts, global otherwise. Set once a toggle button is clicked.
  const [view, setView] = useState(null);
  const [rows, setRows] = useState(undefined);
  const [error, setError] = useState(null);

  const isGroup = user?.accountType === "group";
  const effectiveView = view ?? (isGroup ? "group" : "global");

  useEffect(() => {
    if (loading) return;
    if (!user) router.push("/login");
  }, [loading, user, router]);

  const refresh = useCallback((which) => {
    const fetcher = which === "group" ? getGroupLeaderboard : getGlobalLeaderboard;
    fetcher()
      .then(({ leaderboard }) => {
        setRows(leaderboard);
        setError(null);
      })
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (!user) return;
    refresh(effectiveView);
  }, [user, effectiveView, refresh]);

  function selectView(next) {
    setView(next);
    setRows(undefined);
    setError(null);
  }

  if (loading || !user) {
    return (
      <PixelBackdrop>
        <p className="rounded-xl border-2 border-ink bg-wall px-4 py-2 text-sm text-ink">Loading...</p>
      </PixelBackdrop>
    );
  }

  return (
    <PixelBackdrop stretch>
      <div className="flex w-full max-w-sm flex-1 flex-col items-center gap-4 py-8">
        <h1 className="text-2xl font-semibold text-ink">Leaderboard</h1>

        {isGroup && (
          <div className="flex gap-2 rounded-xl border-2 border-ink bg-wall p-1">
            <button
              type="button"
              onClick={() => selectView("group")}
              className={`rounded-lg px-4 py-1 text-sm font-semibold ${
                effectiveView === "group" ? "bg-alert text-sky-cloud" : "text-ink"
              }`}
            >
              Group
            </button>
            <button
              type="button"
              onClick={() => selectView("global")}
              className={`rounded-lg px-4 py-1 text-sm font-semibold ${
                effectiveView === "global" ? "bg-alert text-sky-cloud" : "text-ink"
              }`}
            >
              Global
            </button>
          </div>
        )}

        <div className="w-full flex-1 overflow-y-auto rounded-2xl border-2 border-ink bg-wall p-4">
          {error && <p className="text-sm text-dead">{error}</p>}

          {!error && rows === undefined && <p className="text-sm text-stone">Loading rankings...</p>}

          {!error && rows?.length === 0 && (
            <p className="text-sm text-stone">
              {effectiveView === "group" ? "You're not on a group account." : "No one's declared a day yet."}
            </p>
          )}

          {!error && rows && rows.length > 0 && (
            <ol className="flex flex-col gap-2">
              {rows.map((row, i) => (
                <li
                  key={row.userId}
                  className={`flex items-center gap-3 rounded-xl p-2 ${
                    row.isSelf ? "border-2 border-ink bg-sky-cloud" : ""
                  }`}
                >
                  <span className="w-5 shrink-0 text-right font-mono text-sm text-stone">{i + 1}</span>
                  <PixelAvatar id={row.userId} />
                  <span className="flex-1 truncate text-sm font-semibold text-ink">
                    {row.username}
                    {row.isSelf && " (you)"}
                  </span>
                  <span className="font-mono text-xs uppercase tracking-wide text-stone">{row.streak} streak</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </PixelBackdrop>
  );
}
