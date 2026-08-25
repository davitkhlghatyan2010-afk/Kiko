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
      include: { task: { include: { day: true } } },
    });
    if (!proof || proof.task.day.userId !== req.user.id) {
      return res.status(404).json({ status: "error", message: "Proof not found" });
    }
    if (proof.userAnswer) {
      return res.status(409).json({ status: "error", message: "This proof has already been answered" });
    }

    await prisma.$transaction([
      prisma.proof.update({ where: { id: proof.id }, data: { userAnswer: answer.trim() } }),
      prisma.task.update({ where: { id: proof.taskId }, data: { completed: true } }),
    ]);

    res.json({ task: { id: proof.taskId, completed: true } });
  } catch (err) {
    next(err);
  }
});

export default router;
