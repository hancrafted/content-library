import { describe, expect, it } from 'vitest';
import { modelNote, noteFor, type ModelWords } from './model-tier.pure';

const words: ModelWords = {
  model: 'Model: {tier}',
  modelInfo: 'What this model tier means',
  modelReviewTip: 'review tip',
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

  it('words a review as Low with the tooltip of its own, whatever the tier asked for', () => {
    // ARRANGE
    const expected = { label: 'Model: Low · quick', tip: 'review tip' };
    // ACT
    const note = modelNote(words, 'low', true);
    // ASSERT
    expect(note).toEqual(expected);
  });

  it.each([
    ['review#0', 'high', { tier: 'low', review: true }],
    ['review#2', 'low', { tier: 'low', review: true }],
    ['do#0', 'high', { tier: 'high', review: false }],
    ['then#0', 'medium', { tier: 'medium', review: false }],
  ] as const)('shows %s (job tier %s) as %j', (panel, recommended, expected) => {
    // ARRANGE
    const job = recommended;
    // ACT
    const note = noteFor(panel, job);
    // ASSERT
    expect(note).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('shows no note on a review of a job without a tier', () => {
    // ARRANGE
    const panel = 'review#0';
    // ACT
    const note = noteFor(panel, undefined);
    // ASSERT
    expect(note).toBeUndefined();
  });

  it('shows no note on a do prompt of a job without a tier', () => {
    // ARRANGE
    const panel = 'do#0';
    // ACT
    const note = noteFor(panel, undefined);
    // ASSERT
    expect(note).toBeUndefined();
  });

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
