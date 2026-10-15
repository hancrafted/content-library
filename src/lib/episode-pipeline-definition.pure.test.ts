import { describe, expect, it } from 'vitest';
import { parsePipeline, readPipeline } from './episode-pipeline-definition.pure';

/*
 * The one Pipeline definition reader: a new-episode pipeline parsed once into its status, stages and jobs, the view
 * the schema check, the dashboard, the research-jobs check and the status script share.
 */

const PIPELINE = `status: approved
jobs:
  - id: write-brief
    needs: []
    outputs: [docs/episodes/<slug>/brief.md]
    checks: [mh, vitest]
    gate: human
  - id: write-research-1
    needs: [write-brief]
    wants: [write-brief]
    outputs: []
`;

describe('success cases', () => {
  it('reads the status and each job with its needs, wants, outputs, checks and gate', () => {
    // ARRANGE
    const expected = {
      status: 'approved',
      stages: [],
      jobs: [
        {
          id: 'write-brief',
          needs: [],
          wants: [],
          outputs: ['docs/episodes/<slug>/brief.md'],
          checks: ['mh', 'vitest'],
          gate: true,
          retries: 0,
          agents: [],
        },
        {
          id: 'write-research-1',
          needs: ['write-brief'],
          wants: ['write-brief'],
          outputs: [],
          checks: [],
          gate: false,
          retries: 0,
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
        { type: 'implementor', agent: 'general-purpose', skills: ['tdd', 'commit'], session: 'orchestrator' },
        { type: 'reviewer', agent: 'general-purpose', skills: ['code-review'] },
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

  it("reads a build job's dev-server port", () => {
    // ARRANGE
    const yaml = 'jobs:\n  - { id: implement-section-why, stage: build, needs: [], port: 4001 }\n';
    const expected = 4001;
    // ACT
    const port = readPipeline(yaml)?.jobs[0].port;
    // ASSERT
    expect(port).toBe(expected);
  });

  it("reads a job's retry limit, its foreach template and the agent definition each agent runs as", () => {
    // ARRANGE
    const yaml = `jobs:
  - id: write-research
    needs: []
    retries: 2
    foreach: docs/episodes/<slug>/brief.md#Research
    agents:
      - { type: implementor, agent: archgate:developer, skills: [tdd] }
`;
    const expected = {
      retries: 2,
      foreach: 'docs/episodes/<slug>/brief.md#Research',
      agents: [{ type: 'implementor', agent: 'archgate:developer', skills: ['tdd'] }],
    };
    // ACT
    const job = readPipeline(yaml)?.jobs[0];
    // ASSERT
    expect({ retries: job?.retries, foreach: job?.foreach, agents: job?.agents }).toEqual(expected);
  });

  it('parses the text once into the raw document and the typed pipeline beside it', () => {
    // ARRANGE
    const yaml = 'status: draft\nstages: [brief]\njobs:\n  - { id: a, stage: brief, needs: [] }\n';
    const expected = {
      document: { status: 'draft', stages: ['brief'], jobs: [{ id: 'a', stage: 'brief', needs: [] }] },
      pipeline: {
        status: 'draft',
        stages: ['brief'],
        jobs: [
          {
            id: 'a',
            stage: 'brief',
            needs: [],
            wants: [],
            outputs: [],
            checks: [],
            gate: false,
            retries: 0,
            agents: [],
          },
        ],
      },
    };
    // ACT
    const parsed = parsePipeline(yaml);
    // ASSERT
    expect(parsed).toEqual(expected);
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

  it("answers the parser's complaint for text that is not YAML, and no pipeline for a document without a job list", () => {
    // ARRANGE
    const texts = ['jobs: [unclosed', '- just a list'];
    const expected = [
      { error: expect.stringMatching(/^The pipeline is not valid YAML: /) },
      { document: ['just a list'], pipeline: null },
    ];
    // ACT
    const parsed = texts.map(parsePipeline);
    // ASSERT
    expect(parsed).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('reads a status of any shape as null unless it is text, and skips a job that is not a mapping', () => {
    // ARRANGE
    const yaml = 'status: [approved]\njobs:\n  - just-a-name\n  - id: a\n    needs: [b, 1]\n';
    const expected = {
      status: null,
      stages: [],
      jobs: [{ id: 'a', needs: [], wants: [], outputs: [], checks: [], gate: false, retries: 0, agents: [] }],
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

  it('reads a port that is not a whole number as no port', () => {
    // ARRANGE
    const yaml = "jobs:\n  - { id: a, needs: [], port: '4001' }\n  - { id: b, needs: [], port: 4001.5 }\n";
    const expected = [false, false];
    // ACT
    const ported = readPipeline(yaml)?.jobs.map((job) => Object.hasOwn(job, 'port'));
    // ASSERT
    expect(ported).toEqual(expected);
  });
});
