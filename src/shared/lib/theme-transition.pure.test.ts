import { describe, expect, it } from 'vitest';
import { computeActiveStep, computeThemeColors, isStepReached } from './theme-transition.pure';

const SLIDE_COUNT = 5;

describe('success cases', () => {
  it('opens in the inverse of the site theme: the foreground token as background', () => {
    // ARRANGE
    const progress = 0.5;
    const expectedBg = 'color-mix(in oklab, var(--background) 0.0%, var(--foreground))';
    const expectedFg = 'color-mix(in oklab, var(--foreground) 0.0%, var(--background))';
    // ACT
    const colors = computeThemeColors(progress);
    // ASSERT
    expect(colors.bg).toBe(expectedBg);
    expect(colors.fg).toBe(expectedFg);
  });

  it('hands back to the site theme at the end of the rail', () => {
    // ARRANGE
    const progress = 1.0;
    const expectedBg = 'color-mix(in oklab, var(--background) 100.0%, var(--foreground))';
    const expectedFg = 'color-mix(in oklab, var(--foreground) 100.0%, var(--background))';
    const expectedBorder = 'var(--border) 100.0%';
    // ACT
    const colors = computeThemeColors(progress);
    // ASSERT
    expect(colors.bg).toBe(expectedBg);
    expect(colors.fg).toBe(expectedFg);
    expect(colors.border).toContain(expectedBorder);
  });

  it('mixes part of the way through the hand-back', () => {
    // ARRANGE
    const midway = 0.75 + 0.11;
    const expectedBg = 'color-mix(in oklab, var(--background) 50.0%, var(--foreground))';
    // ACT
    const colors = computeThemeColors(midway);
    // ASSERT
    expect(colors.bg).toBe(expectedBg);
  });

  it('makes the slide centred in the viewport the active step', () => {
    // ARRANGE
    const slideCentres = [0, 0.25, 0.5, 0.75, 1];
    const expected = [1, 2, 3, 4, 5];
    // ACT
    const steps = slideCentres.map((p) => computeActiveStep(p, SLIDE_COUNT));
    // ASSERT
    expect(steps).toEqual(expected);
  });

  it('hands the active step over halfway between two slide centres', () => {
    // ARRANGE
    const justBefore = [0.12, 0.37, 0.62, 0.87];
    const justAfter = [0.13, 0.38, 0.63, 0.88];
    const expectedBefore = [1, 2, 3, 4];
    const expectedAfter = [2, 3, 4, 5];
    // ACT
    const before = justBefore.map((p) => computeActiveStep(p, SLIDE_COUNT));
    const after = justAfter.map((p) => computeActiveStep(p, SLIDE_COUNT));
    // ASSERT
    expect(before).toEqual(expectedBefore);
    expect(after).toEqual(expectedAfter);
  });

  it('reaches a stepper node when the progress bar reaches its position', () => {
    // ARRANGE
    const progress = 0.5;
    const expected = [true, true, true, false, false];
    // ACT
    const reached = [0, 1, 2, 3, 4].map((idx) => isStepReached(progress, idx, SLIDE_COUNT));
    // ASSERT
    expect(reached).toEqual(expected);
  });

  it('uses only theme tokens, no raw colour', () => {
    // ARRANGE
    const raw = /#[0-9a-f]{3,8}\b|rgba?\(/i;
    // ACT
    const colors = computeThemeColors(0.9);
    const rawValues = Object.values(colors).filter((value) => raw.test(value));
    // ASSERT
    expect(rawValues).toEqual([]);
  });
});

describe('failure cases', () => {
  it('clamps negative progress to step 1 and the opening colours', () => {
    // ARRANGE
    const expectedStep = 1;
    // ACT
    const colors = computeThemeColors(-0.5);
    const step = computeActiveStep(-0.5, SLIDE_COUNT);
    // ASSERT
    expect(colors.bg).toBe(computeThemeColors(0).bg);
    expect(step).toBe(expectedStep);
  });
});

describe('edge cases', () => {
  it('clamps progress beyond 1.0 to step 5 and the closing colours', () => {
    // ARRANGE
    const expectedStep = 5;
    // ACT
    const colors = computeThemeColors(1.5);
    const step = computeActiveStep(1.5, SLIDE_COUNT);
    // ASSERT
    expect(colors.bg).toBe(computeThemeColors(1).bg);
    expect(step).toBe(expectedStep);
  });
});
