import { describe, expect, it } from 'vitest';
import { workflowLights } from './compare-motion.pure';

describe('success cases', () => {
  it('lights the workflow and fades the one long chat once the Slide starts entering', () => {
    // ARRANGE
    const expected = true;
    // ACT
    const lights = workflowLights({ entryAtMount: 'pending', entry: 'entering', replays: 0 });
    // ASSERT
    expect(lights).toBe(expected);
  });

  it('keeps playing when the entrance is done, so the fade finishes', () => {
    // ARRANGE
    const expected = true;
    // ACT
    const lights = workflowLights({ entryAtMount: 'pending', entry: 'done', replays: 0 });
    // ASSERT
    expect(lights).toBe(expected);
  });

  it('plays again on mouse enter or keyboard focus, after the entrance', () => {
    // ARRANGE
    const expected = true;
    // ACT
    const lights = workflowLights({ entryAtMount: 'done', entry: 'done', replays: 1 });
    // ASSERT
    expect(lights).toBe(expected);
  });
});

describe('failure cases', () => {
  it('holds still while the Slide waits to enter', () => {
    // ARRANGE
    const expected = false;
    // ACT
    const lights = workflowLights({ entryAtMount: 'pending', entry: 'pending', replays: 0 });
    // ASSERT
    expect(lights).toBe(expected);
  });
});

describe('edge cases', () => {
  it('never replays when the panels mount again after their Slide has entered', () => {
    // ARRANGE
    const expected = false;
    // ACT
    const lights = workflowLights({ entryAtMount: 'done', entry: 'done', replays: 0 });
    // ASSERT
    expect(lights).toBe(expected);
  });
});
