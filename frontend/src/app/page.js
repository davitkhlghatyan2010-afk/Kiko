"use client";

import { useCallback, useEffect, useState } from "react";
import { getStreak, getToday, startDay } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Countdown } from "@/components/Countdown";
import { PomodoroTimer } from "@/components/PomodoroTimer";
import { FocusMinutesForm } from "@/components/FocusMinutesForm";
import { TasksModal } from "@/components/TasksModal";
import { PixelBackdrop } from "@/components/PixelBackdrop";
import { splitSession } from "@/lib/pomodoro";
import { streakToTier } from "@/lib/gardenTier";

function tasksButtonLabel(tasks) {
  if (!tasks || tasks.length === 0) return "Tasks";
  if (tasks.length === 1) return `${tasks[0].text} — ${tasks[0].amount}`;
  const done = tasks.filter((t) => t.completed).length;
  return `Tasks: ${done}/${tasks.length} done`;
}

export default function Home() {
  const { user, loading } = useAuth();
  const [day, setDay] = useState(undefined);
  const [pomodoroBlocks, setPomodoroBlocks] = useState(null);
  const [streak, setStreak] = useState(null);
  const [tasksOpen, setTasksOpen] = useState(false);

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

  function handleTasksChanged() {
    refresh();
  }

  const centeredPill = "rounded-xl border-2 border-ink bg-wall px-4 py-2 text-sm text-ink";

  if (loading) {
    return (
      <PixelBackdrop>
        <p className={centeredPill}>Loading session...</p>
      </PixelBackdrop>
    );
  }

  if (!user) {
    return (
      <PixelBackdrop>
        <p className={centeredPill}>Log in or create an account to get started.</p>
      </PixelBackdrop>
    );
  }

  if (day === undefined) {
    return (
      <PixelBackdrop tier={streakToTier(streak)}>
        <p className={centeredPill}>Checking today...</p>
      </PixelBackdrop>
    );
  }

  if (day === null) {
    return (
      <PixelBackdrop tier={streakToTier(streak)}>
        <a href="/declare" className="rounded-xl bg-alert px-5 py-2 font-semibold text-sky-cloud">
          Declare today
        </a>
      </PixelBackdrop>
    );
  }

  return (
    <PixelBackdrop tier={streakToTier(streak)} stretch>
      {/* Deadline countdown, floating over the sky -- always the largest,
          primary timer on screen, visible the moment today is declared. */}
      <Countdown deadlineAt={day.deadlineAt} />

      <div className="flex flex-col items-center gap-3">
        {pomodoroBlocks && <PomodoroTimer blocks={pomodoroBlocks} onStop={() => setPomodoroBlocks(null)} />}
      </div>

      <div className="flex w-full max-w-sm flex-col items-center gap-3 px-6">
        {pomodoroBlocks ? null : day.startedAt ? (
          <FocusMinutesForm
            onStart={handleStartPomodoro}
            buttonLabel="Start a focus session"
            busyLabel="Starting..."
          />
        ) : (
          <FocusMinutesForm onStart={handleStart} buttonLabel="Start" busyLabel="Starting..." />
        )}

        <button
          type="button"
          onClick={() => setTasksOpen(true)}
          className="rounded-xl border-2 border-ink bg-wall px-4 py-2 text-sm font-semibold text-ink"
        >
          {tasksButtonLabel(day.tasks)}
        </button>
      </div>

      {tasksOpen && <TasksModal day={day} onClose={() => setTasksOpen(false)} onChanged={handleTasksChanged} />}
    </PixelBackdrop>
  );
}
