/*
 * The typewriter entrance's timing (FE-012): when each character of a Slide
 * header appears. The pace is irregular, a bit faster then a bit slower, like
 * a person typing, but seeded by the Slide's id, so it is the same on every
 * load and in the static HTML. No DOM, no React: the header renders the
 * delays as CSS custom properties and CSS plays them.
 */

/** Milliseconds per character before jitter: the Eyebrow quick, the title deliberate, the caption fast. */
const NOMINAL_MS = [22, 45, 10] as const;

/** The breath between one typed part and the next. */
const PAUSE_MS = 120;

/** Every character starts within this; the caret's last blink fills the rest of the 1.5s entrance. */
export const TYPE_BUDGET_MS = 1200;

/** The whole header settled, caret gone: when the Slide's entrance is done. */
export const ENTRANCE_MS = 1500;

/** The jitter's spread: a character's weight lies between these before normalising. */
const WEIGHT_MIN = 0.45;
const WEIGHT_SPREAD = 1.1;

/** FNV-1a: a string to a 32-bit seed. */
function hash(seed: string): number {
  let value = 0x811c9dc5;
  for (let index = 0; index < seed.length; index += 1) {
    value ^= seed.charCodeAt(index);
    value = Math.imul(value, 0x01000193);
  }
  return value >>> 0;
}

/** mulberry32: a small seeded generator of numbers in [0, 1). */
function generator(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let next = Math.imul(state ^ (state >>> 15), 1 | state);
    next = (next + Math.imul(next ^ (next >>> 7), 61 | next)) ^ next;
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

/** `count` positive weights from `seed`, uneven but deterministic, normalised to a mean of one. */
export function seededJitter(seed: string, count: number): number[] {
  if (!Number.isInteger(count) || count < 0) throw new Error(`Jitter count "${count}" is not a whole number ≥ 0.`);
  const next = generator(hash(seed));
  const raw = Array.from({ length: count }, () => WEIGHT_MIN + next() * WEIGHT_SPREAD);
  const mean = raw.reduce((sum, weight) => sum + weight, 0) / (count || 1);
  return raw.map((weight) => weight / mean);
}

/**
 * The delay in milliseconds of every character of each typed part, in order
 * (Eyebrow, title, caption): each part starts after the last one ends and a
 * pause; a header too long for the budget is typed proportionally faster, so
 * every character starts within `TYPE_BUDGET_MS`. An empty part takes no time.
 */
export function typewriterSchedule(lengths: readonly number[], seed: string): number[][] {
  for (const length of lengths) {
    if (!Number.isInteger(length) || length < 0) throw new Error(`Part length "${length}" is not a whole number ≥ 0.`);
  }
  const typed = lengths.filter((length) => length > 0).length;
  const pauses = Math.max(typed - 1, 0) * PAUSE_MS;
  const typing = lengths.reduce((sum, length, part) => sum + length * nominalOf(part), 0);
  const scale = typing > 0 ? Math.min(1, (TYPE_BUDGET_MS - pauses) / typing) : 1;
  const weights = seededJitter(
    seed,
    lengths.reduce((sum, length) => sum + length, 0),
  );
  let clock = 0;
  let used = 0;
  return lengths.map((length, part) => {
    if (length === 0) return [];
    if (used > 0) clock += PAUSE_MS;
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
  return NOMINAL_MS[Math.min(part, NOMINAL_MS.length - 1)];
}
