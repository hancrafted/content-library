import { describe, expect, it } from 'vitest';
import { jobById, jobsOf } from './workflow-jobs.pure';
import type { Job, Stage } from './workflow.types';

const job = (id: string): Job => ({
  id,
  title: id,
  description: 'D',
  chat: 'new',
  dependsOn: [],
  inputs: [],
  outputs: [],
  skills: [],
  run: { todo: 'Do.', prompt: 'P' },
});
const stages: Stage[] = [
  { id: 's1', name: 'One', moves: [], jobs: [job('a')] },
  { id: 's2', name: 'Two', moves: [], jobs: [job('b'), job('c')] },
];

describe('success cases', () => {
  it('lists every job in drawing order and finds one by id', () => {
    // ARRANGE
    const expected = ['a', 'b', 'c'];
    // ACT
    const ids = jobsOf(stages).map((each) => each.id);
    // ASSERT
    expect(ids).toEqual(expected);
    expect(jobById(stages, 'c')?.id).toBe('c');
  });
});

describe('failure cases', () => {
  it('finds nothing for an unknown id', () => {
    // ARRANGE
    const unknown = 'ghost';
    // ACT
    const found = jobById(stages, unknown);
    // ASSERT
    expect(found).toBeUndefined();
  });
});

describe('edge cases', () => {
  it('finds nothing for no id, and lists nothing for no stages', () => {
    // ARRANGE
    const none: Stage[] = [];
    // ACT
    const results = [jobById(stages, null), jobById(stages, undefined), jobsOf(none)];
    // ASSERT
    expect(results).toEqual([undefined, undefined, []]);
  });
});
