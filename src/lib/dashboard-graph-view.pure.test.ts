import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createLogFold, parseLog } from '../../skills/new-episode/scripts/run-log.pure';
import { graphView } from './dashboard-graph-view.pure';
import { parseDashboardPipeline, projectDashboard, type DashboardJob } from './dashboard-projection.pure';

const labels = { stageNames: { pr: 'Pull request' }, gate: 'Waiting on Han', complete: 'Complete' };

function fixtureJob(): DashboardJob {
  const fixture = (name: string) =>
    readFileSync(new URL(`../../tests/fixtures/pipeline-dashboard/${name}`, import.meta.url), 'utf8');
  const log = createLogFold({ live: 'unfinished' });
  log.append(parseLog(fixture('events.jsonl')).lines);
  return projectDashboard(parseDashboardPipeline(fixture('pipeline.yml')), log.snapshot()).jobs[0];
}

/** A Job of the given stage and state with no observed spans or configured agents. */
function job(id: string, stage: string, state: DashboardJob['state']): DashboardJob {
  return {
    ...fixtureJob(),
    id,
    stage,
    state,
    needs: [],
    wants: [],
    config: [],
    span: undefined,
    attempts: [],
    agents: [],
    gates: [],
    scores: [],
  };
}

describe('success cases', () => {
  it('names each stage, words its state and points at the next waiting stage', () => {
    // ARRANGE
    const jobs = [job('brief-grill', 'brief', 'ok'), job('write-spec', 'specification', 'gate')];
    const stages = ['brief', 'specification', 'pr', 'publish-recording'];
    const expectedLabels = ['Brief', 'Specification', 'Pull request', 'Publish Recording'];
    const expectedStates = ['Complete', 'Waiting on Han', 'waiting', 'waiting'];
    const expectedNext = 'Pull request';
    const expectedTotal = 4;
    // ACT
    const graph = graphView({ jobs, stages }, labels, null);
    // ASSERT
    expect(graph.stages.map((stage) => stage.label)).toEqual(expectedLabels);
    expect(graph.stages.map((stage) => stage.stateLabel)).toEqual(expectedStates);
    expect(graph.next?.label).toBe(expectedNext);
    expect(graph.completed).toBe(1);
    expect(graph.total).toBe(expectedTotal);
    expect(graph.attention).toBe(1);
  });

  it('marks the selected stage and Job and titles the drawer by the Job, else by the stage', () => {
    // ARRANGE
    const jobs = [job('write-spec', 'specification', 'ok'), job('write-design-spec', 'specification', 'ok')];
    const stages = ['brief', 'specification'];
    const expectedStages = [false, true];
    const expectedJobs = [false, true];
    const expectedJobTitle = 'write-design-spec';
    const expectedStageTitle = 'Specification';
    // ACT
    const onJob = graphView({ jobs, stages }, labels, { stage: 'specification', job: 'write-design-spec' });
    const onStage = graphView({ jobs, stages }, labels, { stage: 'specification' });
    // ASSERT
    expect(onJob.stages.map((stage) => stage.selected)).toEqual(expectedStages);
    expect(onJob.stages[1].nodes.map((node) => node.selected)).toEqual(expectedJobs);
    expect(onJob.selection?.job?.id).toBe(expectedJobTitle);
    expect(onJob.selection?.title).toBe(expectedJobTitle);
    expect(onStage.selection?.job).toBeUndefined();
    expect(onStage.selection?.title).toBe(expectedStageTitle);
  });
  it('names the active Jobs of a stage and counts its running sessions', () => {
    // ARRANGE
    const base = fixtureJob();
    const span = { ...base.span!, status: 'running' as const, end_t: null };
    const running = {
      ...base.agents[0],
      status: 'running' as const,
      end_t: null,
      trace_id: span.trace_id,
      parent_span_id: span.span_id,
    };
    const jobs = [
      job('categorize-research', 'setup', 'gate'),
      {
        ...job('retrieval', 'setup', 'running'),
        span,
        agents: [
          { ...running, span_id: 'r1' },
          { ...running, span_id: 'r2' },
        ],
      },
      job('convert-references', 'setup', 'ok'),
    ];
    const expectedActive = ['categorize-research', 'retrieval'];
    const expectedSessions = 2;
    // ACT
    const stage = graphView({ jobs, stages: ['setup'] }, labels, null).stages[0];
    // ASSERT
    expect(stage.active).toEqual(expectedActive);
    expect(stage.sessions).toBe(expectedSessions);
    expect(stage.complete).toBe(false);
  });

  it('marks the Jobs that need Han, labels a fan-out by its heading, and lists the observed tickets', () => {
    // ARRANGE
    const base = fixtureJob();
    const span = { ...base.span!, status: 'running' as const, end_t: null };
    const agent = { ...base.agents[0], job: 'implement-episode', trace_id: span.trace_id };
    const jobs = [
      { ...job('write-research', 'research', 'waiting'), foreach: 'docs/brief.md#Research questions' },
      {
        ...job('implement-episode', 'research', 'error'),
        span,
        agents: [
          { ...agent, span_id: 'a', ticket: 174, role: 'implementor' },
          { ...agent, span_id: 'b', ticket: 174, role: 'reviewer' },
          { ...agent, span_id: 'c', description: 'implement-episode#1/implementor/#175' },
          { ...agent, span_id: 'd', description: undefined },
          { ...agent, span_id: 'e', ticket: 176, trace_id: 'earlier-run' },
        ],
      },
    ];
    const expectedAttention = [false, true];
    const expectedFanOut = ['Research questions', undefined];
    const expectedTickets = [[], [174, 175]];
    // ACT
    const nodes = graphView({ jobs, stages: ['research'] }, labels, null).stages[0].nodes;
    // ASSERT
    expect(nodes.map((node) => node.attention)).toEqual(expectedAttention);
    expect(nodes.map((node) => node.fanOut)).toEqual(expectedFanOut);
    expect(nodes.map((node) => node.tickets)).toEqual(expectedTickets);
  });
});

