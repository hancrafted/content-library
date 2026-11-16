import { describe, expect, it } from 'vitest';
import { modelNote, type ModelWords } from './model-tier.pure';

const words: ModelWords = {
  model: 'Model: {tier}',
  modelInfo: 'What this model tier means',
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
  it('has no words for a tier outside high, medium and low, which the loader never lets through', () => {
    // ARRANGE
    const unknown = 'ultra' as never;
    // ACT
    const note = () => modelNote(words, unknown);
    // ASSERT
    expect(note).toThrow(TypeError);
  });
});

describe('edge cases', () => {
  it('keeps a `$` of a tier label as it is', () => {
    // ARRANGE
    const label = '$& costs';
    const expected = 'Model: $& costs';
    // ACT
    const note = modelNote({ ...words, modelHigh: label }, 'high');
    // ASSERT
    expect(note.label).toBe(expected);
  });

  it('leaves a frame without the placeholder as it is', () => {
    // ARRANGE
    const frame = 'Model';
    // ACT
    const note = modelNote({ ...words, model: frame }, 'low');
    // ASSERT
    expect(note.label).toBe(frame);
  });
});
