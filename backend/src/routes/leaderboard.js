import { Router } from "express";
import { prisma } from "../db.js";
import { getUserStreak } from "../streak.js";

const router = Router();

async function rankedRows(users, selfId) {
  const rows = await Promise.all(
    users.map(async (user) => ({
      userId: user.id,
      username: user.username,
      streak: await getUserStreak(user.id),
      isSelf: user.id === selfId,
    })),
  );
  rows.sort((a, b) => b.streak - a.streak || a.username.localeCompare(b.username));
  return rows;
}

router.get("/group", async (req, res, next) => {
  try {
    if (!req.user.groupId) {
      return res.json({ leaderboard: [] });
    }
    const members = await prisma.user.findMany({ where: { groupId: req.user.groupId } });
    res.json({ leaderboard: await rankedRows(members, req.user.id) });
  } catch (err) {
    next(err);
  }
});

router.get("/global", async (req, res, next) => {
  try {
    const users = await prisma.user.findMany();
    res.json({ leaderboard: await rankedRows(users, req.user.id) });
  } catch (err) {
    next(err);
  }
});

export default router;
