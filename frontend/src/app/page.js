"use client";

import { useCallback, useEffect, useState } from "react";
import { getHealth, getStreak, getToday, startDay } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Countdown } from "@/components/Countdown";
import { PomodoroTimer } from "@/components/PomodoroTimer";
import { TaskItem } from "@/components/TaskItem";
import { MAX_TOTAL_MINUTES, MIN_TOTAL_MINUTES, splitSession } from "@/lib/pomodoro";

export default function Home() {
  const { user, loading } = useAuth();
  const [status, setStatus] = useState("checking");
  const [day, setDay] = useState(undefined);
  const [starting, setStarting] = useState(false);
  const [focusMinutes, setFocusMinutes] = useState(String(MIN_TOTAL_MINUTES));
  const [focusMinutesError, setFocusMinutesError] = useState(null);
  const [pomodoroBlocks, setPomodoroBlocks] = useState(null);
  const [streak, setStreak] = useState(null);

  useEffect(() => {
    getHealth()
      .then(() => setStatus("ok"))
      .catch(() => setStatus("error"));
  }, []);

  const refresh = useCallback(() => {
    getToday()
      .then(({ day }) => setDay(day))
      .catch(() => setDay(null));
    getStreak()
      .then(({ streak }) => setStreak(streak))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    refresh();
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, [user, refresh]);

  async function handleStart() {
    const minutes = Number(focusMinutes);
    if (!Number.isInteger(minutes) || minutes < MIN_TOTAL_MINUTES || minutes > MAX_TOTAL_MINUTES) {
      setFocusMinutesError(`Enter a whole number between ${MIN_TOTAL_MINUTES} and ${MAX_TOTAL_MINUTES}`);
      return;
    }
    setFocusMinutesError(null);
    setStarting(true);
    try {
      // Unchanged: this is the day-start call that scoring/deadline logic cares about.
      // The Pomodoro sequence below is purely a client-side companion on top of it.
      const { day } = await startDay();
      setDay(day);
      setPomodoroBlocks(splitSession(minutes));
    } finally {
      setStarting(false);
    }
  }

  return (
    <main className="flex flex-1 flex-col items-center gap-6 bg-sky-cloud px-6 py-10 text-ink">
      <p className="font-mono text-xs uppercase tracking-wide text-stone">
        backend:{" "}
        <span className={status === "ok" ? "text-foliage-dark" : status === "error" ? "text-alert" : "text-stone"}>
          {status}
        </span>
      </p>

      {loading ? (
        <p className="text-sm text-stone">Loading session...</p>
      ) : user ? (
        <div className="flex w-full flex-col items-center gap-3 text-sm">
          <p>
            {user.accountType}
            {user.isAdmin ? ", admin" : ""}
            {streak !== null && <span className="ml-2 font-mono text-xs uppercase tracking-wide">Streak: {streak}</span>}
          </p>

          {day === undefined ? (
            <p className="text-stone">Checking today...</p>
          ) : day === null ? (
            <a href="/declare" className="rounded-xl bg-alert px-5 py-2 font-semibold text-sky-cloud">
              Declare today
            </a>
          ) : (
            <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl border-2 border-ink bg-wall p-6">
              {/* The deadline countdown is always the largest, primary timer on screen. */}
              <Countdown deadlineAt={day.deadlineAt} />

              {day.startedAt ? (
                <p className="font-mono text-xs uppercase tracking-wide text-stone">
                  Started {new Date(day.startedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              ) : (
                <div className="flex w-full flex-col gap-2">
                  <label className="block text-sm">
                    Focus minutes ({MIN_TOTAL_MINUTES}-{MAX_TOTAL_MINUTES})
                    <input
                      type="number"
                      min={MIN_TOTAL_MINUTES}
                      max={MAX_TOTAL_MINUTES}
                      className="mt-1 w-full border-b-2 border-ink bg-transparent px-1 py-2 text-xl text-ink outline-none"
                      value={focusMinutes}
                      onChange={(e) => setFocusMinutes(e.target.value)}
                    />
                  </label>
                  {focusMinutesError && <p className="text-xs text-dead">{focusMinutesError}</p>}
                  <button
                    onClick={handleStart}
                    disabled={starting}
                    className="w-full rounded-xl bg-alert px-5 py-2 font-semibold text-sky-cloud disabled:opacity-60"
                  >
                    {starting ? "Starting..." : "Start"}
                  </button>
                </div>
              )}

              {pomodoroBlocks && (
                <PomodoroTimer blocks={pomodoroBlocks} onStop={() => setPomodoroBlocks(null)} />
              )}

              {/* Binary display only -- no partial credit anywhere. Once day.credit is
                  finalized (server-side, in proofs.js or the deadline sweep job), it wins
                  over the live task snapshot -- otherwise a task proved *after* the
                  deadline would wrongly flip this to "done" even though the day already
                  scored 'none'. */}
              <p className="self-start font-mono text-xs uppercase tracking-wide text-stone">
                Today:{" "}
                {day.credit
                  ? day.credit === "full"
                    ? "done"
                    : "not done"
                  : day.tasks.length > 0 && day.tasks.every((t) => t.completed)
                    ? "done"
                    : "not done"}
              </p>

              <ul className="flex w-full flex-col gap-2 self-start">
                {day.tasks.map((task) => (
                  <TaskItem key={task.id} task={task} onProved={refresh} />
                ))}
              </ul>
              <a href="/declare/add" className="self-start text-sm underline">
                + Add another task
              </a>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-stone">Log in or create an account to get started.</p>
      )}
    </main>
  );
}
