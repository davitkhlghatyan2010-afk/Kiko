"use client";

import { useState } from "react";
import { answerProof, skipTask, submitProof } from "@/lib/api";

// 8x8 filled square when done, 2px outlined square when not -- the Design
// System's task-row bullet, standing in for a checkbox without implying
// partial credit (it's a marker, not a control).
function TaskBullet({ done }) {
  return done ? (
    <span className="inline-block h-2 w-2 shrink-0 bg-ink" />
  ) : (
    <span className="inline-block h-2 w-2 shrink-0 border-2 border-ink" />
  );
}

// Binary display, no partial credit anywhere: a task is either the plain
// "done" row, or mid-flow (summary/question), or waiting to be started.
// Only answering the AI question flips completed -- see backend/src/routes/proofs.js.
export function TaskItem({ task, onProved, onSkipped }) {
  const [phase, setPhase] = useState(task.pendingProof ? "question" : "idle");
  const [proofId, setProofId] = useState(task.pendingProof?.id ?? null);
  const [aiQuestion, setAiQuestion] = useState(task.pendingProof?.aiQuestion ?? null);
  const [summary, setSummary] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [skipping, setSkipping] = useState(false);

  async function handleSkip() {
    setSkipping(true);
    try {
      await skipTask(task.id);
      onSkipped?.();
    } finally {
      setSkipping(false);
    }
  }

  if (task.completed) {
    return (
      <li className="flex items-center gap-2">
        <TaskBullet done />
        {task.text} — {task.amount}
      </li>
    );
  }

  if (phase === "idle") {
    return (
      <li className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2">
          <TaskBullet done={false} />
          {task.text} — {task.amount}
        </span>
        <span className="flex items-center gap-3">
          {task.recurring && (
            <button onClick={handleSkip} disabled={skipping} className="text-xs underline disabled:opacity-60">
              {skipping ? "Skipping..." : "Skip today"}
            </button>
          )}
          <button onClick={() => setPhase("summary")} className="text-xs underline">
            Mark done
          </button>
        </span>
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
      <li className="flex flex-col gap-2 rounded-2xl border-2 border-ink p-3">
        <p className="flex items-center gap-2 text-sm">
          <TaskBullet done={false} />
          {task.text} — {task.amount}
        </p>
        <form onSubmit={handleSummarySubmit} className="flex flex-col gap-2">
          <label className="text-sm">
            What did you do / learn?
            <textarea
              className="mt-1 w-full border-b-2 border-ink bg-transparent px-1 py-2 text-ink outline-none"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={3}
              required
            />
          </label>
          {error && <p className="text-sm text-dead">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-alert px-4 py-2 text-sm font-semibold text-sky-cloud disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </form>
      </li>
    );
  }

  return (
    <li className="flex flex-col gap-2 rounded-2xl border-2 border-ink p-3">
      <p className="flex items-center gap-2 text-sm">
        <TaskBullet done={false} />
        {task.text} — {task.amount}
      </p>
      <p className="text-sm font-semibold">{aiQuestion}</p>
      <form onSubmit={handleAnswerSubmit} className="flex flex-col gap-2">
        <textarea
          className="w-full border-b-2 border-ink bg-transparent px-1 py-2 text-ink outline-none"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows={2}
          required
        />
        {error && <p className="text-sm text-dead">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-alert px-4 py-2 text-sm font-semibold text-sky-cloud disabled:opacity-60"
        >
          {submitting ? "Submitting..." : "Answer"}
        </button>
      </form>
    </li>
  );
}
