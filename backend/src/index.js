import "dotenv/config";
import cors from "cors";
import express from "express";
import { prisma } from "./db.js";
import authRouter from "./routes/auth.js";
import daysRouter from "./routes/days.js";
import sessionsRouter from "./routes/sessions.js";
import { authenticate } from "./middleware/authenticate.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRouter);
app.use("/days", authenticate, daysRouter);
app.use("/sessions", authenticate, sessionsRouter);

app.get("/health", async (_req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok" });
  } catch (err) {
    next(err);
  }
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ status: "error", message: err.message });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Kiko backend listening on port ${port}`);
});
