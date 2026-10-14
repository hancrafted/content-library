import { describe, expect, it } from 'vitest';
import { readPipeline } from './episode-pipeline-jobs.pure';

/*
 * A new-episode pipeline read into its status and jobs: the one view of a job the schema check, the research-jobs
 * check and the status script share.
 */

const PIPELINE = `status: approved
jobs:
  - id: write-brief
    needs: []
    outputs: [docs/episodes/<slug>/brief.md]
    gate: human
  - id: write-research-1
    needs: [write-brief]
    wants: [write-brief]
    outputs: []
`;

describe('success cases', () => {
  it('reads the status and each job with its needs, wants, outputs and gate', () => {
    // ARRANGE
    const expected = {
      status: 'approved',
      stages: [],
      jobs: [
        { id: 'write-brief', needs: [], wants: [], outputs: ['docs/episodes/<slug>/brief.md'], gate: true, agents: [] },
        {
          id: 'write-research-1',
          needs: ['write-brief'],
          wants: ['write-brief'],
          outputs: [],
          gate: false,
          agents: [],
        },
      ],
    };
    // ACT
    const pipeline = readPipeline(PIPELINE);
    // ASSERT
    expect(pipeline).toEqual(expected);
  });

  it('reads each agent with its skills and its session; a job runs in the orchestrator when an agent does', () => {
    // ARRANGE
    const yaml = `jobs:
  - id: build
    needs: []
    agents:
      - { type: implementor, skills: [tdd, commit], session: orchestrator }
      - { type: reviewer, skills: [code-review] }
`;
    const expected = {
      session: 'orchestrator',
      agents: [
        { type: 'implementor', skills: ['tdd', 'commit'], session: 'orchestrator' },
        { type: 'reviewer', skills: ['code-review'] },
      ],
    };
    // ACT
    const job = readPipeline(yaml)?.jobs[0];
    // ASSERT
    expect({ session: job?.session, agents: job?.agents }).toEqual(expected);
  });

  it('reads the ordered stage list and the stage each job names', () => {
    // ARRANGE
    const yaml = `stages: [brief, setup]
jobs:
  - { id: brief-grill, stage: brief, needs: [] }
  - { id: retrieval, stage: setup, needs: [brief-grill] }
`;
    const expected = { stages: ['brief', 'setup'], jobStages: ['brief', 'setup'] };
    // ACT
    const pipeline = readPipeline(yaml);
    // ASSERT
    expect({ stages: pipeline?.stages, jobStages: pipeline?.jobs.map((job) => job.stage) }).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('answers null for text that is not YAML, not a mapping, or has no job list', () => {
    // ARRANGE
    const texts = ['jobs: [unclosed', '- just a list', 'status: draft\n'];
    const expected = [null, null, null];
    // ACT
    const pipelines = texts.map(readPipeline);
    // ASSERT
    expect(pipelines).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('reads a status of any shape as null unless it is text, and skips a job that is not a mapping', () => {
    // ARRANGE
    const yaml = 'status: [approved]\njobs:\n  - just-a-name\n  - id: a\n    needs: [b, 1]\n';
    const expected = {
      status: null,
      stages: [],
      jobs: [{ id: 'a', needs: [], wants: [], outputs: [], gate: false, agents: [] }],
    };
    // ACT
    const pipeline = readPipeline(yaml);
    // ASSERT
    expect(pipeline).toEqual(expected);
  });

  it('reads a pipeline without stages as an empty stage list and jobs without a stage', () => {
    // ARRANGE
    const yaml = 'stages: brief\njobs:\n  - { id: a, needs: [], stage: [brief] }\n';
    const expected = { stages: [], hasStage: false };
    // ACT
    const pipeline = readPipeline(yaml);
    // ASSERT
    expect({ stages: pipeline?.stages, hasStage: Object.hasOwn(pipeline?.jobs[0] ?? {}, 'stage') }).toEqual(expected);
  });
});
