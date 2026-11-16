import { describe, expect, it } from 'vitest';
import { modelNote } from './model-tier.pure';

const words = {
  model: 'Model: {tier}',
  modelHigh: 'High · deep thinking',
  modelHighTip: 'high tip',
  modelMedium: 'Medium · everyday',
  modelMediumTip: 'medium tip',
  modelLow: 'Low · quick',
  modelLowTip: 'low tip',
};

describe('success cases', () => {
  it.each([
    ['high', 'Model: High · deep thinking', 'high tip'],
    ['medium', 'Model: Medium · everyday', 'medium tip'],
    ['low', 'Model: Low · quick', 'low tip'],
  ] as const)('words the %s tier with its label and its one standard tooltip', (tier, label, tip) => {
    // ARRANGE
    const expected = { label, tip };
    // ACT
    const note = modelNote(words, tier);
    // ASSERT
    expect(note).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('leaves a label without the placeholder as it is', () => {
    // ARRANGE
    const plain = { ...words, model: 'Model' };
    // ACT
    const note = modelNote(plain, 'low');
    // ASSERT
    expect(note.label).toBe('Model');
  });
});

describe('edge cases', () => {
  it('keeps a `$` of a tier label as it is', () => {
    // ARRANGE
    const dollar = { ...words, modelHigh: '$& costs' };
    // ACT
    const note = modelNote(dollar, 'high');
    // ASSERT
    expect(note.label).toBe('Model: $& costs');
  });
});
