import { Router } from "express";
import { prisma } from "../db.js";
import { generateFollowUpQuestion } from "../llm.js";

const router = Router();

async function loadOwnTask(taskId, userId) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { day: true, proof: true },
  });
  if (!task || task.day.userId !== userId) return null;
  return task;
}

router.post("/tasks/:id/proof", async (req, res, next) => {
  try {
    const { summary } = req.body ?? {};
    if (typeof summary !== "string" || !summary.trim()) {
      return res.status(400).json({ status: "error", message: "A summary is required" });
    }

    const task = await loadOwnTask(req.params.id, req.user.id);
    if (!task) {
      return res.status(404).json({ status: "error", message: "Task not found" });
    }
    if (task.completed) {
      return res.status(409).json({ status: "error", message: "Task is already complete" });
    }
    if (task.proof) {
      // Resume rather than duplicate: the summary was already submitted and a
      // question already generated, just not answered yet.
      return res.json({ proof: { id: task.proof.id, aiQuestion: task.proof.aiQuestion } });
    }

    const aiQuestion = await generateFollowUpQuestion(summary.trim());
    const proof = await prisma.proof.create({
      data: { taskId: task.id, summary: summary.trim(), aiQuestion },
    });

    res.status(201).json({ proof: { id: proof.id, aiQuestion: proof.aiQuestion } });
  } catch (err) {
    next(err);
  }
});

router.post("/proofs/:id/answer", async (req, res, next) => {
  try {
    const { answer } = req.body ?? {};
    if (typeof answer !== "string" || !answer.trim()) {
      return res.status(400).json({ status: "error", message: "An answer is required" });
    }

    const proof = await prisma.proof.findUnique({
      where: { id: req.params.id },
      include: { task: { include: { day: { include: { tasks: true } } } } },
    });
    if (!proof || proof.task.day.userId !== req.user.id) {
      return res.status(404).json({ status: "error", message: "Proof not found" });
    }
    if (proof.userAnswer) {
      return res.status(409).json({ status: "error", message: "This proof has already been answered" });
    }

    // Optimistic finalization: if every OTHER task on the day is already
    // completed and the deadline hasn't passed, this answer is the one that
    // finishes the day -- credit it as 'full' right now instead of waiting
    // for the sweep job (see backend/src/jobs/finalizeDays.js) to catch it.
    // Guarding on `credit === null` means a day already finalized (e.g. the
    // sweep beat this request to it) never gets overwritten here.
    const day = proof.task.day;
    const otherTasksDone = day.tasks.filter((t) => t.id !== proof.taskId).every((t) => t.completed);
    const dayNowFull = otherTasksDone && day.credit === null && day.deadlineAt > new Date();

    const ops = [
      prisma.proof.update({ where: { id: proof.id }, data: { userAnswer: answer.trim() } }),
      prisma.task.update({ where: { id: proof.taskId }, data: { completed: true } }),
    ];
    if (dayNowFull) {
      ops.push(prisma.day.update({ where: { id: day.id }, data: { credit: "full" } }));
    }
    await prisma.$transaction(ops);

    res.json({ task: { id: proof.taskId, completed: true } });
  } catch (err) {
    next(err);
  }
});

export default router;
