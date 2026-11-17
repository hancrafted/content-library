export const STEPPER_STEPS = ['a', 'b', 'c', 'd', 'e', 'f'] as const;

export type StepperStep = (typeof STEPPER_STEPS)[number];

export type StepStatus = 'done' | 'current' | 'upcoming';

function assertStep(index: number): void {
  if (!Number.isInteger(index) || index < 0 || index >= STEPPER_STEPS.length) {
    throw new Error(`${index} is not a step on a stepper of ${STEPPER_STEPS.length}.`);
  }
}

export function stepStatus(index: number, current: number): StepStatus {
  assertStep(index);
  assertStep(current);
  if (index < current) return 'done';
  return index === current ? 'current' : 'upcoming';
}

export interface StepperState {
  readonly current: number;
  readonly open: number | null;
}

export const FIRST_STATE: StepperState = { current: 2, open: 2 };

export function toggleStep(state: StepperState, index: number): StepperState {
  assertStep(index);
  return state.open === index ? { current: state.current, open: null } : { current: index, open: index };
}

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
