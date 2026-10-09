export function paperOverflow(sample: number) {
  if (!Number.isFinite(sample) || sample < 0 || sample > 1) {
    throw new RangeError('Overflow randomness must be between zero and one.');
  }
  return { delay: 1 + sample * 3, drift: (sample - 0.5) * 480, duration: 4 + sample };
}
