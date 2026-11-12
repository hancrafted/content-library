/*
 * The hero preview's readings of the factory's steady frame: how a work center's rack shows its waiting work, and how
 * the Customer's last releases read as satisfaction. Pure, so the picture's numbers test without rendering.
 */

/** A rack's slots for waiting work (design-ADR 0024 §14): past six, the top slot turns red with "+n" beside it. */
export const RACK_SLOTS = 6;

/** A release the Customer received: good, or bad. */
export type Release = 'good' | 'bad';

/** A rack as drawn: the slots filled from the bottom, whether it is full, and how many documents wait past it. */
export interface Rack {
  readonly filled: number;
  readonly full: boolean;
  readonly overflow: number;
}

/** The rack of a work center with `waiting` documents in its backlog. */
export function rackOf(waiting: number): Rack {
  if (!Number.isInteger(waiting) || waiting < 0) {
    throw new Error(`A backlog is a whole number of documents, not ${waiting}.`);
  }
  const filled = Math.min(waiting, RACK_SLOTS);
  return { filled, full: filled === RACK_SLOTS, overflow: waiting - filled };
}

/** The share of good releases, to whole percent; no releases yet reads as fully satisfied. */
export function satisfactionOf(releases: readonly Release[]): number {
  if (releases.length === 0) return 1;
  const good = releases.filter((release) => release === 'good').length;
  return Math.round((good / releases.length) * 100) / 100;
}
