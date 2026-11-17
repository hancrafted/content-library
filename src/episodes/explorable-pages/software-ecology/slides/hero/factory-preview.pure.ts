// decision: docs/adr/0024-software-ecology-flow-model-and-use-case-files.md
export const RACK_SLOTS = 6;

export type Release = 'good' | 'bad';

export interface Rack {
  readonly filled: number;
  readonly full: boolean;
  readonly overflow: number;
}

export function rackOf(waiting: number): Rack {
  if (!Number.isInteger(waiting) || waiting < 0) {
    throw new Error(`A backlog is a whole number of documents, not ${waiting}.`);
  }
  const filled = Math.min(waiting, RACK_SLOTS);
  return { filled, full: filled === RACK_SLOTS, overflow: waiting - filled };
}

export function satisfactionOf(releases: readonly Release[]): number {
  if (releases.length === 0) return 1;
  const good = releases.filter((release) => release === 'good').length;
  return Math.round((good / releases.length) * 100) / 100;
}
