"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { addTasks, createRecurringTask, getToday } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { emptyTask, TaskRows } from "@/components/TaskRows";
import { PixelBackdrop } from "@/components/PixelBackdrop";

export default function AddTasksPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [tasks, setTasks] = useState([emptyTask()]);
  const [checkingToday, setCheckingToday] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    getToday()
      .then(({ day }) => {
        if (!day) router.push("/declare");
      })
      .finally(() => setCheckingToday(false));
  }, [authLoading, user, router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      // Unlike declaring a fresh day, adding to an already-declared one never
      // auto-includes recurring templates -- so a "repeat every day" task
      // still needs to be added to today explicitly, on top of creating the
      // template for future days.
      const repeating = tasks.filter((task) => task.repeat);
      await Promise.all(repeating.map((task) => createRecurringTask(task.text, task.amount)));
      await addTasks(tasks);
      router.push("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading || checkingToday) {
    return (
      <PixelBackdrop>
        <p className="border-2 border-ink bg-wall px-4 py-2 font-pixel-body text-xs text-ink">Loading...</p>
      </PixelBackdrop>
    );
  }

  return (
    <PixelBackdrop>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg border-4 border-ink bg-wall/95 p-6 text-ink shadow-[8px_8px_0_0_var(--color-ink)]"
      >
        <h1 className="mb-2 font-pixel-display text-lg tracking-wide">Add to today</h1>
        <p className="mb-6 font-pixel-body text-xs text-stone">
          Tasks already declared today can&apos;t be edited or removed — this only adds more on top, before
          tonight&apos;s deadline.
        </p>

        <TaskRows tasks={tasks} setTasks={setTasks} />

        {error && <p className="mb-3 font-pixel-body text-xs text-dead">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full border-4 border-ink bg-wood-mid px-4 py-3 font-pixel-display text-[10px] uppercase tracking-wide text-sky-cloud shadow-[4px_4px_0_0_var(--color-ink)] transition-transform hover:bg-wood-dark active:translate-x-1 active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Adding..." : "Add tasks"}
        </button>
      </form>
    </PixelBackdrop>
  );
}
