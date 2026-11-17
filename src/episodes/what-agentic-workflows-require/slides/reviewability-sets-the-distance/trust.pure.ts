/** A step on the three-step trust scale: how much trust a task needs, or how much its check has earned. */
export type Trust = 1 | 2 | 3;

/** How far a person steps out of the loop. */
export type Level = 'in' | 'on' | 'out';

export interface TrustState {
  /** What a wrong result can do sets how much trust the task needs. */
  readonly needed: Trust;
  /** What the task's check has proved so far. */
  readonly earned: Trust;
}

/**
 * The level a task may step out to: a person stays in until the trust earned covers the trust needed; once it does,
 * a task of the lowest need steps out and any other stays on the loop (a person still watches where a wrong result
 * can do real damage).
 */
export function trustLevel({ needed, earned }: TrustState): Level {
  if (earned < needed) return 'in';
  return needed === 1 ? 'out' : 'on';
}
