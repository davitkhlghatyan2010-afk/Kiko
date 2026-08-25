export const PASSWORD_RULES_MESSAGE =
  "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a symbol";

const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export function isValidPassword(password) {
  return typeof password === "string" && PASSWORD_RE.test(password);
}
