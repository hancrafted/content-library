export type Roll = () => number;

export function drawRoll(roll: Roll): number {
  const sample = roll();
  if (!Number.isFinite(sample) || sample < 0 || sample > 1) {
    throw new RangeError('Random rolls must be between zero and one.');
  }
  return sample;
}

/** A sheet gliding off the far desk edge: it waits, then falls in a zigzag with its own sway, tilt and drift. */
export function paperOverflow(roll: Roll) {
  return {
    delay: 1 + drawRoll(roll) * 3,
    drift: (drawRoll(roll) - 0.5) * 480,
    duration: 3 + drawRoll(roll) * 1.5,
    sway: 50 + drawRoll(roll) * 110,
    swings: 3 + Math.round(drawRoll(roll) * 2),
    tilt: 8 + drawRoll(roll) * 16,
  };
}
