import { describe, expect, it } from 'vitest';
import type { Job } from './episode-pipeline-jobs.pure';
import { checkStages } from './episode-pipeline-stages.pure';

/*
 * The stage check on hand-built jobs: the ordered stage list a pipeline declares, and the stage each job names.
 */

const STAGES = ['brief', 'setup', 'research'];

function job(id: string, stage: string | undefined, edges: { needs?: string[]; wants?: string[] } = {}): Job {
  return {
    id,
    ...(stage !== undefined && { stage }),
    needs: edges.needs ?? [],
    wants: edges.wants ?? [],
    outputs: [],
    checks: [],
    gate: false,
    agents: [],
  };
}

describe('success cases', () => {
  it('finds nothing when every job waits only for jobs of its own or an earlier stage', () => {
    // ARRANGE
    const jobs = [
      job('brief-grill', 'brief'),
      job('scaffold-pipeline', 'setup', { needs: ['brief-grill'] }),
      job('retrieval', 'setup', { needs: ['scaffold-pipeline'] }),
      job('write-research-a', 'research', { needs: ['retrieval'], wants: ['brief-grill'] }),
    ];
    const expected: string[] = [];
    // ACT
    const findings = checkStages(STAGES, jobs);
    // ASSERT
    expect(findings).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('names a stage listed twice once, however often it repeats', () => {
    // ARRANGE
    const stages = ['brief', 'setup', 'brief', 'brief'];
    const expected = ['The stage "brief" appears twice in stages; stage ids are unique.'];
    // ACT
    const findings = checkStages(stages, [job('brief-grill', 'brief')]);
    // ASSERT
    expect(findings).toEqual(expected);
  });

  it('names a job whose stage the list does not hold', () => {
    // ARRANGE
    const jobs = [job('open-pr', 'pr')];
    const expected = ['Job "open-pr" has stage "pr", which stages does not list.'];
    // ACT
    const findings = checkStages(STAGES, jobs);
    // ASSERT
    expect(findings).toEqual(expected);
  });

  it('names a job that needs or wants a job of a later stage', () => {
    // ARRANGE
    const jobs = [
      job('brief-grill', 'brief', { needs: ['retrieval'], wants: ['write-research-a'] }),
      job('retrieval', 'setup'),
      job('write-research-a', 'research'),
    ];
    const rule = 'a job waits only for jobs of its own or an earlier stage.';
    const expected = [
      `Job "brief-grill" of stage "brief" needs "retrieval", a job of the later stage "setup"; ${rule}`,
      `Job "brief-grill" of stage "brief" wants "write-research-a", a job of the later stage "research"; ${rule}`,
    ];
    // ACT
    const findings = checkStages(STAGES, jobs);
    // ASSERT
    expect(findings).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('accepts a stage that holds no job', () => {
    // ARRANGE
    const jobs = [job('brief-grill', 'brief'), job('retrieval', 'setup', { needs: ['brief-grill'] })];
    const expected: string[] = [];
    // ACT
    const findings = checkStages(STAGES, jobs);
    // ASSERT
    expect(findings).toEqual(expected);
  });

  it('leaves a job with no stage, an unknown stage or an unknown edge to the other checks', () => {
    // ARRANGE
    const jobs = [
      job('unstaged', undefined, { needs: ['retrieval'] }),
      job('stray', 'pr', { needs: ['retrieval'] }),
      job('brief-grill', 'brief', { needs: ['missing'] }),
      job('retrieval', 'setup'),
    ];
    const expected = ['Job "stray" has stage "pr", which stages does not list.'];
    // ACT
    const findings = checkStages(STAGES, jobs);
    // ASSERT
    expect(findings).toEqual(expected);
  });
});
