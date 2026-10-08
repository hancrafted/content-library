import type { Locale } from './locale.pure';

/** Columns of the story matrix — who the change lands on. */
export const WHO = ['individual', 'team', 'organisation'] as const;
/** Rows of the story matrix — what kind of change it is. */
export const WHAT = ['process', 'technology'] as const;

export type Who = (typeof WHO)[number];
export type What = (typeof WHAT)[number];

export interface Crossing {
  who: Who;
  what: What;
}

/** Where a story sits; `spillsInto` marks a second crossing the story reaches without owning it. */
export interface StoryPlacement extends Crossing {
  id: string;
  spillsInto?: Crossing;
}

export type MatrixCell =
  | (Crossing & { kind: 'story'; storyId: string })
  | (Crossing & { kind: 'spill'; storyId: string })
  | (Crossing & { kind: 'empty' });

function sameCrossing(a: Crossing, b: Crossing): boolean {
  return a.who === b.who && a.what === b.what;
}

function cellAt(crossing: Crossing, placements: readonly StoryPlacement[]): MatrixCell {
  const story = placements.find((placement) => sameCrossing(placement, crossing));
  if (story) return { kind: 'story', ...crossing, storyId: story.id };
  const spilling = placements.find((placement) => placement.spillsInto && sameCrossing(placement.spillsInto, crossing));
  if (spilling) return { kind: 'spill', ...crossing, storyId: spilling.id };
  return { kind: 'empty', ...crossing };
}

/** The six crossings in reading order — row by row, columns left to right. */
export function matrixCells(placements: readonly StoryPlacement[]): MatrixCell[] {
  return WHAT.flatMap((what) => WHO.map((who) => cellAt({ who, what }, placements)));
}

export interface HighlightedAxes {
  who: Who | null;
  what: What | null;
}

/** The axes a hovered crossing lights: its own row and column, never its neighbours. */
export function highlightedAxes(hovered: Crossing | null): HighlightedAxes {
  return { who: hovered?.who ?? null, what: hovered?.what ?? null };
}

/** The stat shown `elapsedMs` into a count-up: ease-out cubic, clamped to `[0, target]`. */
export function countUpAt(target: number, elapsedMs: number, durationMs: number): number {
  if (durationMs <= 0) return target;
  const progress = Math.min(Math.max(elapsedMs / durationMs, 0), 1);
  return target * (1 - (1 - progress) ** 3);
}

/** A stat written in the reader's locale at a fixed precision, so a count-up never shows stray fractions. */
export function formatStat(value: number, decimals: number, locale: Locale): string {
  return new Intl.NumberFormat(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(
    value,
  );
}

/** The banked stories and where they sit. Copy lives in `landing.about.stories.<id>` of each catalog. */
export const STORY_PLACEMENTS = [
  { id: 'pitch', who: 'individual', what: 'process' },
  { id: 'ribTeam', who: 'team', what: 'process', spillsInto: { who: 'team', what: 'technology' } },
  { id: 'audiGates', who: 'organisation', what: 'process' },
  { id: 'ribAi', who: 'organisation', what: 'technology' },
] as const satisfies readonly StoryPlacement[];

export type StoryId = (typeof STORY_PLACEMENTS)[number]['id'];
