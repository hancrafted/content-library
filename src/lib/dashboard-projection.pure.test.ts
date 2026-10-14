import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createLogFold, parseLog } from '../../skills/new-episode/scripts/run-log.pure';
import { parseDashboardPipeline, projectDashboard } from './dashboard-projection.pure';

const fixture = (name: string) =>
  readFileSync(new URL(`../../tests/fixtures/pipeline-dashboard/${name}`, import.meta.url), 'utf8');

describe('success cases', () => {
  it('orders every Job by needs while retaining distinct wants and agent configuration', () => {
    // ARRANGE
    const agent = {
      type: 'implementor',
      agent: 'archgate:developer',
      skills: ['tdd'],
      references: [],
      model: 'opus',
      session: 'orchestrator',
    };
    const base = { needs: [], outputs: [], checks: [], retries: 2, agents: [agent] };
    const text = JSON.stringify({
      status: 'approved',
      jobs: [
        { ...base, id: 'last', needs: ['first'], wants: ['optional'], gate: 'human' },
        { ...base, id: 'first' },
        { ...base, id: 'optional' },
      ],
    });
    const expectedOrder = ['first', 'last', 'optional'];
    const expectedAgent = {
      type: 'implementor',
      agent: 'archgate:developer',
      skills: ['tdd'],
      ticketSkills: [],
      session: 'orchestrator',
    };
    const expectedWants = ['optional'];
    // ACT
    const pipeline = parseDashboardPipeline(text);
    // ASSERT
    expect(pipeline.jobs.map((job) => job.id)).toEqual(expectedOrder);
    expect(pipeline.jobs[1].agents).toEqual([expectedAgent]);
    expect(pipeline.jobs[1].wants).toEqual(expectedWants);
    expect(pipeline.jobs[1].gate).toBe(true);
  });

  it('projects the frozen Run with retries, raw states, rubric evidence and Job-parented agents', () => {
    // ARRANGE
    const pipeline = parseDashboardPipeline(fixture('pipeline.yml'));
    const log = createLogFold({ live: 'unfinished' });
    const expectedRetries = [
      { attempt: 1, status: 'error' },
      { attempt: 2, status: 'ok', retry_of: 'c939224f50aa40d4' },
    ];
    const expectedAgents = 21;
    const expectedJobs = 18;
    const expectedRunning = 5;
    const expectedProblems = 17;
    const expectedFirst = 'brief-grill';
    const expectedDescription = 'Review the Brief';
    const expectedParent = '056c166635f8ab1d';
    // ACT
    const lines = parseLog(fixture('events.jsonl')).lines;
    log.append(lines.map((line) => (line.seq === 6 ? { ...line, description: expectedDescription } : line)));
    const view = projectDashboard(pipeline, log.snapshot());
    const brief = view.jobs[0];
    const agents = view.jobs.flatMap((job) => job.agents);
    // ASSERT
    expect(brief.id).toBe(expectedFirst);
    expect(view.jobs).toHaveLength(expectedJobs);
    expect(brief.attempts).toMatchObject(expectedRetries);
    expect(agents).toHaveLength(expectedAgents);
    expect(brief.agents[0].parent_span_id).toBe(expectedParent);
    expect(brief.agents[0].description).toBe(expectedDescription);
    expect(agents.filter((agent) => agent.status === 'running')).toHaveLength(expectedRunning);
    expect(view.jobs.flatMap((job) => job.scores)).toHaveLength(expectedProblems);
    expect(view.openGates).toEqual([]);
  });

  it("carries the pipeline's stage order, each Job's stage and a template's foreach into the view", () => {
    // ARRANGE
    const agent = { type: 'implementor', skills: [], references: [], model: 'opus' };
    const base = { needs: [], outputs: [], checks: [], retries: 0, agents: [agent] };
    const order = ['brief', 'research'];
    const template = 'docs/episodes/x/brief.md#Research questions';
    const text = JSON.stringify({
      status: 'draft',
      stages: order,
      jobs: [
        { ...base, id: 'brief-grill', stage: 'brief' },
        { ...base, id: 'write-research', stage: 'research', foreach: template },
      ],
    });
    const expectedStages = ['brief', 'research'];
    // ACT
    const view = projectDashboard(parseDashboardPipeline(text), { spans: [], scores: [], orphans: [] });
    // ASSERT
    expect(view.stages).toEqual(order);
    expect(view.jobs.map((job) => job.stage)).toEqual(expectedStages);
    expect(view.jobs[1].foreach).toBe(template);
    expect(view.jobs[0].foreach).toBeUndefined();
  });
});

describe('failure cases', () => {
  it.each([
    'jobs: [null]',
    'status: approved\njobs: [{id: write, needs: missing}]',
    'status: approved\njobs: [{id: write, needs: [], outputs: [], checks: [], retries: 0, agents: []}]',
  ])('rejects invalid pipeline configuration visibly: %s', (text) => {
    // ARRANGE
    const expected = /pipeline|Job/;
    // ACT
    const read = () => parseDashboardPipeline(text);
    // ASSERT
    expect(read).toThrow(expected);
  });
});

describe('edge cases', () => {
  it('reads a Run scaffolded before stages existed, with no stage order and no Job stage', () => {
    // ARRANGE
    const text = fixture('pipeline.yml');
    // ACT
    const pipeline = parseDashboardPipeline(text);
    // ASSERT
    expect(pipeline.stages).toEqual([]);
    expect(pipeline.jobs.filter((job) => job.stage !== undefined)).toEqual([]);
  });

  it('shows an open Gate after Job completion, closes it on its end and retains measured agent evidence', () => {
    // ARRANGE
    const pipeline = parseDashboardPipeline(fixture('pipeline.yml'));
    const lines = parseLog(fixture('events.jsonl')).lines;
    const log = createLogFold({ live: 'unfinished' });
    const expectedGate = 'draft brief';
    const expectedOpenState = 'gate';
    const expectedClosedState = 'ok';
    const expectedAgent = {
      duration_ms: 41103,
      'gen_ai.usage.input_tokens': 3132,
      'gen_ai.usage.output_tokens': 3411,
      'gen_ai.usage.cache_read.input_tokens': 169450,
    };
    // ACT
    log.append(lines.slice(0, 50));
    const open = projectDashboard(pipeline, log.snapshot());
    log.append(lines.slice(50, 52));
    const closed = projectDashboard(pipeline, log.snapshot());
    // ASSERT
    expect(open.openGates.map((gate) => gate.name)).toEqual([expectedGate]);
    expect(open.jobs[0].state).toBe(expectedOpenState);
    expect(closed.openGates).toEqual([]);
    expect(closed.jobs[0].state).toBe(expectedClosedState);
    expect(closed.jobs[0].agents[1]).toMatchObject(expectedAgent);
  });
});
