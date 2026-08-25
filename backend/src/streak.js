import { prisma } from "./db.js";

function sameDate(a, b) {
  return a.getTime() === b.getTime();
}

function oneDayBefore(date) {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() - 1);
  return d;
}

// Pure. `daysDescending` is a user's finalized days (credit set), most recent
// first. Counts the consecutive run of 'full' days starting from the most
// recent -- a 'none' day, or a calendar-day gap (an undeclared day in
// between), both break it.
export function computeStreak(daysDescending) {
  let streak = 0;
  let expectedDate = null;

  for (const day of daysDescending) {
    if (day.credit !== "full") break;
    if (expectedDate && !sameDate(day.date, expectedDate)) break;
    streak++;
    expectedDate = oneDayBefore(day.date);
  }

  return streak;
}

export async function getUserStreak(userId) {
  const days = await prisma.day.findMany({
    where: { userId, credit: { not: null } },
    orderBy: { date: "desc" },
    select: { date: true, credit: true },
  });
  return computeStreak(days);
}

const GARDEN_TIERS = ["dead", "autumn", "green", "bloom"];
const BEST_TIER_INDEX = GARDEN_TIERS.length - 1;

// Pure. `daysAscending` is a user's finalized days (credit set), oldest
// first. Garden health starts at its best tier -- a new user with no history
// isn't punished for days that don't exist yet -- and is deliberately
// asymmetric: one 'none' day drops it a tier immediately, but climbing back
// up a tier needs two consecutive 'full' days, not just one, so recovery is
// slower than decline.
export function computeGardenTier(daysAscending) {
  let index = BEST_TIER_INDEX;
  let goodRun = 0;

  for (const day of daysAscending) {
    if (day.credit === "full") {
      goodRun++;
      if (goodRun >= 2 && index < BEST_TIER_INDEX) {
        index++;
        goodRun = 0;
      }
    } else if (day.credit === "none") {
      index = Math.max(0, index - 1);
      goodRun = 0;
    }
  }

  return GARDEN_TIERS[index];
}

export async function getUserGardenTier(userId) {
  const days = await prisma.day.findMany({
    where: { userId, credit: { not: null } },
    orderBy: { date: "asc" },
    select: { date: true, credit: true },
  });
  return computeGardenTier(days);
}
