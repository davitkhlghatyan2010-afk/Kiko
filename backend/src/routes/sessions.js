import { Router } from "express";
import { prisma } from "../db.js";

// Write-only endpoint: logs completed Pomodoro intervals for later analysis.
// Deliberately does not import anything from days.js -- there is no code path
// from here into scoring/streak/deadline logic, and nothing here reads back
// from the `sessions` table.

const router = Router();
const SESSION_TYPES = new Set(["work", "rest"]);

function dateOf(instant) {
  // Same UTC-normalization trick as days.js's startOfToday(), duplicated locally
  // rather than imported, to keep this route file fully decoupled from days.js.
  return new Date(Date.UTC(instant.getFullYear(), instant.getMonth(), instant.getDate()));
}

router.post("/", async (req, res, next) => {
  try {
    const { startedAt, endedAt, type } = req.body ?? {};

    const started = new Date(startedAt);
    const ended = new Date(endedAt);
    if (Number.isNaN(started.getTime()) || Number.isNaN(ended.getTime()) || ended <= started) {
      return res.status(400).json({ status: "error", message: "startedAt/endedAt must be valid, with endedAt after startedAt" });
    }
    if (!SESSION_TYPES.has(type)) {
      return res.status(400).json({ status: "error", message: "type must be 'work' or 'rest'" });
    }

    await prisma.focusSession.create({
      data: {
        userId: req.user.id,
        date: dateOf(started),
        startedAt: started,
        endedAt: ended,
        type,
      },
    });

    res.status(201).json({ status: "ok" });
  } catch (err) {
    next(err);
  }
});

export default router;
