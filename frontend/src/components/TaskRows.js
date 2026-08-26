export function emptyTask() {
  return { text: "", amount: "", repeat: false };
}

export function TaskRows({ tasks, setTasks }) {
  function updateTask(index, patch) {
    setTasks((prev) => prev.map((task, i) => (i === index ? { ...task, ...patch } : task)));
  }

  function addTask() {
    setTasks((prev) => [...prev, emptyTask()]);
  }

  function removeTask(index) {
    setTasks((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  }

  return (
    <>
      {tasks.map((task, index) => (
        <div key={index} className="mb-4 border-4 border-ink bg-wall/70 p-4 shadow-[4px_4px_0_0_var(--color-ink)]">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-pixel-body text-[10px] uppercase tracking-wide text-stone">Task {index + 1}</span>
            {tasks.length > 1 && (
              <button
                type="button"
                onClick={() => removeTask(index)}
                className="font-pixel-body text-[10px] uppercase tracking-wide text-alert underline underline-offset-2"
              >
                Remove
              </button>
            )}
          </div>

          <label className="mb-3 block font-pixel-body text-[10px] uppercase tracking-wide text-stone">
            What
            <input
              className="mt-1 w-full border-2 border-ink bg-sky-cloud px-3 py-2 text-sm font-normal normal-case tracking-normal text-ink outline-none focus:border-fire"
              value={task.text}
              onChange={(e) => updateTask(index, { text: e.target.value })}
              placeholder="Read chapter 4"
              required
            />
          </label>

          <label className="mb-3 block font-pixel-body text-[10px] uppercase tracking-wide text-stone">
            How much
            <input
              className="mt-1 w-full border-2 border-ink bg-sky-cloud px-3 py-2 text-sm font-normal normal-case tracking-normal text-ink outline-none focus:border-fire"
              value={task.amount}
              onChange={(e) => updateTask(index, { amount: e.target.value })}
              placeholder="20 pages"
              required
            />
          </label>

          <label className="flex items-center gap-2 font-pixel-body text-xs text-ink">
            <input
              type="checkbox"
              checked={task.repeat}
              onChange={(e) => updateTask(index, { repeat: e.target.checked })}
              className="sr-only"
            />
            <span
              aria-hidden="true"
              className={`h-5 w-5 shrink-0 border-2 border-ink ${task.repeat ? "bg-fire" : "bg-sky-cloud"}`}
            />
            Repeat every day
          </label>
        </div>
      ))}

      <button
        type="button"
        onClick={addTask}
        className="mb-4 font-pixel-body text-xs font-semibold uppercase tracking-wide text-wood-dark underline decoration-2 underline-offset-4 hover:text-fire"
      >
        + Add another task
      </button>
    </>
  );
}
