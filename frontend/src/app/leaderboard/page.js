"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getGlobalLeaderboard, getGroupLeaderboard, getGroupLeaderboardByCode } from "@/lib/api";
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
          <span className="font-mono text-xs uppercase tracking-wide text-stone">
            {row.streak} streak
          </span>
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
  // "code" is a third mode: a read-only peek at any group's board by invite
  // code, whether or not the viewer belongs to it -- lookupCode carries
  // which code that is.
  const [view, setView] = useState(null);
  const [codeInput, setCodeInput] = useState("");
  const [lookupCode, setLookupCode] = useState(null);
  const [data, setData] = useState(undefined);
  const [error, setError] = useState(null);

  const isGroup = user?.accountType === "group";
  const effectiveView = view ?? (isGroup ? "group" : "global");

  useEffect(() => {
    if (loading) return;
    if (!user) router.push("/login");
  }, [loading, user, router]);

  const refresh = useCallback((which, code) => {
    const fetcher =
      which === "group" ? getGroupLeaderboard : which === "code" ? () => getGroupLeaderboardByCode(code) : getGlobalLeaderboard;
    fetcher()
      .then((res) => {
        setData(res);
        setError(null);
      })
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (!user) return;
    refresh(effectiveView, lookupCode);
  }, [user, effectiveView, lookupCode, refresh]);

  function selectView(next) {
    setView(next);
    setLookupCode(null);
    setData(undefined);
    setError(null);
  }

  function handleLookup(e) {
    e.preventDefault();
    const code = codeInput.trim();
    if (!code) return;
    setView("code");
    setLookupCode(code);
    setData(undefined);
    setError(null);
  }

  if (loading || !user) {
    return (
      <PixelBackdrop>
        <p className="border-2 border-ink bg-wall px-4 py-2 font-pixel-body text-xs text-ink">Loading...</p>
      </PixelBackdrop>
    );
  }

  const isGroupShaped = effectiveView === "group" || effectiveView === "code";
  const title =
    effectiveView === "group" ? "Your group" : effectiveView === "code" ? (data?.groupName ?? "Group") : "Everyone";
  const subtitle =
    data === undefined
      ? ""
      : isGroupShaped
        ? `${data.totalCount} ${data.totalCount === 1 ? "person" : "people"}. One plant per clean day.`
        : `The top ten of ${data.totalCount} ${data.totalCount === 1 ? "person" : "people"}.`;
  const footer = isGroupShaped
    ? "A bed fills at fourteen plants. Equal counts share a place, so a tie shows the same number twice."
    : "The top ten, then your own row with the place you hold out of everyone.";

  return (
    <PixelBackdrop stretch>
      <div className="flex w-full max-w-md flex-1 flex-col gap-4 py-8">
        <div className="flex flex-col gap-3 px-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h1 className="font-pixel-display text-lg tracking-wide text-ink">{title}</h1>
              {subtitle && <p className="mt-2 text-sm text-stone">{subtitle}</p>}
            </div>
            {effectiveView === "code" && (
              <button
                type="button"
                onClick={() => selectView(null)}
                className="shrink-0 font-pixel-body text-[10px] uppercase tracking-wide underline underline-offset-2"
              >
                ← Back
              </button>
            )}
          </div>

          <form onSubmit={handleLookup} className="flex gap-2">
            <input
              className="min-w-0 flex-1 border-2 border-ink bg-sky-cloud px-3 py-2 text-sm text-ink outline-none focus:border-wood-mid"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              placeholder="Look up a group by code"
            />
            <button
              type="submit"
              className="shrink-0 border-2 border-ink bg-wall px-4 py-2 font-pixel-body text-[10px] uppercase tracking-wide text-ink hover:bg-wood-mid hover:text-sky-cloud"
            >
              View
            </button>
          </form>

          {isGroup && (
            <div className="flex overflow-hidden border-2 border-ink">
              <button
                type="button"
                onClick={() => selectView("group")}
                className={`flex-1 py-2 font-pixel-body text-[10px] uppercase tracking-wide ${
                  effectiveView === "group" ? "bg-ink text-wall" : "bg-wall text-ink"
                }`}
              >
                My group
              </button>
              <button
                type="button"
                onClick={() => selectView("global")}
                className={`flex-1 border-l-2 border-ink py-2 font-pixel-body text-[10px] uppercase tracking-wide ${
                  effectiveView === "global" ? "bg-ink text-wall" : "bg-wall text-ink"
                }`}
              >
                Everyone
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto border-4 border-ink bg-wall shadow-[6px_6px_0_0_var(--color-ink)]">
          {error && <p className="p-4 font-pixel-body text-xs text-dead">{error}</p>}

          {!error && data === undefined && <p className="p-4 font-pixel-body text-xs text-stone">Loading rankings...</p>}

          {!error && data?.leaderboard.length === 0 && (
            <p className="p-4 font-pixel-body text-xs text-stone">
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
