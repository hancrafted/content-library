interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

export function promotionFlight(envelope: Box, word: Box): { x: number; y: number } {
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
