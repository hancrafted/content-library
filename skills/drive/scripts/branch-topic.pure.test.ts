import { describe, expect, it } from 'vitest';
import { topicOfBranch } from './branch-topic.pure.ts';

describe('topicOfBranch', () => {
  it('reads the slug of an Integration branch and leaves the task empty', () => {
    // ARRANGE
    const branch = 'chore/drive-fortify-sweep';
    const expected = { topic: 'drive-fortify-sweep', task: null };
    // ACT
    const parsed = topicOfBranch(branch);
    // ASSERT
    expect(parsed).toEqual(expected);
  });

  it('reads the parent slug and the task of a Task branch', () => {
    // ARRANGE
    const branch = 'chore/drive-fortify-sweep--791-ac-gate';
    const expected = { topic: 'drive-fortify-sweep', task: '791-ac-gate' };
    // ACT
    const parsed = topicOfBranch(branch);
    // ASSERT
    expect(parsed).toEqual(expected);
  });

  it('accepts a branch without a type', () => {
    // ARRANGE
    const expected = { topic: 'sweep', task: '1-a' };
    // ACT
    const parsed = topicOfBranch('sweep--1-a');
    // ASSERT
    expect(parsed).toEqual(expected);
  });

  it('refuses an empty slug, an empty task and a nested path', () => {
    // ARRANGE
    const branches = ['feat/--1-a', 'feat/x--', 'feat/a/b', ''];
    // ACT
    const parsed = branches.map(topicOfBranch);
    // ASSERT
    expect(parsed).toEqual([null, null, null, null]);
  });
});
