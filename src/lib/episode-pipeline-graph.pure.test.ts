import { describe, expect, it } from 'vitest';
import { ancestors, findCycle, type Job } from './episode-pipeline-graph.pure';

function graph(edges: Record<string, string[]>): { jobs: Job[]; byId: Map<string, Job> } {
  const jobs = Object.entries(edges).map(([id, needs]): Job => ({ id, needs, outputs: [] }));
  return { jobs, byId: new Map(jobs.map((job) => [job.id, job])) };
}

describe('success cases', () => {
  it('collects every job a job needs, directly and through others', () => {
    // ARRANGE
    const { byId } = graph({ a: [], b: ['a'], c: ['b'], d: [] });
    const expected = ['a', 'b'];
    // ACT
    const upstream = [...ancestors('c', byId)].sort();
    // ASSERT
    expect(upstream).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('names the jobs along a cycle, back to where it starts', () => {
    // ARRANGE
    const { jobs, byId } = graph({ a: ['c'], b: ['a'], c: ['b'] });
    const expected = ['a', 'c', 'b', 'a'];
    // ACT
    const cycle = findCycle(jobs, byId);
    // ASSERT
    expect(cycle).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('finds no cycle in a diamond, and stops collecting ancestors at a cycle and at an unknown need', () => {
    // ARRANGE
    const diamond = graph({ a: [], b: ['a'], c: ['a'], d: ['b', 'c'] });
    const looped = graph({ a: ['b', 'ghost'], b: ['a'] });
    const expected = ['a', 'b', 'ghost'];
    // ACT
    const cycle = findCycle(diamond.jobs, diamond.byId);
    const upstream = [...ancestors('a', looped.byId)].sort();
    // ASSERT
    expect(cycle).toBeNull();
    expect(upstream).toEqual(expected);
  });
});
