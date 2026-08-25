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
