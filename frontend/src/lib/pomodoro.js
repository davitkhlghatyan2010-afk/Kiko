const WORK_MINUTES = 25; // fixed for now -- will become configurable later
const REST_MINUTES = 10; // fixed for now -- will become configurable later
const CYCLE_MINUTES = WORK_MINUTES + REST_MINUTES;

export const MIN_TOTAL_MINUTES = 25;
export const MAX_TOTAL_MINUTES = 180;

// Pure. splitSession(90) -> [work25, rest10, work25, rest10, work20].
// Any leftover after the last full cycle becomes one final work block --
// no minutes are dropped, and the sequence always ends on work by
// construction. The one exception: if totalMinutes is an exact multiple of
// the cycle length, the last full cycle's trailing rest has nothing after
// it and is dropped, per "always end on a work block."
export function splitSession(totalMinutes) {
  const blocks = [];
  let remaining = totalMinutes;

  while (remaining >= CYCLE_MINUTES) {
    blocks.push({ type: "work", minutes: WORK_MINUTES });
    blocks.push({ type: "rest", minutes: REST_MINUTES });
    remaining -= CYCLE_MINUTES;
  }

  if (remaining > 0) {
    blocks.push({ type: "work", minutes: remaining });
  } else if (blocks.length > 0 && blocks[blocks.length - 1].type === "rest") {
    blocks.pop();
  }

  return blocks;
}
