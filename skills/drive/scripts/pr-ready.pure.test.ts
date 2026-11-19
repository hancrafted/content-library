import { describe, expect, it } from 'vitest';
import { readyProblem, topicOf } from './pr-ready.pure.ts';

describe('topicOf', () => {
  it('is the slug of the Integration branch', () => {
    // ARRANGE
    // ACT
    const topics = [topicOf('chore/drive-fortify-sweep'), topicOf('feat/a/b'), topicOf('main')];
    // ASSERT
    expect(topics).toEqual(['drive-fortify-sweep', 'a/b', null]);
  });
});

describe('readyProblem', () => {
  it('refuses without review.md and names the file; passes with it', () => {
    // ARRANGE
    // ACT
    const problems = [readyProblem('sweep', false), readyProblem('sweep', true)];
    // ASSERT
    expect(problems[0]).toContain('.scratch/sweep/review.md');
    expect(problems[1]).toBeNull();
  });
});
