import { Router } from "express";
import { getUserGardenTier, getUserStreak } from "../streak.js";

const router = Router();

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

export default router;
