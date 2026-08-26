import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { Router } from "express";
import { prisma } from "../db.js";
import { signToken } from "../jwt.js";
import { authenticate } from "../middleware/authenticate.js";
import { isValidPassword, PASSWORD_RULES_MESSAGE } from "../validators.js";

const router = Router();
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export function serializeUser(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    accountType: user.accountType,
    isAdmin: user.isAdmin,
    groupId: user.groupId,
    createdAt: user.createdAt,
    avatar: user.avatar,
    avatarPhoto: user.avatarPhoto,
    cutoffTime: user.cutoffTime,
    cutoffChangedAt: user.cutoffChangedAt,
  };
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

router.post("/register", async (req, res, next) => {
  try {
    const { username, email, password, confirmPassword, accountType, inviteCode, groupName, privacyAccepted } =
      req.body ?? {};

    if (typeof username !== "string" || username.trim().length < 3) {
      return res.status(400).json({ status: "error", message: "Username must be at least 3 characters" });
    }
    if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
      return res.status(400).json({ status: "error", message: "A valid email address is required" });
    }
    if (!isValidPassword(password)) {
      return res.status(400).json({ status: "error", message: PASSWORD_RULES_MESSAGE });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ status: "error", message: "Passwords do not match" });
    }
    if (privacyAccepted !== true) {
      return res.status(400).json({ status: "error", message: "You must accept the Privacy Policy" });
    }
    if (accountType !== "group" && accountType !== "solo") {
      return res.status(400).json({ status: "error", message: "accountType must be 'group' or 'solo'" });
    }
    if (accountType === "group" && (typeof inviteCode !== "string" || inviteCode.trim().length < 3)) {
      return res.status(400).json({ status: "error", message: "Invite code must be at least 3 characters" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const normalizedEmail = email.trim().toLowerCase();
    const privacyAcceptedAt = new Date();
    // Cosmetic only -- just picks one of the 8 drawn portraits at random so a
    // fresh account isn't stuck on the same default look.
    const avatar = Math.floor(Math.random() * 8);

    const user = await prisma.$transaction(async (tx) => {
      if (accountType === "solo") {
        return tx.user.create({
          data: {
            username: username.trim(),
            email: normalizedEmail,
            passwordHash,
            accountType: "solo",
            privacyAcceptedAt,
            avatar,
          },
        });
      }

      const code = inviteCode.trim();
      const existingGroup = await tx.group.findUnique({ where: { inviteCode: code } });

      if (existingGroup) {
        return tx.user.create({
          data: {
            username: username.trim(),
            email: normalizedEmail,
            passwordHash,
            accountType: "group",
            groupId: existingGroup.id,
            privacyAcceptedAt,
            avatar,
          },
        });
      }

      const admin = await tx.user.create({
        data: {
          username: username.trim(),
          email: normalizedEmail,
          passwordHash,
          accountType: "group",
          isAdmin: true,
          privacyAcceptedAt,
          avatar,
        },
      });
      const group = await tx.group.create({
        data: { name: groupName?.trim() || code, inviteCode: code, adminUserId: admin.id },
      });
      return tx.user.update({ where: { id: admin.id }, data: { groupId: group.id } });
    });

    const token = signToken(user);
    res.status(201).json({ token, user: serializeUser(user) });
  } catch (err) {
    if (err.code === "P2002") {
      const field = err.meta?.target?.includes("email") ? "Email" : "Username";
      return res.status(409).json({ status: "error", message: `${field} already taken` });
    }
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { identifier, password } = req.body ?? {};
    if (typeof identifier !== "string" || typeof password !== "string") {
      return res.status(400).json({ status: "error", message: "Username/email and password are required" });
    }

    const normalized = identifier.trim();
    const user = await prisma.user.findFirst({
      where: { OR: [{ username: normalized }, { email: normalized.toLowerCase() }] },
    });
    const valid = user && (await bcrypt.compare(password, user.passwordHash));
    if (!valid) {
      return res.status(401).json({ status: "error", message: "Invalid username/email or password" });
    }

    const token = signToken(user);
    res.json({ token, user: serializeUser(user) });
  } catch (err) {
    next(err);
  }
});

router.get("/me", authenticate, (req, res) => {
  res.json({ user: serializeUser(req.user) });
});

router.post("/forgot-password", async (req, res, next) => {
  try {
    const { email } = req.body ?? {};
    if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
      return res.status(400).json({ status: "error", message: "A valid email address is required" });
    }

    const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });

    // Always respond the same way whether or not the account exists, so the endpoint can't be used to enumerate emails.
    const response = { status: "ok", message: "If that email has an account, a reset link has been sent." };

    if (user) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash: hashToken(rawToken),
          expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
        },
      });

      const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${rawToken}`;
      // No email provider configured yet (pilot stub) — log it and hand it back so the flow is testable end to end.
      console.log(`[password reset] ${user.email} -> ${resetUrl}`);
      response.devResetUrl = resetUrl;
      response.devResetToken = rawToken;
    }

    res.json(response);
  } catch (err) {
    next(err);
  }
});

router.post("/reset-password", async (req, res, next) => {
  try {
    const { token, password, confirmPassword } = req.body ?? {};
    if (typeof token !== "string" || !token) {
      return res.status(400).json({ status: "error", message: "Reset token is required" });
    }
    if (!isValidPassword(password)) {
      return res.status(400).json({ status: "error", message: PASSWORD_RULES_MESSAGE });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ status: "error", message: "Passwords do not match" });
    }

    const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash: hashToken(token) } });
    if (!record || record.usedAt || record.expiresAt < new Date()) {
      return res.status(400).json({ status: "error", message: "Reset link is invalid or has expired" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.$transaction([
      prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
      prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    ]);

    res.json({ status: "ok", message: "Password updated. You can log in now." });
  } catch (err) {
    next(err);
  }
});

export default router;
