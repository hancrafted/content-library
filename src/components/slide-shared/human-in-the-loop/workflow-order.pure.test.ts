import { describe, expect, it } from 'vitest';
import { job } from './workflow-fixture.pure';
import { orderedJobs } from './workflow-order.pure';

const ids = (jobs: readonly { id: string }[]) => jobs.map((each) => each.id);

describe('success cases', () => {
  it('puts a job after the jobs it needs, though the file lists it first', () => {
    // ARRANGE
    const jobs = [job({ id: 'c', needs: ['b'] }), job({ id: 'b', needs: ['a'] }), job({ id: 'a' })];
    // ACT
    const ordered = orderedJobs(jobs);
    // ASSERT
    expect(ids(ordered)).toEqual(['a', 'b', 'c']);
  });

  it('keeps the file order of jobs that need nothing of each other', () => {
    // ARRANGE
    const jobs = [job({ id: 'x' }), job({ id: 'y' }), job({ id: 'z', needs: ['x'] })];
    // ACT
    const ordered = orderedJobs(jobs);
    // ASSERT
    expect(ids(ordered)).toEqual(['x', 'y', 'z']);
  });
});

describe('failure cases', () => {
  it('keeps every job once when needs name a job that is not there', () => {
    // ARRANGE
    const jobs = [job({ id: 'a', needs: ['ghost'] }), job({ id: 'b' })];
    // ACT
    const ordered = orderedJobs(jobs);
    // ASSERT
    expect(ids(ordered)).toEqual(['a', 'b']);
  });

  it('keeps every job once when needs run in a cycle', () => {
    // ARRANGE
    const jobs = [job({ id: 'a', needs: ['b'] }), job({ id: 'b', needs: ['a'] })];
    // ACT
    const ordered = orderedJobs(jobs);
    // ASSERT
    expect(ids(ordered).sort()).toEqual(['a', 'b']);
  });
});

describe('edge cases', () => {
  it('returns no jobs for no jobs', () => {
    // ARRANGE
    // ACT
    const ordered = orderedJobs([]);
    // ASSERT
    expect(ordered).toEqual([]);
  });
});
