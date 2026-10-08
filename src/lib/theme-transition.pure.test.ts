import { describe, expect, it } from 'vitest';
import { computeActiveStep, computeThemeColors } from './theme-transition.pure';

describe('success cases', () => {
  it('returns dark background and light foreground for initial progress in light mode', () => {
    // ARRANGE
    const expectedBg = '#0A0E1A';
    const expectedFg = '#F8FAFC';
    // ACT
    const colors = computeThemeColors(0.5, false);
    // ASSERT
    expect(colors.bg).toBe(expectedBg);
    expect(colors.fg).toBe(expectedFg);
  });

  it('transitions to white background and dark foreground at the end in light mode', () => {
    // ARRANGE
    const expectedBg = '#FAF9F6';
    const expectedFg = '#0A0E1A';
    // ACT
    const colors = computeThemeColors(1.0, false);
    // ASSERT
    expect(colors.bg).toBe(expectedBg);
    expect(colors.fg).toBe(expectedFg);
  });

  it('maps progress to active step numbers across the rail', () => {
    // ARRANGE
    const stepOne = 1;
    const stepTwo = 2;
    const stepThree = 3;
    const stepFour = 4;
    const stepFive = 5;
    // ACT
    const s1 = computeActiveStep(0.1);
    const s2 = computeActiveStep(0.3);
    const s3 = computeActiveStep(0.6);
    const s4 = computeActiveStep(0.8);
    const s5 = computeActiveStep(0.98);
    // ASSERT
    expect([s1, s2, s3, s4, s5]).toEqual([stepOne, stepTwo, stepThree, stepFour, stepFive]);
  });
});

describe('failure cases', () => {
  it('handles negative progress by clamping to step 1 and initial colors', () => {
    // ARRANGE
    const expectedBg = '#0A0E1A';
    const expectedStep = 1;
    // ACT
    const colors = computeThemeColors(-0.5, false);
    const step = computeActiveStep(-0.5);
    // ASSERT
    expect(colors.bg).toBe(expectedBg);
    expect(step).toBe(expectedStep);
  });
});

describe('edge cases', () => {
  it('handles progress exceeding 1.0 by clamping to step 5 and final colors', () => {
    // ARRANGE
    const expectedBg = '#FAF9F6';
    const expectedStep = 5;
    // ACT
    const colors = computeThemeColors(1.5, false);
    const step = computeActiveStep(1.5);
    // ASSERT
    expect(colors.bg).toBe(expectedBg);
    expect(step).toBe(expectedStep);
  });

  it('handles dark site theme by interpolating towards dark theme background', () => {
    // ARRANGE
    const initialBg = '#FAF9F6';
    const finalBg = '#0B0F17';
    // ACT
    const startColors = computeThemeColors(0, true);
    const endColors = computeThemeColors(1.0, true);
    // ASSERT
    expect(startColors.bg).toBe(initialBg);
    expect(endColors.bg).toBe(finalBg);
  });
});
