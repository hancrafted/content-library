import { describe, expect, it } from 'vitest';
import { job as baseJob, stage } from './workflow-fixture.pure';
import { jobById, jobsOf } from './workflow-jobs.pure';
import type { Job, Stage } from './workflow.types';

const job = (id: string): Job => baseJob({ id, title: id });
const stages: Stage[] = [stage('s1', [job('a')]), stage('s2', [job('b'), job('c')])];

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
