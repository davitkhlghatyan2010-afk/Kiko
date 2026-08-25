import { prisma } from "../db.js";

// Authoritative closing rule: a day whose deadline has passed and is still
// unresolved becomes 'full' if every declared task was completed (and
// proved), else 'none'. POST /proofs/:id/answer also applies this same rule
// optimistically the instant the last task is proved (so the UI/streak update
// immediately rather than waiting up to SWEEP_INTERVAL_MS) -- this sweep is
// the catch-all for days that were never fully proved before the deadline.
export async function finalizeExpiredDays() {
  const expired = await prisma.day.findMany({
    where: { credit: null, deadlineAt: { lt: new Date() } },
    include: { tasks: true },
  });

  for (const day of expired) {
    const allDone = day.tasks.length > 0 && day.tasks.every((task) => task.completed);
    await prisma.day.update({
      where: { id: day.id },
      data: { credit: allDone ? "full" : "none" },
    });
  }

  return expired.length;
}

const SWEEP_INTERVAL_MS = 60_000;

export function startDeadlineSweep() {
  return setInterval(() => {
    finalizeExpiredDays().catch((err) => console.error("deadline sweep failed:", err));
  }, SWEEP_INTERVAL_MS);
}
