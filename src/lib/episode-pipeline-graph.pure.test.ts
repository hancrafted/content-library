import { describe, expect, it } from 'vitest';
import type { Job } from './episode-pipeline-definition.pure';
import { ancestors, concurrentJobs } from './episode-pipeline-graph.pure';

function graph(
  edges: Record<string, string[]>,
  wanted: Record<string, string[]> = {},
): { jobs: Job[]; byId: Map<string, Job> } {
  const jobs = Object.entries(edges).map(([id, needs]): Job => ({
    id,
    needs,
    wants: wanted[id] ?? [],
    checks: [],
    outputs: [],
    gate: false,
    retries: 0,
    agents: [],
  }));
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

  it('waits for a wanted job as for a needed one, and finds the jobs that may run at the same time', () => {
    // ARRANGE
    const { jobs, byId } = graph(
      {
        brief: [],
        retrieval: ['brief'],
        q1: ['retrieval'],
        q2: ['retrieval'],
        retire: ['q1'],
        dossier: ['retrieval'],
        pr: ['dossier', 'retire'],
      },
      { dossier: ['q1', 'q2'] },
    );
    const expectedUpstream = ['brief', 'q1', 'q2', 'retrieval'];
    const expectedConcurrent = ['dossier', 'q1', 'q2', 'retire'];
    // ACT
    const upstream = [...ancestors('dossier', byId)].sort();
    const concurrent = [...concurrentJobs(jobs, byId)].sort();
    // ASSERT
    expect(upstream).toEqual(expectedUpstream);
    expect(concurrent).toEqual(expectedConcurrent);
  });
});

describe('failure cases', () => {
  it('stops collecting ancestors at a cycle, naming each job along it once', () => {
    // ARRANGE
    const { byId } = graph({ a: ['c'], b: ['a'], c: ['b'] });
    const expected = ['a', 'b', 'c'];
    // ACT
    const upstream = [...ancestors('a', byId)].sort();
    // ASSERT
    expect(upstream).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('collects an unknown need without following it, and finds no concurrency in a chain', () => {
    // ARRANGE
    const { jobs, byId } = graph({ a: ['ghost'], b: ['a'] });
    const expected = ['a', 'ghost'];
    // ACT
    const upstream = [...ancestors('b', byId)].sort();
    const concurrent = [...concurrentJobs(jobs, byId)];
    // ASSERT
    expect(upstream).toEqual(expected);
    expect(concurrent).toEqual([]);
  });
});
