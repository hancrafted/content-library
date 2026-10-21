import { describe, expect, it } from 'vitest';
import { callStepShown } from './call-steps.pure';

describe('success cases', () => {
  it('starts a play at step 0 on the Slide first active, before any timer has advanced it', () => {
    // ARRANGE
    const expected = 0;
    // ACT
    const step = callStepShown({ entryAtMount: 'pending', entry: 'entering', replays: 0, progress: null, last: 3 });
    // ASSERT
    expect(step).toBe(expected);
  });

  it('shows the step a timer of the current play reached', () => {
    // ARRANGE
    const expected = 2;
    // ACT
    const step = callStepShown({
      entryAtMount: 'pending',
      entry: 'done',
      replays: 0,
      progress: { run: 0, step: 2 },
      last: 3,
    });
    // ASSERT
    expect(step).toBe(expected);
  });

  it('restarts at step 0 on a replay, ignoring the step the previous play reached', () => {
    // ARRANGE
    const expected = 0;
    // ACT
    const step = callStepShown({
      entryAtMount: 'done',
      entry: 'done',
      replays: 1,
      progress: { run: 0, step: 3 },
      last: 3,
    });
    // ASSERT
    expect(step).toBe(expected);
  });
});

describe('failure cases', () => {
  it('shows the end state while the Slide is pending, so the static HTML holds the finished picture', () => {
    // ARRANGE
    const expected = 3;
    // ACT
    const step = callStepShown({ entryAtMount: 'pending', entry: 'pending', replays: 0, progress: null, last: 3 });
    // ASSERT
    expect(step).toBe(expected);
  });
});

describe('edge cases', () => {
  it('rests at the end state when it mounts again after its Slide already entered', () => {
    // ARRANGE
    const expected = 4;
    // ACT
    const step = callStepShown({ entryAtMount: 'done', entry: 'done', replays: 0, progress: null, last: 4 });
    // ASSERT
    expect(step).toBe(expected);
  });
});
