// decision: docs/decision-records/0012-slide-header-and-play-once-motion.md
const NOMINAL_MILLISECONDS = [22, 45, 10] as const;

const PAUSE_MILLISECONDS = 120;

export const TYPE_BUDGET_MILLISECONDS = 1200;

export const ENTRANCE_MILLISECONDS = 1500;

const WEIGHT_MINIMUM = 0.45;
const WEIGHT_SPREAD = 1.1;

function hash(seed: string): number {
  let value = 0x811c9dc5;
  for (let index = 0; index < seed.length; index += 1) {
    value ^= seed.charCodeAt(index);
    value = Math.imul(value, 0x01000193);
  }
  return value >>> 0;
}

function generator(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let next = Math.imul(state ^ (state >>> 15), 1 | state);
    next = (next + Math.imul(next ^ (next >>> 7), 61 | next)) ^ next;
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededJitter(seed: string, count: number): number[] {
  if (!Number.isInteger(count) || count < 0) throw new Error(`Jitter count "${count}" is not a whole number ≥ 0.`);
  const next = generator(hash(seed));
  const raw = Array.from({ length: count }, () => WEIGHT_MINIMUM + next() * WEIGHT_SPREAD);
  const mean = raw.reduce((sum, weight) => sum + weight, 0) / (count || 1);
  return raw.map((weight) => weight / mean);
}

export function typewriterSchedule(lengths: readonly number[], seed: string): number[][] {
  for (const length of lengths) {
    if (!Number.isInteger(length) || length < 0) throw new Error(`Part length "${length}" is not a whole number ≥ 0.`);
  }
  const typed = lengths.filter((length) => length > 0).length;
  const pauses = Math.max(typed - 1, 0) * PAUSE_MILLISECONDS;
  const typing = lengths.reduce((sum, length, part) => sum + length * nominalOf(part), 0);
  const scale = typing > 0 ? Math.min(1, (TYPE_BUDGET_MILLISECONDS - pauses) / typing) : 1;
  const weights = seededJitter(
    seed,
    lengths.reduce((sum, length) => sum + length, 0),
  );
  let clock = 0;
  let used = 0;
  return lengths.map((length, part) => {
    if (length === 0) return [];
    if (used > 0) clock += PAUSE_MILLISECONDS;
    const perChar = nominalOf(part) * scale;
    const delays = weights.slice(used, used + length).map((weight) => {
      const at = clock;
      clock += weight * perChar;
      return at;
    });
    used += length;
    return delays;
  });
}

function nominalOf(part: number): number {
  return NOMINAL_MILLISECONDS[Math.min(part, NOMINAL_MILLISECONDS.length - 1)];
}
