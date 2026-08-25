"use client";

import { useState } from "react";
import { answerProof, submitProof } from "@/lib/api";

// Binary display, no partial credit anywhere: a task is either the plain
// "done" row, or mid-flow (summary/question), or waiting to be started.
// Only answering the AI question flips completed -- see backend/src/routes/proofs.js.
export function TaskItem({ task, onProved }) {
  const [phase, setPhase] = useState(task.pendingProof ? "question" : "idle");
  const [proofId, setProofId] = useState(task.pendingProof?.id ?? null);
  const [aiQuestion, setAiQuestion] = useState(task.pendingProof?.aiQuestion ?? null);
  const [summary, setSummary] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (task.completed) {
    return (
      <li>
        ✓ {task.text} — {task.amount}
      </li>
    );
  }

  if (phase === "idle") {
    return (
      <li className="flex items-center justify-between gap-2">
        <span>
          ○ {task.text} — {task.amount}
        </span>
        <button onClick={() => setPhase("summary")} className="text-xs underline">
          Mark done
        </button>
      </li>
    );
  }

  async function handleSummarySubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { proof } = await submitProof(task.id, summary);
      setProofId(proof.id);
      setAiQuestion(proof.aiQuestion);
      setPhase("question");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAnswerSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await answerProof(proofId, answer);
      onProved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (phase === "summary") {
    return (
      <li className="flex flex-col gap-2 rounded border border-stone p-3">
        <p className="text-sm">
          ○ {task.text} — {task.amount}
        </p>
        <form onSubmit={handleSummarySubmit} className="flex flex-col gap-2">
          <label className="text-sm">
            What did you do / learn?
            <textarea
              className="mt-1 w-full rounded border border-stone bg-sky-cloud px-3 py-2 text-ink"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={3}
              required
            />
          </label>
          {error && <p className="rounded bg-stone/40 px-3 py-2 text-sm text-ink">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="rounded bg-alert px-4 py-2 text-sm font-semibold text-sky-cloud disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </form>
      </li>
    );
  }

  return (
    <li className="flex flex-col gap-2 rounded border border-stone p-3">
      <p className="text-sm">
        ○ {task.text} — {task.amount}
      </p>
      <p className="text-sm font-semibold">{aiQuestion}</p>
      <form onSubmit={handleAnswerSubmit} className="flex flex-col gap-2">
        <textarea
          className="w-full rounded border border-stone bg-sky-cloud px-3 py-2 text-ink"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows={2}
          required
        />
        {error && <p className="rounded bg-stone/40 px-3 py-2 text-sm text-ink">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-alert px-4 py-2 text-sm font-semibold text-sky-cloud disabled:opacity-60"
        >
          {submitting ? "Submitting..." : "Answer"}
        </button>
      </form>
    </li>
  );
}
