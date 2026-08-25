import { Router } from "express";
import { prisma } from "../db.js";

const router = Router();

function serializeProof(proof) {
  return {
    id: proof.id,
    username: proof.task.day.user.username,
    date: proof.task.day.date,
    taskText: proof.task.text,
    taskAmount: proof.task.amount,
    summary: proof.summary,
    aiQuestion: proof.aiQuestion,
    userAnswer: proof.userAnswer,
    flagged: proof.flagged,
    createdAt: proof.createdAt,
  };
}

// requireAdmin only checks the global isAdmin flag -- this confirms req.user
// actually administers a group (set once, at group creation, in auth.js) and
// returns that group's id, so a proof lookup can be scoped to it.
async function requireOwnGroup(req) {
  return prisma.group.findUnique({ where: { adminUserId: req.user.id } });
}

// Only proofs with a submitted answer are reviewable -- an in-progress one
// (summary written, question generated, not yet answered) isn't finished.
router.get("/proofs", async (req, res, next) => {
  try {
    const group = await requireOwnGroup(req);
    if (!group) {
      return res.json({ proofs: [] });
    }

    const proofs = await prisma.proof.findMany({
      where: { userAnswer: { not: null }, task: { day: { user: { groupId: group.id } } } },
      include: { task: { include: { day: { include: { user: true } } } } },
      orderBy: { createdAt: "desc" },
    });
    res.json({ proofs: proofs.map(serializeProof) });
  } catch (err) {
    next(err);
  }
});

router.patch("/proofs/:id/flag", async (req, res, next) => {
  try {
    const { flagged } = req.body ?? {};
    if (typeof flagged !== "boolean") {
      return res.status(400).json({ status: "error", message: "flagged must be true or false" });
    }

    const group = await requireOwnGroup(req);
    if (!group) {
      return res.status(404).json({ status: "error", message: "Not an admin of any group" });
    }

    const proof = await prisma.proof.findUnique({
      where: { id: req.params.id },
      include: { task: { include: { day: { include: { user: true } } } } },
    });
    if (!proof || proof.task.day.user.groupId !== group.id) {
      return res.status(404).json({ status: "error", message: "Proof not found" });
    }

    await prisma.proof.update({ where: { id: proof.id }, data: { flagged } });
    res.json({ proof: serializeProof({ ...proof, flagged }) });
  } catch (err) {
    next(err);
  }
});

export default router;