describe('failure cases', () => {
  it('opens nothing for a selected stage the graph does not show, and the stage for a Job it does not hold', () => {
    // ARRANGE
    const jobs = [job('write-spec', 'specification', 'ok')];
    const stages = ['specification'];
    const expectedTitle = 'Specification';
    // ACT
    const missingStage = graphView({ jobs, stages }, labels, { stage: 'publish' });
    const missingJob = graphView({ jobs, stages }, labels, { stage: 'specification', job: 'gone' });
    // ASSERT
    expect(missingStage.selection).toBeUndefined();
    expect(missingStage.stages[0].selected).toBe(false);
    expect(missingJob.selection?.job).toBeUndefined();
    expect(missingJob.selection?.title).toBe(expectedTitle);
  });

  it('counts no session as running once its Job or Attempt has closed', () => {
    // ARRANGE
    const base = fixtureJob();
    const open = { ...base.span!, status: 'running' as const, end_t: null };
    const agent = { ...base.agents[0], status: 'running' as const, end_t: null, trace_id: open.trace_id };
    const closedAttempt = { ...base.span!, type: 'attempt' as const, span_id: 'closed-attempt' };
    const jobs = [
      { ...job('write-spec', 'specification', 'ok'), span: base.span, agents: [agent] },
      {
        ...job('write-design-spec', 'specification', 'running'),
        span: open,
        attempts: [closedAttempt],
        agents: [
          { ...agent, span_id: 'old', parent_span_id: closedAttempt.span_id },
          { ...agent, span_id: 'current', parent_span_id: open.span_id },
        ],
      },
    ];
    const expectedActive = ['write-design-spec'];
    // ACT
    const stage = graphView({ jobs, stages: ['specification'] }, labels, null).stages[0];
    // ASSERT
    expect(stage.active).toEqual(expectedActive);
    expect(stage.sessions).toBe(1);
  });
});

describe('edge cases', () => {
  it("draws a configured agent only from the current Run and latest Attempt, else waiting or the orchestrator's Job span", () => {
    // ARRANGE
    const base = fixtureJob();
    const span = { ...base.span!, status: 'running' as const, end_t: null };
    const attempt = { ...span, type: 'attempt' as const, status: 'ok' as const };
    const agent = { ...base.agents[0], description: undefined, status: 'ok' as const };
    const attempts = [
      { ...attempt, span_id: 'a1', seq: 1 },
      { ...attempt, span_id: 'a2', seq: 2 },
    ];
    const agents = [
      { ...agent, role: 'reviewer', span_id: 'old-run', trace_id: 'other', parent_span_id: 'a2' },
      { ...agent, role: 'reviewer', span_id: 'old-attempt', trace_id: span.trace_id, parent_span_id: 'a1' },
      { ...agent, role: 'implementor', span_id: 'current', trace_id: span.trace_id, parent_span_id: 'a2' },
    ];
    const config = [
      { type: 'implementor', agent: 'general-purpose', skills: [] },
      { type: 'reviewer', agent: 'general-purpose', skills: [] },
      { type: 'grill', agent: 'general-purpose', skills: [], session: 'orchestrator' as const },
    ];
    const jobs = [{ ...job('write-spec', 'specification', 'running'), span, attempts, agents, config }];
    const expected = [
      { id: 'write-spec:0', role: 'implementor', label: 'write-spec · implementor', state: 'ok', span: 'current' },
      { id: 'write-spec:1', role: 'reviewer', label: 'write-spec · reviewer', state: 'waiting', span: undefined },
      { id: 'write-spec:2', role: 'grill', label: 'write-spec · grill', state: 'running', span: span.span_id },
    ];
    // ACT
    const nodes = graphView({ jobs, stages: ['specification'] }, labels, null).stages[0].nodes[0].agents;
    // ASSERT
    expect(nodes.map(({ span: drawn, ...node }) => ({ ...node, span: drawn?.span_id }))).toEqual(expected);
  });

  it('draws a Job with no configured agents as one node named by the Job', () => {
    // ARRANGE
    const jobs = [job('open-pr', 'pr', 'gate')];
    const expected = [{ id: 'open-pr:0', role: 'open-pr', label: 'open-pr · open-pr', state: 'gate', span: undefined }];
    // ACT
    const nodes = graphView({ jobs, stages: ['pr'] }, labels, null).stages[0].nodes[0].agents;
    // ASSERT
    expect(nodes).toEqual(expected);
  });
});
