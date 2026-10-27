import { describe, expect, it } from 'vitest';
import { focusTarget, STEPPER_STEPS, stepStatus, toggleStep } from './vertical-stepper.pure';

describe('success cases', () => {
  it('marks steps before the current one done and steps after it upcoming', () => {
    // ARRANGE
    const current = 2;
    const expected = ['done', 'done', 'current', 'upcoming', 'upcoming', 'upcoming'];
    // ACT
    const statuses = STEPPER_STEPS.map((_, index) => stepStatus(index, current));
    // ASSERT
    expect(statuses).toEqual(expected);
  });

  it('opens a closed step alone and makes it current', () => {
    // ARRANGE
    const before = { current: 1, open: 1 };
    const opened = 4;
    const expected = { current: opened, open: opened };
    // ACT
    const after = toggleStep(before, opened);
    // ASSERT
    expect(after).toEqual(expected);
  });

  it('moves current back when an earlier step opens, so later steps read upcoming again', () => {
    // ARRANGE
    const before = { current: 4, open: 4 };
    const opened = 1;
    const expected = { current: opened, open: opened };
    // ACT
    const after = toggleStep(before, opened);
    // ASSERT
    expect(after).toEqual(expected);
  });

  it('moves focus to the next and previous header with the arrow keys, and to the ends with Home and End', () => {
    // ARRANGE
    const from = 2;
    const expected = { ArrowDown: 3, ArrowUp: 1, Home: 0, End: STEPPER_STEPS.length - 1 };
    // ACT
    const targets = {
      ArrowDown: focusTarget(from, 'ArrowDown'),
      ArrowUp: focusTarget(from, 'ArrowUp'),
      Home: focusTarget(from, 'Home'),
      End: focusTarget(from, 'End'),
    };
    // ASSERT
    expect(targets).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('refuses a step that is not on the stepper', () => {
    // ARRANGE
    const outside = STEPPER_STEPS.length;
    // ACT
    const read = () => stepStatus(outside, 0);
    // ASSERT
    expect(read).toThrow(String(outside));
  });

  it('refuses to open a step that is not on the stepper', () => {
    // ARRANGE
    const outside = -1;
    // ACT
    const open = () => toggleStep({ current: 0, open: null }, outside);
    // ASSERT
    expect(open).toThrow(String(outside));
  });

  it('ignores keys that do not move focus', () => {
    // ARRANGE
    const from = 2;
    // ACT
    const target = focusTarget(from, 'Enter');
    // ASSERT
    expect(target).toBeNull();
  });
});

describe('edge cases', () => {
  it('shows every step upcoming but the first while the first is current', () => {
    // ARRANGE
    const expected = ['current', 'upcoming', 'upcoming', 'upcoming', 'upcoming', 'upcoming'];
    // ACT
    const statuses = STEPPER_STEPS.map((_, index) => stepStatus(index, 0));
    // ASSERT
    expect(statuses).toEqual(expected);
  });

  it('closes the open step when it is toggled again and keeps it current', () => {
    // ARRANGE
    const current = 3;
    const before = { current, open: current };
    const expected = { current, open: null };
    // ACT
    const after = toggleStep(before, current);
    // ASSERT
    expect(after).toEqual(expected);
  });

  it('wraps focus from the last header to the first and back', () => {
    // ARRANGE
    const last = STEPPER_STEPS.length - 1;
    const expected = { down: 0, up: last };
    // ACT
    const targets = { down: focusTarget(last, 'ArrowDown'), up: focusTarget(0, 'ArrowUp') };
    // ASSERT
    expect(targets).toEqual(expected);
  });
});
