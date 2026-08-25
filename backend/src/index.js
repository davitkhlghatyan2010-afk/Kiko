import "dotenv/config";
import cors from "cors";
import express from "express";
import { prisma } from "./db.js";
import authRouter from "./routes/auth.js";
import daysRouter from "./routes/days.js";
import sessionsRouter from "./routes/sessions.js";
import adminRouter from "./routes/admin.js";
import proofsRouter from "./routes/proofs.js";
import usersRouter from "./routes/users.js";
import { authenticate } from "./middleware/authenticate.js";
import { requireAdmin } from "./middleware/requireAdmin.js";
import { startDeadlineSweep } from "./jobs/finalizeDays.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", async (_req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok" });
  } catch (err) {
    next(err);
  }
});

app.use("/auth", authRouter);
app.use("/days", authenticate, daysRouter);
app.use("/sessions", authenticate, sessionsRouter);
app.use("/admin", authenticate, requireAdmin, adminRouter);
app.use("/users", authenticate, usersRouter);
// No shared path prefix (routes are /tasks/:id/proof and /proofs/:id/answer) --
// mounted last, after every unauthenticated route, so `authenticate` here can
// never shadow something registered afterward the way it did before /health
// was moved above this block.
app.use(authenticate, proofsRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ status: "error", message: err.message });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Kiko backend listening on port ${port}`);
});

startDeadlineSweep();
