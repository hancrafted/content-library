/*
 * Copied from the vertical-stepper master with changes: four steps, the lines of the day-one note, closed at rest.
 * The vertical stepper's state: which step is current, which one is open, what
 * each step reads as, and where arrow keys move focus. No DOM, no React.
 */

/** The steps, in order, the four lines of the day-one note; each names its Translation keys under `items.<key>`. */
export const STEPPER_STEPS = ['context', 'tools', 'brief', 'check'] as const;

export type StepperStep = (typeof STEPPER_STEPS)[number];

export type StepStatus = 'done' | 'current' | 'upcoming';

function assertStep(index: number): void {
  if (!Number.isInteger(index) || index < 0 || index >= STEPPER_STEPS.length) {
    throw new Error(`${index} is not a step on a stepper of ${STEPPER_STEPS.length}.`);
  }
}

/** Steps before the current one are done; steps after it are still to come. */
export function stepStatus(index: number, current: number): StepStatus {
  assertStep(index);
  assertStep(current);
  if (index < current) return 'done';
  return index === current ? 'current' : 'upcoming';
}

export interface StepperState {
  /** The step the process has reached. */
  readonly current: number;
  /** The one step whose caption shows, or none. */
  readonly open: number | null;
}

/** At rest every step is closed and the first is current: start here; the four headings stand on their own. */
export const FIRST_STATE: StepperState = { current: 0, open: null };

/** An accordion: opening a step closes the others and makes it current; toggling the open step closes it. */
export function toggleStep(state: StepperState, index: number): StepperState {
  assertStep(index);
  return state.open === index ? { current: state.current, open: null } : { current: index, open: index };
}

/**
 * Which header a key moves focus to from header `from`: arrows step and wrap,
 * Home and End jump to the ends, any other key leaves focus where it is.
 */
export function focusTarget(from: number, key: string): number | null {
  assertStep(from);
  const count = STEPPER_STEPS.length;
  switch (key) {
    case 'ArrowDown':
      return (from + 1) % count;
    case 'ArrowUp':
      return (from - 1 + count) % count;
    case 'Home':
      return 0;
    case 'End':
      return count - 1;
    default:
      return null;
  }
}
