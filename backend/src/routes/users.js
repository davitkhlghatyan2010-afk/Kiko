import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { Router } from "express";
import { prisma } from "../db.js";
import { EMAIL_RE, hashToken, serializeUser } from "./auth.js";
import { getUserGardenTier, getUserLongestStreak, getUserStreak } from "../streak.js";
import { isValidPassword, PASSWORD_RULES_MESSAGE } from "../validators.js";

const router = Router();

const CUTOFF_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;
const COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;
const EMAIL_CHANGE_TTL_MS = 60 * 60 * 1000; // 1 hour, matches password reset
// Client resizes to a small square before upload (see ProfileEditModal.js) --
// this is just a defensive server-side cap, not the primary size control.
const MAX_AVATAR_PHOTO_LENGTH = 500_000;

function dateAtUtcMidnight(base, offsetDays = 0) {
  const d = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate()));
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d;
}

function median(values) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? Math.round((sorted[mid - 1] + sorted[mid]) / 2) : sorted[mid];
}

function formatDuration(ms) {
  if (ms == null) return null;
  const totalMinutes = Math.round(ms / 60000);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}:${String(m).padStart(2, "0")}`;
}

router.get("/me/streak", async (req, res, next) => {
  try {
    const [streak, gardenTier] = await Promise.all([
      getUserStreak(req.user.id),
      getUserGardenTier(req.user.id),
    ]);
    res.json({ streak, gardenTier });
  } catch (err) {
    next(err);
  }
});

router.get("/me/stats", async (req, res, next) => {
  try {
    const userId = req.user.id;
    const today = dateAtUtcMidnight(new Date());
    const rangeStart = dateAtUtcMidnight(today, -29);

    const [
      currentStreak,
      longestStreak,
      gardenTier,
      lifetimeCleanDays,
      totalTasksCompleted,
      startedDays,
      workSessions,
      recentDays,
    ] = await Promise.all([
      getUserStreak(userId),
      getUserLongestStreak(userId),
      getUserGardenTier(userId),
      prisma.day.count({ where: { userId, credit: "full" } }),
      prisma.task.count({ where: { day: { userId }, completed: true } }),
      prisma.day.findMany({
        where: { userId, startedAt: { not: null } },
        select: { deadlineAt: true, startedAt: true },
      }),
      // Reading FocusSession here is fine -- it's a personal stat display,
      // not scoring/streak logic reading it back (that path stays closed).
      prisma.focusSession.findMany({
        where: { userId, type: "work" },
        select: { startedAt: true, endedAt: true },
      }),
      prisma.day.findMany({
        where: { userId, date: { gte: rangeStart, lte: today } },
        select: { date: true, credit: true },
      }),
    ]);

    const timeLeftMs = startedDays.map(
      (d) => new Date(d.deadlineAt).getTime() - new Date(d.startedAt).getTime(),
    );
    const sessionDurations = workSessions.map(
      (s) => new Date(s.endedAt).getTime() - new Date(s.startedAt).getTime(),
    );

    const byDate = new Map(recentDays.map((d) => [d.date.toISOString(), d.credit]));
    const history = [];
    for (let i = 29; i >= 0; i--) {
      const date = dateAtUtcMidnight(today, -i);
      const credit = byDate.get(date.toISOString());
      history.push({ date, status: credit === "full" ? "full" : credit === "none" ? "none" : "empty" });
    }

    res.json({
      currentStreak,
      longestStreak,
      gardenTier,
      lifetimeCleanDays,
      totalTasksCompleted,
      medianTimeLeftWhenStarted: formatDuration(median(timeLeftMs)),
      sessions: {
        count: workSessions.length,
        median: formatDuration(median(sessionDurations)),
        longest: sessionDurations.length ? formatDuration(Math.max(...sessionDurations)) : null,
      },
      totalFocusTime: formatDuration(sessionDurations.reduce((sum, ms) => sum + ms, 0)),
      history,
    });
  } catch (err) {
    next(err);
  }
});

router.patch("/me", async (req, res, next) => {
  try {
    const { username, avatar, avatarPhoto } = req.body ?? {};
    const data = {};

    if (username !== undefined) {
      if (typeof username !== "string" || username.trim().length < 3) {
        return res.status(400).json({ status: "error", message: "Username must be at least 3 characters" });
      }
      data.username = username.trim();
    }

    if (avatar !== undefined) {
      if (!Number.isInteger(avatar) || avatar < 0 || avatar > 7) {
        return res.status(400).json({ status: "error", message: "avatar must be an integer 0-7" });
      }
      data.avatar = avatar;
    }

    // null clears it (reverts the profile photo back to the drawn portrait).
    if (avatarPhoto !== undefined) {
      if (avatarPhoto !== null) {
        if (typeof avatarPhoto !== "string" || !avatarPhoto.startsWith("data:image/")) {
          return res.status(400).json({ status: "error", message: "avatarPhoto must be an image data URL" });
        }
        if (avatarPhoto.length > MAX_AVATAR_PHOTO_LENGTH) {
          return res.status(400).json({ status: "error", message: "Photo is too large" });
        }
      }
      data.avatarPhoto = avatarPhoto;
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ status: "error", message: "Nothing to update" });
    }

    const updated = await prisma.user.update({ where: { id: req.user.id }, data });
    res.json({ user: serializeUser(updated) });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ status: "error", message: "Username already taken" });
    }
    next(err);
  }
});

// Doesn't touch User.email -- creates a token and "sends" it (console.log
// stub, same as forgot-password) to the *new* address. The address only
// takes effect once that link is opened -- see POST /auth/email-change/confirm.
router.post("/me/email/request", async (req, res, next) => {
  try {
    const { email } = req.body ?? {};
    if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
      return res.status(400).json({ status: "error", message: "A valid email address is required" });
    }
    const newEmail = email.trim().toLowerCase();
    if (newEmail === req.user.email) {
      return res.status(400).json({ status: "error", message: "That's already your email" });
    }

    const existing = await prisma.user.findUnique({ where: { email: newEmail } });
    if (existing) {
      return res.status(409).json({ status: "error", message: "Email already taken" });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    await prisma.emailChangeToken.create({
      data: {
        userId: req.user.id,
        newEmail,
        tokenHash: hashToken(rawToken),
        expiresAt: new Date(Date.now() + EMAIL_CHANGE_TTL_MS),
      },
    });

    const confirmUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/verify-email?token=${rawToken}`;
    // No email provider configured yet (pilot stub) — log it and hand it back so the flow is testable end to end.
    console.log(`[email change] ${newEmail} -> ${confirmUrl}`);
    res.json({
      status: "ok",
      message: "Check the new address for a link to confirm the change.",
      devConfirmUrl: confirmUrl,
      devConfirmToken: rawToken,
    });
  } catch (err) {
    next(err);
  }
});

