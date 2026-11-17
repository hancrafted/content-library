import { describe, expect, it } from 'vitest';
import { handoffLights } from './handoff-motion.pure';

describe('success cases', () => {
  it('lights the handoff card once the Slide starts entering', () => {
    // ARRANGE
    const expected = true;
    // ACT
    const lights = handoffLights({ entryAtMount: 'pending', entry: 'entering', replays: 0 });
    // ASSERT
    expect(lights).toBe(expected);
  });

  it('keeps the card lighting when the entrance is done, so the light finishes', () => {
    // ARRANGE
    const expected = true;
    // ACT
    const lights = handoffLights({ entryAtMount: 'pending', entry: 'done', replays: 0 });
    // ASSERT
    expect(lights).toBe(expected);
  });

  it('lights the card again on mouse enter or keyboard focus, after the entrance', () => {
    // ARRANGE
    const expected = true;
    // ACT
    const lights = handoffLights({ entryAtMount: 'done', entry: 'done', replays: 1 });
    // ASSERT
    expect(lights).toBe(expected);
  });
});

describe('failure cases', () => {
  it('holds the light while the Slide waits to enter', () => {
    // ARRANGE
    const expected = false;
    // ACT
    const lights = handoffLights({ entryAtMount: 'pending', entry: 'pending', replays: 0 });
    // ASSERT
    expect(lights).toBe(expected);
  });
});

describe('edge cases', () => {
  it('never replays when the card mounts again after its Slide has entered', () => {
    // ARRANGE
    const expected = false;
    // ACT
    const lights = handoffLights({ entryAtMount: 'done', entry: 'done', replays: 0 });
    // ASSERT
    expect(lights).toBe(expected);
  });
});
