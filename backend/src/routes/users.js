import { Router } from "express";
import { getUserStreak } from "../streak.js";

const router = Router();

router.get("/me/streak", async (req, res, next) => {
  try {
    const streak = await getUserStreak(req.user.id);
    res.json({ streak });
  } catch (err) {
    next(err);
  }
});

export default router;
