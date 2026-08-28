import { prisma } from "../db.js";
import { verifyToken } from "../jwt.js";

export async function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ status: "error", message: "Missing or invalid Authorization header" });
  }

  try {
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.sub }, include: { group: true } });
    if (!user) {
      return res.status(401).json({ status: "error", message: "User no longer exists" });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ status: "error", message: "Invalid or expired token" });
  }
}
