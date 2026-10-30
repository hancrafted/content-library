/*
 * Which part of the drawn terminal window is explained. The parts in the order the tour walks them; the viewer can
 * also jump to any part by pointing at it, so the active part is the only state.
 */

export const PARTS = ['prompt', 'cursor', 'command', 'output', 'close'] as const;
export type Part = (typeof PARTS)[number];

/** The part the explanation starts on, so it is never empty. */
export const FIRST_PART: Part = PARTS[0];

/** The part a value names, or the first part for a value no control offers. */
export const partOf = (value: string): Part =>
  (PARTS as readonly string[]).includes(value) ? (value as Part) : FIRST_PART;

/** The part one step from `active` (`1` next, `-1` previous), stopping at both ends of the tour. */
export function stepPart(active: Part, direction: 1 | -1): Part {
  const index = PARTS.indexOf(active) + direction;
  return PARTS[Math.min(PARTS.length - 1, Math.max(0, index))] ?? FIRST_PART;
}

/** Whether `active` has a part after it (`1`) or before it (`-1`): whether the matching button can act. */
export const hasStep = (active: Part, direction: 1 | -1): boolean => stepPart(active, direction) !== active;
