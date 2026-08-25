"use client";

import { useState } from "react";
import { addTasks } from "@/lib/api";
import { TaskItem } from "@/components/TaskItem";
import { emptyTask, TaskRows } from "@/components/TaskRows";

// Today's tasks can't be edited or removed once declared -- only proved (via
// TaskItem) or added to (via addTasks) -- same rule /declare/add enforces.
export function TasksModal({ day, onClose, onChanged }) {
  const [adding, setAdding] = useState(false);
  const [newTasks, setNewTasks] = useState([emptyTask()]);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleAddSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
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
            <TaskItem key={task.id} task={task} onProved={onChanged} />
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
      </div>
    </div>
  );
}
