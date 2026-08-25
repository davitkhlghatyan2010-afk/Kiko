// Must run after `authenticate` (needs req.user). Every admin-only endpoint
// verifies is_admin here, server-side -- the frontend hiding a button is not
// a security boundary, this is.
export function requireAdmin(req, res, next) {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ status: "error", message: "Admin access required" });
  }
  next();
}
