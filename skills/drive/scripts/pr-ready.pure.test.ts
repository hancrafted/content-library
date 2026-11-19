import { describe, expect, it } from 'vitest';
import { notIntegrationBranch, readyProblem, topicOf } from './pr-ready.pure.ts';

describe('topicOf', () => {
  it('is the slug of the Integration branch, and null for anything else', () => {
    // ARRANGE
    const branches = ['chore/drive-fortify-sweep', 'main', 'chore/drive-fortify-sweep--791-ac-gate', 'feat/a/b'];
    const expected = ['drive-fortify-sweep', null, null, null];
    // ACT
    const topics = branches.map(topicOf);
    // ASSERT
    expect(topics).toEqual(expected);
  });
});

describe('notIntegrationBranch', () => {
  it('names the branch and says to use the Integration PR', () => {
    // ARRANGE
    const expected =
      'chore/x--1-a is not an Integration branch (<type>/<slug>); run drive pr ready on the Integration PR, not a Task branch';
    // ACT
    const message = notIntegrationBranch('chore/x--1-a');
    // ASSERT
    expect(message).toBe(expected);
  });
});

describe('readyProblem', () => {
  it('refuses without review.md and names the file; passes with it', () => {
    // ARRANGE
    const expected = [
      '.scratch/sweep/review.md does not exist: run the review (references/review.md) and log its verdicts before marking the PR ready',
      null,
    ];
    // ACT
    const problems = [readyProblem('sweep', false), readyProblem('sweep', true)];
    // ASSERT
    expect(problems).toEqual(expected);
  });
});
