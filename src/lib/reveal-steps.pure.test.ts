import { describe, expect, it } from 'vitest';
import { advanceKey, nextRevealStep, revealedSteps, startRevealStep } from './reveal-steps.pure';

describe('success cases', () => {
  it('starts at the first step, so only the resting layers show', () => {
    // ARRANGE
    const expected = 1;
    // ACT
    const step = startRevealStep({ reducedMotion: false, steps: 5 });
    // ASSERT
    expect(step).toBe(expected);
  });

  it('advances one step per click or key', () => {
    // ARRANGE
    const expected = 3;
    // ACT
    const step = nextRevealStep(2, 5);
    // ASSERT
    expect(step).toBe(expected);
  });

  it('lists every step up to the current one, for the CSS to show', () => {
    // ARRANGE
    const expected = '1 2 3';
    // ACT
    const revealed = revealedSteps(3);
    // ASSERT
    expect(revealed).toBe(expected);
  });

  it('advances on a bare right arrow', () => {
    // ARRANGE
    const expected = true;
    // ACT
    const advances = advanceKey({ key: 'ArrowRight', altKey: false, ctrlKey: false, metaKey: false, shiftKey: false });
    // ASSERT
    expect(advances).toBe(expected);
  });
});

describe('failure cases', () => {
  it('stays on the last step, so the finished frame holds', () => {
    // ARRANGE
    const expected = 5;
    // ACT
    const step = nextRevealStep(5, 5);
    // ASSERT
    expect(step).toBe(expected);
  });

  it('shows every step at once under reduced motion', () => {
    // ARRANGE
    const expected = 5;
    // ACT
    const step = startRevealStep({ reducedMotion: true, steps: 5 });
    // ASSERT
    expect(step).toBe(expected);
  });

  it('ignores a right arrow with a modifier, which belongs to the browser', () => {
    // ARRANGE
    const expected = false;
    // ACT
    const advances = advanceKey({ key: 'ArrowRight', altKey: true, ctrlKey: false, metaKey: false, shiftKey: false });
    // ASSERT
    expect(advances).toBe(expected);
  });

  it('ignores any other key', () => {
    // ARRANGE
    const expected = false;
    // ACT
    const advances = advanceKey({ key: 'ArrowDown', altKey: false, ctrlKey: false, metaKey: false, shiftKey: false });
    // ASSERT
    expect(advances).toBe(expected);
  });
});

describe('edge cases', () => {
  it('holds a one-step disclosure on its only step', () => {
    // ARRANGE
    const expected = 1;
    // ACT
    const step = nextRevealStep(startRevealStep({ reducedMotion: false, steps: 1 }), 1);
    // ASSERT
    expect(step).toBe(expected);
  });

  it('lists only the first step at rest', () => {
    // ARRANGE
    const expected = '1';
    // ACT
    const revealed = revealedSteps(1);
    // ASSERT
    expect(revealed).toBe(expected);
  });
});
