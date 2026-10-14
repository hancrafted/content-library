import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createLogFold, parseLog } from '../../skills/new-episode/scripts/run-log.pure';
import { parseDashboardPipeline, projectDashboard, type DashboardJob } from './dashboard-projection.pure';
import {
  agentState,
  jobLabel,
  jobLanes,
  projectStages,
  runningAgents,
  stageLayers,
  stageTitle,
} from './dashboard-stages.pure';

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
    const expectedResearchJobs = 7;
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

  it('orders sequential Setup Jobs and stacks the parallel research lanes in one layer', () => {
    // ARRANGE
    const graph = projectStages(fixtureView().jobs);
    const setup = graph.stages.find((stage) => stage.id === 'setup')!;
    const research = graph.stages.find((stage) => stage.id === 'research')!;
    const expectedSetup = [['categorize-research'], ['customize-pipeline'], ['retrieval'], ['convert-references']];
    const expectedParallelJobs = 7;
    // ACT
    const setupLayers = stageLayers(setup);
    const researchLayers = stageLayers(research);
    // ASSERT
    expect(setupLayers.map((layer) => layer.map((job) => job.id))).toEqual(expectedSetup);
    expect(researchLayers).toHaveLength(1);
    expect(researchLayers[0]).toHaveLength(expectedParallelJobs);
  });

  it("groups Jobs by their own stage in the pipeline's stage order", () => {
    // ARRANGE
    const base = fixtureView().jobs[0];
    const jobs: DashboardJob[] = [
      { ...base, id: 'retrieval', stage: 'setup', state: 'ok' },
      { ...base, id: 'brief-grill', stage: 'brief', state: 'ok' },
      { ...base, id: 'implement-section-hook', stage: 'build', state: 'running' },
      { ...base, id: 'scaffold-pipeline', stage: 'setup', state: 'ok' },
    ];
    const order = ['brief', 'setup', 'build'];
    const expectedSetup = ['retrieval', 'scaffold-pipeline'];
    const expectedCompleted = 2;
    // ACT
    const graph = projectStages(jobs, order);
    // ASSERT
    expect(graph.stages.map((stage) => stage.id)).toEqual(order);
    expect(graph.stages[1].jobs.map((job) => job.id)).toEqual(expectedSetup);
    expect(graph.completed).toBe(expectedCompleted);
  });

  it('shows a listed stage without Jobs as not planned yet', () => {
    // ARRANGE
    const base = fixtureView().jobs[0];
    const jobs: DashboardJob[] = [{ ...base, id: 'brief-grill', stage: 'brief', state: 'ok' }];
    const order = ['brief', 'research', 'pr'];
    const expectedPlanned = [true, false, false];
    const expectedStates = ['ok', 'waiting', 'waiting'];
    // ACT
    const graph = projectStages(jobs, order);
    // ASSERT
    expect(graph.stages.map((stage) => stage.planned)).toEqual(expectedPlanned);
    expect(graph.stages.map((stage) => stage.state)).toEqual(expectedStates);
    expect(graph.stages[1].jobs).toEqual([]);
    expect(graph.completed).toBe(1);
  });

  it('labels a fan-out Job by what follows its template prefix', () => {
    // ARRANGE
    const ids = ['write-research-revenue-lags-costs-in-startups', 'implement-section-the-hook'];
    const expectedLabels = ['revenue lags costs in startups', 'the hook'];
    // ACT
    const labels = ids.map(jobLabel);
    // ASSERT
    expect(labels).toEqual(expectedLabels);
  });

  it('names known stages and title-cases an unknown id', () => {
    // ARRANGE
    const ids = ['pr', 'publish-recording'];
    const expectedTitles = ['PR', 'Publish Recording'];
    // ACT
    const titles = ids.map(stageTitle);
    // ASSERT
    expect(titles).toEqual(expectedTitles);
  });
});

describe('edge cases', () => {
  it('counts an unexpanded foreach template as a placeholder, not as planned work', () => {
    // ARRANGE
    const base = fixtureView().jobs[0];
    const jobs: DashboardJob[] = [
      {
        ...base,
        id: 'write-research',
        stage: 'research',
        foreach: 'docs/brief.md#Research questions',
        state: 'waiting',
      },
    ];
    const order = ['research'];
    // ACT
    const graph = projectStages(jobs, order);
    // ASSERT
    expect(graph.stages[0].planned).toBe(false);
    expect(graph.stages[0].jobs).toHaveLength(1);
  });

  it('keeps a Job whose stage is not listed visible after the listed stages', () => {
    // ARRANGE
    const base = fixtureView().jobs[0];
    const jobs: DashboardJob[] = [
      { ...base, id: 'publish', stage: 'publish', state: 'waiting' },
      { ...base, id: 'brief-grill', stage: 'brief', state: 'ok' },
    ];
    const order = ['brief'];
    const expectedStages = ['brief', 'publish'];
    // ACT
    const graph = projectStages(jobs, order);
    // ASSERT
    expect(graph.stages.map((stage) => stage.id)).toEqual(expectedStages);
  });

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
  it('keeps the full id of a Job that is no fan-out, or is the bare template', () => {
    // ARRANGE
    const ids = ['write-dossier', 'write-research', 'write-research-', 'implement-episode-init'];
    const expectedLabels = ['write-dossier', 'write-research', 'write-research-', 'implement-episode-init'];
    // ACT
    const labels = ids.map(jobLabel);
    // ASSERT
    expect(labels).toEqual(expectedLabels);
  });

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
