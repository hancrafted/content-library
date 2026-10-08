import { describe, expect, it } from 'vitest';
import { FRAMEWORK_SLIDES } from './framework-slides.pure';

describe('success cases', () => {
  it('provides exactly 5 ordered framework steps', () => {
    // ARRANGE
    const expectedSteps = ['01', '02', '03', '04', '05'];
    const expectedCount = 5;
    // ACT
    const steps = FRAMEWORK_SLIDES.map((s) => s.step);
    // ASSERT
    expect(steps).toEqual(expectedSteps);
    expect(steps.length).toBe(expectedCount);
  });

  it('contains non-empty localizations for all slides', () => {
    // ARRANGE
    const minBullets = 3;
    // ACT
    const invalidSlides = FRAMEWORK_SLIDES.filter(
      (slide) =>
        !slide.shortTitle.en ||
        !slide.shortTitle.de ||
        !slide.deliverable.en ||
        !slide.deliverable.de ||
        slide.bullets.en.length < minBullets ||
        slide.bullets.de.length < minBullets,
    );
    // ASSERT
    expect(invalidSlides).toEqual([]);
  });
});

describe('failure cases', () => {
  it('does not contain duplicate slide identifiers or duplicate step numbers', () => {
    // ARRANGE
    const totalCount = FRAMEWORK_SLIDES.length;
    // ACT
    const uniqueIds = new Set(FRAMEWORK_SLIDES.map((s) => s.id));
    const uniqueSteps = new Set(FRAMEWORK_SLIDES.map((s) => s.step));
    // ASSERT
    expect(uniqueIds.size).toBe(totalCount);
    expect(uniqueSteps.size).toBe(totalCount);
  });
});

describe('edge cases', () => {
  it('contains valid letter badges matching first or corresponding characters', () => {
    // ARRANGE
    const emptyLetters: string[] = [];
    // ACT
    const missingLetters = FRAMEWORK_SLIDES.flatMap((s) => [s.letter.en, s.letter.de]).filter(
      (letter) => letter.length !== 1,
    );
    // ASSERT
    expect(missingLetters).toEqual(emptyLetters);
  });
});
