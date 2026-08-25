"use client";

import { useCallback, useEffect, useState } from "react";
import { getHealth, getStreak, getToday, startDay } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Countdown } from "@/components/Countdown";
import { PomodoroTimer } from "@/components/PomodoroTimer";
import { TaskItem } from "@/components/TaskItem";
import { FocusMinutesForm } from "@/components/FocusMinutesForm";
import { PixelBackdrop } from "@/components/PixelBackdrop";
import { splitSession } from "@/lib/pomodoro";
import { streakToTier } from "@/lib/gardenTier";

export default function Home() {
  const { user, loading } = useAuth();
  const [status, setStatus] = useState("checking");
  const [day, setDay] = useState(undefined);
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

  // Fires once per day: the real startDay() call scoring/deadline logic
  // cares about, plus the first Pomodoro on top of it.
  async function handleStart(minutes) {
    const { day } = await startDay();
    setDay(day);
    setPomodoroBlocks(splitSession(minutes));
  }

  // After the day's already started, stopping a Pomodoro shouldn't strand the
  // user with no way to run another one -- this only re-launches the
  // client-side timer, it never touches startDay() again.
  function handleStartPomodoro(minutes) {
    setPomodoroBlocks(splitSession(minutes));
  }

  return (
    <PixelBackdrop tier={streakToTier(streak)}>
      <div className="flex flex-1 flex-col items-center gap-6 py-10 text-ink">
      <p className="rounded-xl border-2 border-ink bg-wall px-3 py-1 font-mono text-xs uppercase tracking-wide text-stone">
        backend:{" "}
        <span className={status === "ok" ? "text-foliage-dark" : status === "error" ? "text-alert" : "text-stone"}>
          {status}
        </span>
      </p>

      {loading ? (
        <p className="rounded-xl border-2 border-ink bg-wall px-4 py-2 text-sm text-ink">Loading session...</p>
      ) : user ? (
        <div className="flex w-full flex-col items-center gap-3 text-sm">
          <p className="rounded-xl border-2 border-ink bg-wall px-3 py-1 text-ink">
            {user.accountType}
            {user.isAdmin ? ", admin" : ""}
            {streak !== null && <span className="ml-2 font-mono text-xs uppercase tracking-wide">Streak: {streak}</span>}
          </p>

          {day === undefined ? (
            <p className="rounded-xl border-2 border-ink bg-wall px-4 py-2 text-ink">Checking today...</p>
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
                <FocusMinutesForm onStart={handleStart} buttonLabel="Start" busyLabel="Starting..." />
              )}

              {pomodoroBlocks ? (
                <PomodoroTimer blocks={pomodoroBlocks} onStop={() => setPomodoroBlocks(null)} />
              ) : (
                day.startedAt && (
                  <FocusMinutesForm
                    onStart={handleStartPomodoro}
                    buttonLabel="Start a focus session"
                    busyLabel="Starting..."
                  />
                )
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
        <p className="rounded-xl border-2 border-ink bg-wall px-4 py-2 text-sm text-ink">
          Log in or create an account to get started.
        </p>
      )}
      </div>
    </PixelBackdrop>
  );
}
