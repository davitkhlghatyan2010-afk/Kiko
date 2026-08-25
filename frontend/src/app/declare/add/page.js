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
        <p className="rounded-xl border-2 border-ink bg-wall px-4 py-2 text-sm text-ink">Loading...</p>
      </PixelBackdrop>
    );
  }

  return (
    <PixelBackdrop>
      <form onSubmit={handleSubmit} className="w-full max-w-lg rounded-2xl border-2 border-ink bg-wall p-6 text-ink">
        <h1 className="mb-1 text-2xl font-semibold">Add to today</h1>
        <p className="mb-6 text-sm text-stone">
          Tasks already declared today can&apos;t be edited or removed — this only adds more on top, before
          tonight&apos;s deadline.
        </p>

        <TaskRows tasks={tasks} setTasks={setTasks} />

        {error && <p className="mb-3 text-sm text-dead">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-alert px-4 py-2 font-semibold text-sky-cloud disabled:opacity-60"
        >
          {submitting ? "Adding..." : "Add tasks"}
        </button>
      </form>
    </PixelBackdrop>
  );
}
