import { drawRoll, type Roll } from './paper-overflow.pure';

interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface Point {
  x: number;
  y: number;
}

export function promotionFlight(envelope: Box, word: Box): Point {
  for (const box of [envelope, word]) {
    if (![box.left, box.top, box.width, box.height].every(Number.isFinite) || box.width < 0 || box.height < 0) {
      throw new RangeError('Word flight needs finite coordinates and non-negative dimensions.');
    }
  }
  return {
    x: envelope.left + envelope.width / 2 - (word.left + word.width / 2),
    y: envelope.top + envelope.height / 2 - (word.top + word.height / 2),
  };
}

/** An explosion path from the envelope offset to rest: a bowed apex beside the straight line, lifted upward, with its own spin and pace. */
export function promotionArc(offset: Point, roll: Roll) {
  if (![offset.x, offset.y].every(Number.isFinite)) {
    throw new RangeError('An arc needs a finite launch offset.');
  }
  const length = Math.hypot(offset.x, offset.y) || 1;
  const side = drawRoll(roll) < 0.5 ? -1 : 1;
  const bend = side * (60 + drawRoll(roll) * 160);
  const rise = 40 + drawRoll(roll) * 120;
  return {
    apex: { x: offset.x * 0.5 - (offset.y / length) * bend, y: offset.y * 0.5 + (offset.x / length) * bend - rise },
    spin: (drawRoll(roll) - 0.5) * 70,
    duration: 0.9 + drawRoll(roll) * 0.4,
  };
}
