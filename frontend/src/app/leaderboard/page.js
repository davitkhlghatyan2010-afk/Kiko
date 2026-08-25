"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getGlobalLeaderboard, getGroupLeaderboard } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { PixelBackdrop } from "@/components/PixelBackdrop";
import { PixelAvatar } from "@/components/PixelAvatar";
import { PixelBed } from "@/components/PixelBed";

function Row({ row, pinned = false }) {
  return (
    <li
      className={`flex items-start gap-3 p-3 ${pinned ? "border-t-2 border-ink" : "border-b border-ink/10"} ${
        row.isSelf ? "bg-sky-cloud" : ""
      }`}
    >
      <span
        className={`w-6 shrink-0 pt-1 text-right font-mono ${pinned ? "text-sm" : "text-lg"} ${
          row.isSelf ? "text-ink" : "text-stone"
        }`}
      >
        {row.place}
      </span>
      <div className="flex w-14 shrink-0 flex-col items-center gap-1">
        <PixelAvatar id={row.userId} scale={3} />
        <span className={`text-center text-xs leading-tight ${row.isSelf ? "font-semibold" : ""} text-ink`}>
          {row.username}
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-2xl leading-none text-ink">{row.days}</span>
          <span className="flex-1 text-xs text-stone">{row.days === 1 ? "clean day" : "clean days"}</span>
        </div>
        <PixelBed days={row.days} tier={row.tier} />
      </div>
    </li>
  );
}

export default function LeaderboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  // null = "no explicit choice yet" -- falls back to group for group
  // accounts, global otherwise. Set once a toggle button is clicked.
  const [view, setView] = useState(null);
  const [data, setData] = useState(undefined);
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
      .then((res) => {
        setData(res);
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
    setData(undefined);
    setError(null);
  }

  if (loading || !user) {
    return (
      <PixelBackdrop>
        <p className="rounded-xl border-2 border-ink bg-wall px-4 py-2 text-sm text-ink">Loading...</p>
      </PixelBackdrop>
    );
  }

  const title = effectiveView === "group" ? "Your group" : "Everyone";
  const subtitle =
    data === undefined
      ? ""
      : effectiveView === "group"
        ? `${data.totalCount} ${data.totalCount === 1 ? "person" : "people"}. One plant per clean day.`
        : `The top ten of ${data.totalCount} ${data.totalCount === 1 ? "person" : "people"}.`;
  const footer =
    effectiveView === "group"
      ? "A bed fills at fourteen plants. Equal counts share a place, so a tie shows the same number twice."
      : "The top ten, then your own row with the place you hold out of everyone.";

  return (
    <PixelBackdrop stretch>
      <div className="flex w-full max-w-md flex-1 flex-col gap-4 py-8">
        <div className="flex flex-col gap-3 px-2">
          <div>
            <h1 className="text-2xl font-semibold text-ink">{title}</h1>
            {subtitle && <p className="text-sm text-stone">{subtitle}</p>}
          </div>

          {isGroup && (
            <div className="flex overflow-hidden rounded-xl border-2 border-ink">
              <button
                type="button"
                onClick={() => selectView("group")}
                className={`flex-1 py-2 text-sm ${
                  effectiveView === "group" ? "bg-ink text-wall" : "bg-wall text-ink"
                }`}
              >
                My group
              </button>
              <button
                type="button"
                onClick={() => selectView("global")}
                className={`flex-1 border-l-2 border-ink py-2 text-sm ${
                  effectiveView === "global" ? "bg-ink text-wall" : "bg-wall text-ink"
                }`}
              >
                Everyone
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto rounded-2xl border-2 border-ink bg-wall">
          {error && <p className="p-4 text-sm text-dead">{error}</p>}

          {!error && data === undefined && <p className="p-4 text-sm text-stone">Loading rankings...</p>}

          {!error && data?.leaderboard.length === 0 && (
            <p className="p-4 text-sm text-stone">
              {effectiveView === "group" ? "You're not on a group account." : "No one's declared a day yet."}
            </p>
          )}

          {!error && data && data.leaderboard.length > 0 && (
            <ul>
              {data.leaderboard.map((row) => (
                <Row key={row.userId} row={row} />
              ))}
              {data.pinnedSelf && <Row row={data.pinnedSelf} pinned />}
            </ul>
          )}

          {!error && data && data.leaderboard.length > 0 && (
            <p className="px-4 py-3 text-xs leading-relaxed text-stone">{footer}</p>
          )}
        </div>
      </div>
    </PixelBackdrop>
  );
}
