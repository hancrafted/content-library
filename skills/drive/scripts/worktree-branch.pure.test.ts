import { describe, expect, it } from 'vitest';
import { mergedPrOfTip, parseMergedPrs } from './worktree-branch.pure.ts';

describe('parseMergedPrs', () => {
  it('reads the number and head commit of each merged PR', () => {
    // ARRANGE
    const stdout = '[{"number":7,"headRefOid":"abc"},{"number":8,"headRefOid":"def"}]';
    // ACT
    const prs = parseMergedPrs(stdout);
    // ASSERT
    expect(prs).toEqual([
      { number: 7, headRefOid: 'abc' },
      { number: 8, headRefOid: 'def' },
    ]);
  });

  it('reads nothing from output that is not a list of PRs', () => {
    // ARRANGE
    const outputs = ['', 'gh: not logged in', '{}', '[{"number":"7"}]'];
    // ACT
    const prs = outputs.map(parseMergedPrs);
    // ASSERT
    expect(prs).toEqual([[], [], [], []]);
  });
});

describe('mergedPrOfTip', () => {
  it('finds the merged PR whose head is the branch tip, and none once the branch moved on', () => {
    // ARRANGE
    const prs = [{ number: 7, headRefOid: 'abc' }];
    // ACT
    const found = mergedPrOfTip(prs, 'abc');
    const moved = mergedPrOfTip(prs, 'later');
    // ASSERT
    expect(found).toEqual({ number: 7, headRefOid: 'abc' });
    expect(moved).toBeUndefined();
  });
});
