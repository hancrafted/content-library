/** The five PRICE traits, in the order their first letters spell PRICE. */
export const TRAITS = ['probabilistic', 'relentless', 'informed', 'confident', 'every-word-billed'] as const;
export type TraitSlug = (typeof TRAITS)[number];

/** The five BRIEF moves, in the order their first letters spell BRIEF. */
export const MOVES = [
  'break-it-down',
  'requirements-first',
  'interview-yourself-with-ai',
  'evaluate-each-step',
  'fresh-start-for-each-piece',
] as const;
export type MoveSlug = (typeof MOVES)[number];

/** One move and the traits it counters. */
export interface MoveCounters {
  readonly slug: MoveSlug;
  readonly counters: readonly TraitSlug[];
}

/** Which move counters which trait, many to many, as the Spec's Visual idea maps them. */
export const BRIEF = [
  { slug: 'break-it-down', counters: ['relentless', 'every-word-billed'] },
  { slug: 'requirements-first', counters: ['probabilistic', 'confident'] },
  { slug: 'interview-yourself-with-ai', counters: ['confident', 'informed'] },
  { slug: 'evaluate-each-step', counters: ['relentless', 'probabilistic'] },
  { slug: 'fresh-start-for-each-piece', counters: ['every-word-billed', 'relentless', 'probabilistic'] },
] as const satisfies readonly MoveCounters[];

/** How many moves counter each trait: the board's footer row. */
export function counterTotals(moves: readonly MoveCounters[]): Record<TraitSlug, number> {
  const totals = Object.fromEntries(TRAITS.map((trait) => [trait, 0])) as Record<TraitSlug, number>;
  for (const move of moves) for (const trait of move.counters) totals[trait] += 1;
  return totals;
}
