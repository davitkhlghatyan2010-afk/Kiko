"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { addTasks, getToday } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { emptyTask, TaskRows } from "@/components/TaskRows";

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
      <main className="flex flex-1 items-center justify-center bg-sky-cloud px-6 text-ink">
        <p className="text-sm text-stone">Loading...</p>
      </main>
    );
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-sky-cloud px-6 py-10">
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
    </main>
  );
}
