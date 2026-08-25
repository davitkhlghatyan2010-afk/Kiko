export function emptyTask() {
  return { text: "", amount: "" };
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
        <div key={index} className="mb-4 rounded border border-stone p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wide text-stone">Task {index + 1}</span>
            {tasks.length > 1 && (
              <button type="button" onClick={() => removeTask(index)} className="text-xs underline">
                Remove
              </button>
            )}
          </div>

          <label className="mb-2 block text-sm">
            What
            <input
              className="mt-1 w-full rounded border border-stone bg-sky-cloud px-3 py-2 text-ink"
              value={task.text}
              onChange={(e) => updateTask(index, { text: e.target.value })}
              placeholder="Read chapter 4"
              required
            />
          </label>

          <label className="block text-sm">
            How much
            <input
              className="mt-1 w-full rounded border border-stone bg-sky-cloud px-3 py-2 text-ink"
              value={task.amount}
              onChange={(e) => updateTask(index, { amount: e.target.value })}
              placeholder="20 pages"
              required
            />
          </label>
        </div>
      ))}

      <button type="button" onClick={addTask} className="mb-4 text-sm underline">
        + Add another task
      </button>
    </>
  );
}
