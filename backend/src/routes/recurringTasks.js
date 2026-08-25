import { Router } from "express";
import { prisma } from "../db.js";

const router = Router();

function serializeRecurringTask(task) {
  return { id: task.id, text: task.text, amount: task.amount };
}

router.get("/", async (req, res, next) => {
  try {
    const tasks = await prisma.recurringTask.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "asc" },
    });
    res.json({ recurringTasks: tasks.map(serializeRecurringTask) });
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { text, amount } = req.body ?? {};
    if (typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ status: "error", message: "Every task needs a description" });
    }
    if (typeof amount !== "string" || !amount.trim()) {
      return res.status(400).json({ status: "error", message: "Every task needs an amount" });
    }

    const task = await prisma.recurringTask.create({
      data: { userId: req.user.id, text: text.trim(), amount: amount.trim() },
    });
    res.status(201).json({ recurringTask: serializeRecurringTask(task) });
  } catch (err) {
    next(err);
  }
});

// Stops it repeating from here on -- SetNull on tasks.recurring_task_id
// means already-declared days keep their own copy of the text/amount,
// untouched.
router.delete("/:id", async (req, res, next) => {
  try {
    const existing = await prisma.recurringTask.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ status: "error", message: "Recurring task not found" });
    }
    await prisma.recurringTask.delete({ where: { id: existing.id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
