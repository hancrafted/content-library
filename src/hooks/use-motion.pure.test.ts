import { describe, expect, it } from 'vitest';
import { IDLE_FRAMES, MOTION_AT_REST, arm, frame, settle, start, type MotionState } from './use-motion.pure';

const times = (count: number, state: MotionState, step: (s: MotionState) => MotionState): MotionState =>
  Array.from({ length: count }).reduce<MotionState>((now) => step(now), state);

describe('success cases', () => {
  it('reports running from the moment the triggering state changes, before any transition has started', () => {
    // ARRANGE
    const expected = 'running';
    // ACT
    const actual = arm(MOTION_AT_REST);
    // ASSERT
    expect(actual.phase).toBe(expected);
  });

  it('stays running while any of its transitions or keyframe animations is live, and settles on the last end', () => {
    // ARRANGE
    const twoLive = start(start(arm(MOTION_AT_REST)));
    // ACT
    const afterOne = settle(twoLive);
    const afterTwo = settle(afterOne);
    // ASSERT
    expect(afterOne.phase).toBe('running');
    expect(afterTwo.phase).toBe('settled');
  });

  it('does not settle on idle frames while a motion that started is still live', () => {
    // ARRANGE
    const live = start(arm(MOTION_AT_REST));
    // ACT
    const later = times(IDLE_FRAMES * 3, live, frame);
    // ASSERT
    expect(later.phase).toBe('running');
  });
});

describe('failure cases', () => {
  it('settles after the idle frames when nothing started, as under reduced motion', () => {
    // ARRANGE
    const armed = arm(MOTION_AT_REST);
    // ACT
    const early = times(IDLE_FRAMES - 1, armed, frame);
    const late = frame(early);
    // ASSERT
    expect(early.phase).toBe('running');
    expect(late.phase).toBe('settled');
  });

  it('ignores an end or cancel it never saw start instead of counting below zero', () => {
    // ARRANGE
    const armed = arm(MOTION_AT_REST);
    // ACT
    const after = settle(armed);
    const next = start(after);
    // ASSERT
    expect(next.live).toBe(1);
  });
});

describe('edge cases', () => {
  it('restarts the idle count when armed again mid-wait', () => {
    // ARRANGE
    const waiting = times(IDLE_FRAMES - 1, arm(MOTION_AT_REST), frame);
    // ACT
    const rearmed = arm(waiting);
    const stillWaiting = times(IDLE_FRAMES - 1, rearmed, frame);
    // ASSERT
    expect(stillWaiting.phase).toBe('running');
  });

  it('rests at settled and stays there across idle frames', () => {
    // ARRANGE
    const rest = MOTION_AT_REST;
    // ACT
    const after = times(IDLE_FRAMES, rest, frame);
    // ASSERT
    expect(after.phase).toBe('settled');
  });
});
