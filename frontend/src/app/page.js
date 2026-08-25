"use client";

import { useEffect, useState } from "react";
import { getHealth, getToday } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function Home() {
  const { user, loading, signOut } = useAuth();
  const [status, setStatus] = useState("checking");
  const [day, setDay] = useState(undefined);

  useEffect(() => {
    getHealth()
      .then(() => setStatus("ok"))
      .catch(() => setStatus("error"));
  }, []);

  useEffect(() => {
    if (!user) return;
    getToday()
      .then(({ day }) => setDay(day))
      .catch(() => setDay(null));
  }, [user]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 bg-sky-cloud px-6 text-ink">
      <h1 className="text-3xl font-semibold">Kiko</h1>
      <p className="font-mono text-sm uppercase tracking-wide">
        backend:{" "}
        <span
          className={
            status === "ok"
              ? "text-foliage-dark"
              : status === "error"
                ? "text-alert"
                : "text-stone"
          }
        >
          {status}
        </span>
      </p>

      {loading ? (
        <p className="text-sm text-stone">Loading session...</p>
      ) : user ? (
        <div className="flex flex-col items-center gap-3 text-sm">
          <p>
            Logged in as <strong>{user.username}</strong> ({user.accountType}
            {user.isAdmin ? ", admin" : ""})
          </p>

          {day === undefined ? (
            <p className="text-stone">Checking today...</p>
          ) : day === null ? (
            <a href="/declare" className="rounded bg-alert px-4 py-2 font-semibold text-sky-cloud">
              Declare today
            </a>
          ) : (
            <div className="w-full max-w-sm rounded bg-wall p-4">
              <p className="mb-2 font-mono text-xs uppercase tracking-wide text-stone">
                Deadline {new Date(day.deadlineAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
              <ul className="mb-3 flex flex-col gap-1">
                {day.tasks.map((task) => (
                  <li key={task.id}>
                    {task.completed ? "✓" : "○"} {task.text} — {task.amount}{" "}
                    <span className="text-stone">({task.type})</span>
                  </li>
                ))}
              </ul>
              <a href="/declare/add" className="text-sm underline">
                + Add another task
              </a>
            </div>
          )}

          <button onClick={signOut} className="rounded bg-wall px-4 py-2 underline">
            Log out
          </button>
        </div>
      ) : (
        <div className="flex gap-3 text-sm">
          <a href="/login" className="rounded bg-wall px-4 py-2 underline">
            Log in
          </a>
          <a href="/register" className="rounded bg-alert px-4 py-2 font-semibold text-sky-cloud">
            Create account
          </a>
        </div>
      )}
    </main>
  );
}
