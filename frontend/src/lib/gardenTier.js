// Maps a streak length to one of pixelWorld.js's existing visual tiers
// (bloom/green/autumn/dead) -- pure, thresholds easy to retune later.
export function streakToTier(streak) {
  if (!streak || streak <= 0) return "dead";
  if (streak <= 2) return "autumn";
  if (streak <= 4) return "green";
  return "bloom";
}
