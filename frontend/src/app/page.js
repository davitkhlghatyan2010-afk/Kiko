"use client";

import { useCallback, useEffect, useState } from "react";
import { getStreak, getToday, startDay } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Countdown } from "@/components/Countdown";
import { PomodoroTimer } from "@/components/PomodoroTimer";
import { StartSessionModal } from "@/components/StartSessionModal";
import { TasksModal } from "@/components/TasksModal";
import { PixelBackdrop } from "@/components/PixelBackdrop";
import { splitSession } from "@/lib/pomodoro";

export default function Home() {
  const { user, loading } = useAuth();
  const [day, setDay] = useState(undefined);
  const [pomodoroBlocks, setPomodoroBlocks] = useState(null);
  // A brand new user with no day history yet should see the garden at its
  // best -- see computeGardenTier in backend/src/streak.js for the full
  // climb/decline rule this mirrors.
  const [gardenTier, setGardenTier] = useState("bloom");
  const [tasksOpen, setTasksOpen] = useState(false);
  const [startOpen, setStartOpen] = useState(false);
  // Drives the fullscreen backdrop: "work" swaps it to the room interior,
  // "rest"/null leaves it as the garden. Set by PomodoroTimer.
  const [pomodoroPhase, setPomodoroPhase] = useState(null);

  const refresh = useCallback(() => {
    getToday()
      .then(({ day }) => setDay(day))
      .catch(() => setDay(null));
    getStreak()
      .then(({ gardenTier }) => setGardenTier(gardenTier))
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
      <PixelBackdrop tier={gardenTier}>
        <p className={centeredPill}>Checking today...</p>
      </PixelBackdrop>
    );
  }

  if (day === null) {
    return (
      <PixelBackdrop tier={gardenTier}>
        <a href="/declare" className="rounded-xl bg-alert px-5 py-2 font-semibold text-sky-cloud">
          Declare today
        </a>
      </PixelBackdrop>
    );
  }

  return (
    <PixelBackdrop tier={gardenTier} stretch scene={pomodoroPhase === "work" ? "room" : "garden"}>
      {/* Floating over the sky -- always the largest, primary timer on
          screen. The deadline countdown while idle, swapped for the
          concentration-time countdown the instant a focus session starts. */}
      {pomodoroBlocks ? (
        <PomodoroTimer blocks={pomodoroBlocks} onPhaseChange={setPomodoroPhase} />
      ) : (
        <Countdown deadlineAt={day.deadlineAt} />
      )}

      <div className="flex w-full max-w-sm flex-col items-center gap-3 px-6">
        {pomodoroBlocks ? (
          <button
            type="button"
            onClick={() => setPomodoroBlocks(null)}
            className="rounded-xl bg-alert px-8 py-2 text-base font-semibold text-sky-cloud"
          >
            Stop
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setStartOpen(true)}
            className="w-full rounded-xl bg-alert px-5 py-2 font-semibold text-sky-cloud"
          >
            {day.startedAt ? "Start a focus session" : "Start"}
          </button>
        )}

        <button
          type="button"
          onClick={() => setTasksOpen(true)}
          className="rounded-xl border-2 border-ink bg-wall px-4 py-2 text-sm font-semibold text-ink"
        >
          Tasks
        </button>
      </div>

      {tasksOpen && <TasksModal day={day} onClose={() => setTasksOpen(false)} onChanged={handleTasksChanged} />}

      {startOpen && (
        <StartSessionModal
          title={day.startedAt ? "Start a focus session" : "Start your day"}
          buttonLabel={day.startedAt ? "Start a focus session" : "Start"}
          onStart={day.startedAt ? handleStartPomodoro : handleStart}
          onClose={() => setStartOpen(false)}
        />
      )}
    </PixelBackdrop>
  );
}
