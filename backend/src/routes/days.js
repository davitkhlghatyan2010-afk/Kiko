import { Router } from "express";
import { prisma } from "../db.js";

const router = Router();

function startOfToday() {
  // A plain `new Date(y, m, d)` is a local-midnight instant; Postgres' DATE column truncates
  // by UTC calendar day, so a positive UTC offset (server runs in Armenia, UTC+4) rolls it back
  // to the previous day. Building the UTC instant from the local date parts keeps the stored
  // DATE matching the calendar day a person here actually means by "today".
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

function defaultDeadline() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
}

function taskKey(text, amount) {
  return `${text.trim().toLowerCase()}||${amount.trim().toLowerCase()}`;
}

function validateTasks(tasks, existingKeys = new Set()) {
  if (!Array.isArray(tasks) || tasks.length < 1) {
    return "Declare at least 1 task";
  }
  const seen = new Set(existingKeys);
  for (const task of tasks) {
    if (typeof task?.text !== "string" || !task.text.trim()) {
      return "Every task needs a description";
    }
    if (typeof task?.amount !== "string" || !task.amount.trim()) {
      return "Every task needs an amount";
    }
    const key = taskKey(task.text, task.amount);
    if (seen.has(key)) {
      return `"${task.text.trim()}" is already on today's list`;
    }
    seen.add(key);
  }
  return null;
}

function serializeDay(day) {
  return {
    id: day.id,
    date: day.date,
    deadlineAt: day.deadlineAt,
    declaredAt: day.declaredAt,
    startedAt: day.startedAt,
    credit: day.credit,
    tasks: day.tasks.map((task) => ({
      id: task.id,
      text: task.text,
      amount: task.amount,
      completed: task.completed,
      // Recurring-origin tasks can be skipped for just today (see DELETE
      // /today/tasks/:id) -- manually-typed ones stay locked once declared.
      recurring: task.recurringTaskId != null,
      // A pending (unanswered) proof lets the frontend resume the question step
      // after a reload instead of restarting from "Mark done".
      pendingProof:
        !task.completed && task.proof ? { id: task.proof.id, aiQuestion: task.proof.aiQuestion } : null,
    })),
  };
}

router.post("/", async (req, res, next) => {
  try {
    const { tasks } = req.body ?? {};

    const recurringTasks = await prisma.recurringTask.findMany({ where: { userId: req.user.id } });
    const recurringKeys = new Set(recurringTasks.map((task) => taskKey(task.text, task.amount)));

    // Recurring tasks alone can cover the day -- only the tasks submitted on
    // top of them need the "at least 1" / duplicate checks.
    const validationError = tasks && tasks.length > 0 ? validateTasks(tasks, recurringKeys) : null;
    if (validationError) {
      return res.status(400).json({ status: "error", message: validationError });
    }
    if (recurringTasks.length === 0 && (!tasks || tasks.length === 0)) {
      return res.status(400).json({ status: "error", message: "Declare at least 1 task" });
    }

    const date = startOfToday();
    const existing = await prisma.day.findUnique({ where: { userId_date: { userId: req.user.id, date } } });
    if (existing) {
      return res.status(409).json({ status: "error", message: "Today has already been declared" });
    }

    const day = await prisma.day.create({
      data: {
        userId: req.user.id,
        date,
        deadlineAt: defaultDeadline(),
        tasks: {
          create: [
            ...recurringTasks.map((task) => ({
              text: task.text,
              amount: task.amount,
              recurringTaskId: task.id,
            })),
            ...(tasks ?? []).map((task) => ({
              text: task.text.trim(),
              amount: task.amount.trim(),
            })),
          ],
        },
      },
      include: { tasks: { include: { proof: true } } },
    });

    res.status(201).json({ day: serializeDay(day) });
  } catch (err) {
    next(err);
  }
});

router.get("/today", async (req, res, next) => {
  try {
    const date = startOfToday();
    const day = await prisma.day.findUnique({
      where: { userId_date: { userId: req.user.id, date } },
      include: { tasks: { include: { proof: true } } },
    });

    res.json({ day: day ? serializeDay(day) : null });
  } catch (err) {
    next(err);
  }
});

router.post("/today/tasks", async (req, res, next) => {
  try {
    const { tasks } = req.body ?? {};

    const date = startOfToday();
    const existing = await prisma.day.findUnique({
      where: { userId_date: { userId: req.user.id, date } },
      include: { tasks: true },
    });
    if (!existing) {
      return res.status(404).json({ status: "error", message: "Declare today before adding more tasks" });
    }
    if (existing.deadlineAt < new Date()) {
      return res.status(400).json({ status: "error", message: "Today's deadline has already passed" });
    }

    const existingKeys = new Set(existing.tasks.map((task) => taskKey(task.text, task.amount)));
    const validationError = validateTasks(tasks, existingKeys);
    if (validationError) {
      return res.status(400).json({ status: "error", message: validationError });
    }

    const day = await prisma.day.update({
      where: { id: existing.id },
      data: {
        tasks: {
          create: tasks.map((task) => ({
            text: task.text.trim(),
            amount: task.amount.trim(),
          })),
        },
      },
      include: { tasks: { include: { proof: true } } },
    });

    res.status(201).json({ day: serializeDay(day) });
  } catch (err) {
    next(err);
  }
});

// Skip a single recurring-origin task for today only -- the RecurringTask
// template, and every other day, is untouched. Manually-typed tasks stay
// locked once declared, same as the existing add-only rule.
router.delete("/today/tasks/:taskId", async (req, res, next) => {
  try {
    const date = startOfToday();
    const day = await prisma.day.findUnique({
      where: { userId_date: { userId: req.user.id, date } },
      include: { tasks: true },
    });
    if (!day) {
      return res.status(404).json({ status: "error", message: "Today hasn't been declared" });
    }

    const task = day.tasks.find((t) => t.id === req.params.taskId);
    if (!task) {
      return res.status(404).json({ status: "error", message: "Task not found" });
    }
    if (task.recurringTaskId == null) {
      return res.status(400).json({ status: "error", message: "Only recurring tasks can be removed once declared" });
    }
    if (task.completed) {
      return res.status(400).json({ status: "error", message: "Already completed tasks can't be removed" });
    }

    await prisma.task.delete({ where: { id: task.id } });

    const updated = await prisma.day.findUnique({
      where: { id: day.id },
      include: { tasks: { include: { proof: true } } },
    });
    res.json({ day: serializeDay(updated) });
  } catch (err) {
    next(err);
  }
});

router.post("/today/start", async (req, res, next) => {
  try {
    const date = startOfToday();
    const existing = await prisma.day.findUnique({ where: { userId_date: { userId: req.user.id, date } } });
    if (!existing) {
      return res.status(404).json({ status: "error", message: "Declare today before starting" });
    }
    if (existing.startedAt) {
      return res.status(409).json({ status: "error", message: "Today's work has already been started" });
    }

    const day = await prisma.day.update({
      where: { id: existing.id },
      data: { startedAt: new Date() },
      include: { tasks: { include: { proof: true } } },
    });

    res.json({ day: serializeDay(day) });
  } catch (err) {
    next(err);
  }
});

export default router;
