import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseDashboardPipeline, projectDashboard, type DashboardJob } from './dashboard-projection.pure';
import { agentState, jobNeedsAttention, projectStages, stageLayers } from './dashboard-stages.pure';
import { createLogFold, parseLog } from './run-log.pure';
import type { Score } from './run-log.schema.pure';

function fixtureView() {
  const fixture = (name: string) =>
    readFileSync(new URL(`../../../tests/fixtures/pipeline-dashboard/${name}`, import.meta.url), 'utf8');
  const log = createLogFold({ live: 'unfinished' });
  log.append(parseLog(fixture('events.jsonl')).lines);
  return projectDashboard(parseDashboardPipeline(fixture('pipeline.yml')), log.snapshot());
}

/** A running Job with two Attempts, the later one `a2`, and the rubric Scores given. */
function reviewedJob(scores: Pick<Score, 'span_id' | 'value'>[]): DashboardJob {
  const base = fixtureView().jobs[0];
  const attempt = { ...base.span!, type: 'attempt' as const, status: 'ok' as const };
  return {
    ...base,
    state: 'running',
    attempts: [
      { ...attempt, span_id: 'a1', seq: 1 },
      { ...attempt, span_id: 'a2', seq: 2 },
    ],
    scores: scores.map((score, at) => ({
      trace_id: 't',
      t: '2026-10-15T00:00:00Z',
      seq: at + 3,
      name: 'rubric',
      source: 'agent:x/reviewer',
      ...score,
    })),
  };
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
});

describe('edge cases', () => {
  it("marks a Job whose latest Attempt has a needs-human Score, but not for an earlier Attempt's", () => {
    // ARRANGE
    const latest = reviewedJob([{ span_id: 'a2', value: 'needs-human' }]);
    const earlier = reviewedJob([{ span_id: 'a1', value: 'needs-human' }]);
    const failedOnly = reviewedJob([{ span_id: 'a2', value: 'fail' }]);
    const expected = [true, false, false];
    // ACT
    const marked = [latest, earlier, failedOnly].map(jobNeedsAttention);
    // ASSERT
    expect(marked).toEqual(expected);
  });

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
  it('marks a Job waiting on a gate or ended error, refused or crashed, and not one running or done', () => {
    // ARRANGE
    const states = ['gate', 'error', 'refused', 'crashed', 'running', 'ok', 'reused', 'waiting'] as const;
    const expected = [true, true, true, true, false, false, false, false];
    // ACT
    const marked = states.map((state) => jobNeedsAttention({ ...reviewedJob([]), state }));
    // ASSERT
    expect(marked).toEqual(expected);
  });

  it('shows a missing agent end as unclosed once its Job has closed, leaving the raw span as folded', () => {
    // ARRANGE
    const base = fixtureView().jobs[0];
    const agent = { ...base.agents[0], status: 'running' as const, end_t: null };
    const closed = { ...base, agents: [agent] };
    const expectedMissingEnd = 'unclosed';
    const expectedRawState = 'running';
    // ACT
    const displayState = agentState(closed, agent);
    // ASSERT
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
