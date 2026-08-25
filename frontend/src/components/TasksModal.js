"use client";

import { useEffect, useState } from "react";
import { addTasks, createRecurringTask, deleteRecurringTask, getRecurringTasks } from "@/lib/api";
import { TaskItem } from "@/components/TaskItem";
import { emptyTask, TaskRows } from "@/components/TaskRows";

// Today's tasks can't be edited or removed once declared -- only proved (via
// TaskItem), skipped for today if recurring-origin (also via TaskItem), or
// added to (via addTasks) -- same rule /declare/add enforces.
export function TasksModal({ day, onClose, onChanged }) {
  const [adding, setAdding] = useState(false);
  const [newTasks, setNewTasks] = useState([emptyTask()]);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [recurringTasks, setRecurringTasks] = useState([]);

  useEffect(() => {
    getRecurringTasks()
      .then(({ recurringTasks }) => setRecurringTasks(recurringTasks))
      .catch(() => {});
  }, []);

  async function handleAddSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      // Adding to an already-declared day never auto-includes recurring
      // templates -- a "repeat every day" task still needs to be added to
      // today explicitly, on top of creating the template for future days.
      const repeating = newTasks.filter((task) => task.repeat);
      if (repeating.length > 0) {
        const created = await Promise.all(repeating.map((t) => createRecurringTask(t.text, t.amount)));
        setRecurringTasks((prev) => [...prev, ...created.map((r) => r.recurringTask)]);
      }
      await addTasks(newTasks);
      setNewTasks([emptyTask()]);
      setAdding(false);
      onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStopRepeating(id) {
    await deleteRecurringTask(id);
    setRecurringTasks((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center bg-ink/50 px-6"
      onClick={onClose}
    >
      <div
        className="max-h-[80vh] w-full max-w-sm overflow-y-auto rounded-2xl border-2 border-ink bg-wall p-6 text-ink"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Today&apos;s tasks</h2>
          <button type="button" onClick={onClose} className="text-sm underline">
            Close
          </button>
        </div>

        <ul className="mb-4 flex flex-col gap-2">
          {day.tasks.map((task) => (
            <TaskItem key={task.id} task={task} onProved={onChanged} onSkipped={onChanged} />
          ))}
        </ul>

        {adding ? (
          <form onSubmit={handleAddSubmit} className="flex flex-col gap-2">
            <TaskRows tasks={newTasks} setTasks={setNewTasks} />
            {error && <p className="text-sm text-dead">{error}</p>}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-xl bg-alert px-4 py-2 text-sm font-semibold text-sky-cloud disabled:opacity-60"
              >
                {submitting ? "Adding..." : "Add"}
              </button>
              <button type="button" onClick={() => setAdding(false)} className="text-sm underline">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button type="button" onClick={() => setAdding(true)} className="text-sm underline">
            + Add a task
          </button>
        )}

        {recurringTasks.length > 0 && (
          <div className="mt-6 border-t-2 border-ink pt-4">
            <p className="mb-2 font-mono text-xs uppercase tracking-wide text-stone">Repeating every day</p>
            <ul className="flex flex-col gap-2">
              {recurringTasks.map((task) => (
                <li key={task.id} className="flex items-center justify-between gap-2 text-sm">
                  <span>
                    {task.text} — {task.amount}
                  </span>
                  <button type="button" onClick={() => handleStopRepeating(task.id)} className="text-xs underline">
                    Stop repeating
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
