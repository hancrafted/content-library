import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createLogFold, parseLog } from '../../skills/new-episode/scripts/run-log.pure';
import { parseDashboardPipeline, projectDashboard, type DashboardJob } from './dashboard-projection.pure';
import { agentState, jobLanes, projectStages, runningAgents, stageLayers } from './dashboard-stages.pure';

function fixtureView() {
  const fixture = (name: string) =>
    readFileSync(new URL(`../../tests/fixtures/pipeline-dashboard/${name}`, import.meta.url), 'utf8');
  const log = createLogFold({ live: 'unfinished' });
  log.append(parseLog(fixture('events.jsonl')).lines);
  return projectDashboard(parseDashboardPipeline(fixture('pipeline.yml')), log.snapshot());
}

describe('success cases', () => {
  it('collapses the real research fan-out into seven stages without dropping Jobs', () => {
    // ARRANGE
    const view = fixtureView();
    const expectedStages = ['brief', 'setup', 'research', 'dossier', 'specification', 'build', 'pr'];
    const expectedResearchJobs = 9;
    // ACT
    const graph = projectStages(view.jobs);
    // ASSERT
    expect(graph.stages.map((stage) => stage.id)).toEqual(expectedStages);
    expect(graph.stages.find((stage) => stage.id === 'research')?.jobs).toHaveLength(expectedResearchJobs);
    expect(
      graph.stages
        .flatMap((stage) => stage.jobs)
        .map((job) => job.id)
        .sort(),
    ).toEqual(view.jobs.map((job) => job.id).sort());
  });

  it('shows concurrent ticket lanes, role retries, and genuinely unidentified sessions', () => {
    // ARRANGE
    const base = fixtureView().jobs[0];
    const agent = base.agents[0];
    const job: DashboardJob = {
      ...base,
      id: 'implement-episode',
      span: { ...base.span!, status: 'running', end_t: null },
      agents: [
        { ...agent, span_id: 'a', job: 'implement-episode', ticket: 174, role: 'implementor', status: 'ok', seq: 1 },
        { ...agent, span_id: 'b', job: 'implement-episode', ticket: 174, role: 'reviewer', status: 'error', seq: 2 },
        { ...agent, span_id: 'c', job: 'implement-episode', ticket: 174, role: 'reviewer', status: 'running', seq: 3 },
        {
          ...agent,
          span_id: 'd',
          job: 'implement-episode',
          description: 'implement-episode#1/implementor/#175',
          status: 'running',
        },
        { ...agent, span_id: 'e', job: 'implement-episode', description: undefined, status: 'running' },
      ],
    };
    const expectedTickets = [174, 175, undefined];
    const expectedStates = ['running', 'running', 'running'];
    const expectedHistory = 3;
    // ACT
    const lanes = jobLanes(job);
    // ASSERT
    expect(lanes.map((lane) => lane.ticket)).toEqual(expectedTickets);
    expect(lanes.map((lane) => lane.state)).toEqual(expectedStates);
    expect(lanes[0].agents).toHaveLength(expectedHistory);
  });

  it('places dependency roots before the parallel research lanes', () => {
    // ARRANGE
    const graph = projectStages(fixtureView().jobs);
    const research = graph.stages.find((stage) => stage.id === 'research')!;
    const expectedRoot = ['retrieval'];
    const expectedParallelJobs = 8;
    // ACT
    const layers = stageLayers(research);
    // ASSERT
    expect(layers[0].map((job) => job.id)).toEqual(expectedRoot);
    expect(layers[1]).toHaveLength(expectedParallelJobs);
  });
});

describe('edge cases', () => {
  it('keeps an unfamiliar Job visible and does not invent progress for an empty pipeline', () => {
    // ARRANGE
    const base = fixtureView().jobs[0];
    const custom = 'publish-recording';
    // ACT
    const graph = projectStages([{ ...base, id: custom, state: 'waiting' }]);
    const empty = projectStages([]);
    // ASSERT
    expect(graph.stages[0].id).toBe(custom);
    expect(graph.completed).toBe(0);
    expect(empty.completed).toBe(0);
    expect(empty.stages).toEqual([]);
  });
});

describe('failure cases', () => {
  it('does not report missing agent ends as activity after a Job or Attempt has closed', () => {
    // ARRANGE
    const base = fixtureView().jobs[0];
    const agent = { ...base.agents[0], status: 'running' as const, end_t: null };
    const closed = { ...base, agents: [agent] };
    const open = {
      ...base,
      span: { ...base.span!, status: 'running' as const, end_t: null },
      agents: [
        { ...agent, span_id: 'old', parent_span_id: base.attempts[0].span_id },
        { ...agent, span_id: 'current', parent_span_id: base.span!.span_id },
      ],
    };
    const expectedActive = ['current'];
    const expectedMissingEnd = 'unclosed';
    const expectedRawState = 'running';
    // ACT
    const closedActivity = runningAgents(closed);
    const openActivity = runningAgents(open);
    const displayState = agentState(closed, agent);
    // ASSERT
    expect(closedActivity).toEqual([]);
    expect(openActivity.map((span) => span.span_id)).toEqual(expectedActive);
    expect(displayState).toBe(expectedMissingEnd);
    expect(agent.status).toBe(expectedRawState);
  });

  it('keeps Gates and failures visible when later work has started', () => {
    // ARRANGE
    const base = fixtureView().jobs[0];
    const jobs: DashboardJob[] = [
      { ...base, id: 'brief-grill', state: 'ok' },
      { ...base, id: 'customize-pipeline', state: 'gate' },
      { ...base, id: 'write-research-one', state: 'error' },
      { ...base, id: 'write-research-two', state: 'running' },
      { ...base, id: 'write-dossier', state: 'running' },
    ];
    const expectedStates = ['ok', 'gate', 'running', 'running'];
    const expectedAttention = 2;
    const researchStageIndex = 2;
    // ACT
    const graph = projectStages(jobs);
    // ASSERT
    expect(graph.stages.map((stage) => stage.state)).toEqual(expectedStates);
    expect(graph.completed).toBe(1);
    expect(graph.attention).toBe(expectedAttention);
    expect(graph.stages[researchStageIndex].attention).toBe(1);
  });
});
