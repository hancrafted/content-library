import { describe, expect, it } from 'vitest';
import { FIRST_PART, hasStep, partOf, PARTS, stepPart } from './anatomy.pure';

describe('success cases', () => {
  it('steps forward and back through the parts in tour order', () => {
    // ARRANGE
    const expected = { next: 'cursor', previous: 'prompt' };
    // ACT
    const found = { next: stepPart('prompt', 1), previous: stepPart('cursor', -1) };
    // ASSERT
    expect(found).toEqual(expected);
  });

  it('knows a part by its name', () => {
    // ARRANGE
    const expected = PARTS;
    // ACT
    const found = PARTS.map((part) => partOf(part));
    // ASSERT
    expect(found).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('falls back to the first part for a name no part has', () => {
    // ARRANGE
    const expected = FIRST_PART;
    // ACT
    const found = partOf('window');
    // ASSERT
    expect(found).toBe(expected);
  });
});

describe('edge cases', () => {
  it('stops at both ends of the tour and says no step is left there', () => {
    // ARRANGE
    const last = PARTS[PARTS.length - 1] as (typeof PARTS)[number];
    const expected = { first: 'prompt', last, canBack: false, canNext: false };
    // ACT
    const found = {
      first: stepPart('prompt', -1),
      last: stepPart(last, 1),
      canBack: hasStep('prompt', -1),
      canNext: hasStep(last, 1),
    };
    // ASSERT
    expect(found).toEqual(expected);
  });
});
