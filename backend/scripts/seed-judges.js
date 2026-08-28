// One-off demo-data seed for hackathon/pilot judges. Creates a small group
// (one admin + two members with contrasting streak histories) plus one solo
// account, each with enough declared-day history to populate the garden
// tier, leaderboard, and profile stats without judges having to grind out
// days themselves. Re-runnable: deletes any pre-existing rows for these
// exact usernames first, so running it twice just refreshes the data.
//
// Usage (from backend/): node scripts/seed-judges.js
import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/db.js";

const PASSWORD = "Judges2026!";
const GROUP_INVITE_CODE = "JUDGES2026";
const GROUP_NAME = "Judges Demo Group";
const USERNAMES = ["judge_admin", "judge_member", "judge_struggling", "judge_solo"];

const AI_QUESTIONS = [
  "What's the one thing that made this harder than expected?",
  "What would you do differently next time?",
  "What's the smallest next step from here?",
];

// UTC-midnight Date `daysAgo` days before today, matching how days.js's
// startOfToday() keys a Day row -- so these line up with what the app
// itself would consider "that calendar day."
function utcDate(daysAgo) {
  const now = new Date();
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d;
}

function deadlineFor(dateUtc) {
  return new Date(dateUtc.getTime() + (23 * 60 + 59) * 60 * 1000 + 59000);
}

async function cleanup() {
  const users = await prisma.user.findMany({ where: { username: { in: USERNAMES } }, select: { id: true } });
  const userIds = users.map((u) => u.id);
  if (userIds.length) {
    const days = await prisma.day.findMany({ where: { userId: { in: userIds } }, select: { id: true } });
    const dayIds = days.map((d) => d.id);
    const tasks = await prisma.task.findMany({ where: { dayId: { in: dayIds } }, select: { id: true } });
    const taskIds = tasks.map((t) => t.id);
    await prisma.proof.deleteMany({ where: { taskId: { in: taskIds } } });
    await prisma.task.deleteMany({ where: { id: { in: taskIds } } });
    await prisma.day.deleteMany({ where: { id: { in: dayIds } } });
    await prisma.focusSession.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.recurringTask.deleteMany({ where: { userId: { in: userIds } } });
  }
  await prisma.group.deleteMany({ where: { inviteCode: GROUP_INVITE_CODE } });
  if (userIds.length) await prisma.user.deleteMany({ where: { id: { in: userIds } } });
}

// `pattern` is oldest-first, ending 1 day ago -- today is deliberately left
// undeclared so judges can also try the live Declare-today flow themselves.
async function createHistory(userId, pattern, { taskTexts, taskAmounts, flagSome = false }) {
  const n = pattern.length;
  for (let i = 0; i < n; i++) {
    const daysAgo = n - i;
    const date = utcDate(daysAgo);
    const credit = pattern[i];

    const day = await prisma.day.create({
      data: {
        userId,
        date,
        deadlineAt: deadlineFor(date),
        declaredAt: new Date(date.getTime() + 9 * 3600 * 1000),
        startedAt: credit === "full" ? new Date(date.getTime() + 9.5 * 3600 * 1000) : null,
        credit,
      },
    });

    const taskCount = credit === "full" ? 2 : 1;
    for (let t = 0; t < taskCount; t++) {
      const completed = credit === "full";
      const task = await prisma.task.create({
        data: {
          dayId: day.id,
          text: taskTexts[t % taskTexts.length],
          amount: taskAmounts[t % taskAmounts.length],
          completed,
        },
      });
      if (completed) {
        await prisma.proof.create({
          data: {
            taskId: task.id,
            summary: "Did the work, logged progress, felt good about it.",
            aiQuestion: AI_QUESTIONS[t % AI_QUESTIONS.length],
            userAnswer: "Stayed focused and pushed through the tricky part.",
            flagged: flagSome && t === 0 && i % 3 === 0,
          },
        });
      }
    }
  }
}

async function main() {
  await cleanup();
  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  // Group admin is created first (without a group), then the Group points
  // back at them, then they're updated to belong to it -- the same
  // chicken-and-egg order routes/auth.js resolves in a transaction when a
  // brand-new invite code is registered.
  const admin = await prisma.user.create({
    data: {
      username: "judge_admin",
      email: "judge.admin@kiko.demo",
      passwordHash,
      accountType: "group",
      avatar: 0,
      privacyAcceptedAt: new Date(),
    },
  });
  const group = await prisma.group.create({
    data: { name: GROUP_NAME, inviteCode: GROUP_INVITE_CODE, adminUserId: admin.id },
  });
  await prisma.user.update({ where: { id: admin.id }, data: { groupId: group.id, isAdmin: true } });

  const member = await prisma.user.create({
    data: {
      username: "judge_member",
      email: "judge.member@kiko.demo",
      passwordHash,
      accountType: "group",
      groupId: group.id,
      avatar: 1,
      privacyAcceptedAt: new Date(),
    },
  });

  const struggling = await prisma.user.create({
    data: {
      username: "judge_struggling",
      email: "judge.struggling@kiko.demo",
      passwordHash,
      accountType: "group",
      groupId: group.id,
      avatar: 2,
      privacyAcceptedAt: new Date(),
    },
  });

  const solo = await prisma.user.create({
    data: {
      username: "judge_solo",
      email: "judge.solo@kiko.demo",
      passwordHash,
      accountType: "solo",
      avatar: 3,
      privacyAcceptedAt: new Date(),
    },
  });

  await createHistory(admin.id, Array(12).fill("full"), {
    taskTexts: ["Read chapter", "Write summary"],
    taskAmounts: ["10 pages", "1 page"],
    flagSome: true,
  });
  // 7 full days then 1 recent miss -- bloom tier slipping to green,
  // currentStreak resets to 0 right as it hits the miss.
  await createHistory(member.id, [...Array(7).fill("full"), "none"], {
    taskTexts: ["Workout", "Journal"],
    taskAmounts: ["30 min", "1 entry"],
    flagSome: true,
  });
  // 5 full days then 3 consecutive misses -- walks the garden tier all the
  // way down to "dead" so the decline mechanic is visible without judges
  // having to actually miss three real days themselves.
  await createHistory(struggling.id, [...Array(5).fill("full"), "none", "none", "none"], {
    taskTexts: ["Practice guitar", "Study Spanish"],
    taskAmounts: ["20 min", "15 min"],
    flagSome: true,
  });
  await createHistory(solo.id, Array(5).fill("full"), {
    taskTexts: ["Morning run", "Meditate"],
    taskAmounts: ["3 miles", "10 min"],
  });

  console.log("\nJudge demo accounts ready -- password for all of them: " + PASSWORD + "\n");
  console.log("  judge_admin       group admin, isAdmin -- can review proofs at /admin");
  console.log("  judge_member      group member, bloom tier slipping to green after a recent miss");
  console.log("  judge_struggling  group member, declined all the way to the dead garden tier");
  console.log("  judge_solo        solo account, clean 5-day streak, no group\n");
  console.log("  Group invite code (to join the same group when registering another test account): " + GROUP_INVITE_CODE);
  console.log("\n  Today is left undeclared for all four -- log in and try Declare Today yourself too.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
