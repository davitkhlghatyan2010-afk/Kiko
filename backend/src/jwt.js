import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET;

export function signToken(user) {
  return jwt.sign({ sub: user.id }, secret, { expiresIn: "7d" });
}

export function verifyToken(token) {
  return jwt.verify(token, secret);
}
