import { Router } from "express";
import { prisma } from "../db.js";
import { getUserGardenTier } from "../streak.js";

const router = Router();

const GLOBAL_LIMIT = 10;

// Ranks by lifetime clean-day count (every day ever scored 'full'), not the
// current streak -- matches the Design System's leaderboard spec ("full_credit_count"),
// and reads as a garden that keeps growing rather than one that resets on a single miss.
// Ties share a place (competition ranking: 1, 1, 3), same as the design doc.
async function rankedRows(users, selfId) {
  const rows = await Promise.all(
    users.map(async (user) => {
      const [days, tier] = await Promise.all([
        prisma.day.count({ where: { userId: user.id, credit: "full" } }),
        getUserGardenTier(user.id),
      ]);
      return { userId: user.id, username: user.username, days, tier, isSelf: user.id === selfId };
    }),
  );
  rows.sort((a, b) => b.days - a.days || a.username.localeCompare(b.username));

  let place = 0;
  let prevDays = null;
  rows.forEach((row, i) => {
    if (row.days !== prevDays) {
      place = i + 1;
      prevDays = row.days;
    }
    row.place = place;
  });
  return rows;
}

router.get("/group", async (req, res, next) => {
  try {
    if (!req.user.groupId) {
      return res.json({ leaderboard: [], pinnedSelf: null, totalCount: 0 });
    }
    const members = await prisma.user.findMany({ where: { groupId: req.user.groupId } });
    const ranked = await rankedRows(members, req.user.id);
    res.json({ leaderboard: ranked, pinnedSelf: null, totalCount: ranked.length });
  } catch (err) {
    next(err);
  }
});

router.get("/global", async (req, res, next) => {
  try {
    const users = await prisma.user.findMany();
    const ranked = await rankedRows(users, req.user.id);
    const top = ranked.slice(0, GLOBAL_LIMIT);
    const selfInTop = top.some((row) => row.isSelf);
    const pinnedSelf = selfInTop ? null : (ranked.find((row) => row.isSelf) ?? null);
    res.json({ leaderboard: top, pinnedSelf, totalCount: ranked.length });
  } catch (err) {
    next(err);
  }
});

export default router;