router.patch("/me/password", async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body ?? {};
    if (typeof currentPassword !== "string" || !currentPassword) {
      return res.status(400).json({ status: "error", message: "Current password is required" });
    }
    if (!(await bcrypt.compare(currentPassword, req.user.passwordHash))) {
      return res.status(401).json({ status: "error", message: "Current password is incorrect" });
    }
    if (!isValidPassword(newPassword)) {
      return res.status(400).json({ status: "error", message: PASSWORD_RULES_MESSAGE });
    }
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ status: "error", message: "Passwords do not match" });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: req.user.id }, data: { passwordHash } });
    res.json({ status: "ok", message: "Password updated" });
  } catch (err) {
    next(err);
  }
});

// Read at declare-time by days.js, not here -- changing it only affects days
// declared after this call, never one already in progress.
router.patch("/me/cutoff", async (req, res, next) => {
  try {
    const { cutoffTime } = req.body ?? {};
    if (typeof cutoffTime !== "string" || !CUTOFF_RE.test(cutoffTime)) {
      return res.status(400).json({ status: "error", message: "cutoffTime must be HH:MM (24h)" });
    }

    const now = new Date();
    if (req.user.cutoffChangedAt && now.getTime() - req.user.cutoffChangedAt.getTime() < COOLDOWN_MS) {
      const availableAt = new Date(req.user.cutoffChangedAt.getTime() + COOLDOWN_MS);
      return res.status(429).json({
        status: "error",
        message: "Cutoff time can only be changed once every 7 days",
        availableAt,
      });
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { cutoffTime, cutoffChangedAt: now },
    });
    res.json({ user: serializeUser(updated) });
  } catch (err) {
    next(err);
  }
});

export default router;
