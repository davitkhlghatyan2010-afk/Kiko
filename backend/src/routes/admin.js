import { Router } from "express";

const router = Router();

// Smoke-test route only, to prove requireAdmin actually gates something end to
// end before Phase 7 (admin proof review) exists. Delete once a real
// admin-only endpoint replaces it.
router.get("/ping", (_req, res) => {
  res.json({ status: "ok", message: "admin access confirmed" });
});

export default router;
