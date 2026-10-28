import { describe, expect, it } from 'vitest';
import type { UiWords } from './human-in-the-loop.types';
import { viewOptions } from './view-options.pure';

const words = {
  viewStages: 'Stages',
  viewStagesTip: 'The high-level view: one card per stage',
  viewJobs: 'Jobs',
  viewJobsTip: 'The detailed view: every job of each stage',
} as UiWords;

describe('success cases', () => {
  it('lists Stages and Jobs in that order', () => {
    // ARRANGE
    // ACT
    const options = viewOptions(words);
    // ASSERT
    expect(options.map(({ value, label }) => [value, label])).toEqual([
      ['stages', 'Stages'],
      ['jobs', 'Jobs'],
    ]);
  });

  it('gives each view its tooltip: Stages the high-level view, Jobs the detailed one', () => {
    // ARRANGE
    // ACT
    const tips = viewOptions(words).map(({ tip }) => tip);
    // ASSERT
    expect(tips).toEqual(['The high-level view: one card per stage', 'The detailed view: every job of each stage']);
  });
});

describe('failure cases', () => {
  it('offers no Hands-on view: progress shows inside the two views, not as a third', () => {
    // ARRANGE
    // ACT
    const values: string[] = viewOptions(words).map(({ value }) => value);
    // ASSERT
    expect(values).not.toContain('handson');
  });
});

describe('edge cases', () => {
  it('never offers a view twice', () => {
    // ARRANGE
    // ACT
    const views = viewOptions(words).map(({ value }) => value);
    // ASSERT
    expect(new Set(views).size).toBe(views.length);
  });
});
