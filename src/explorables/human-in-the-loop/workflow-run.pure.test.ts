import { describe, expect, it } from 'vitest';
import { TASK } from './workflow-fixture.pure';
import { checkedKey, markerValuesOf, resultKey, resultsOf, runOf } from './workflow-run.pure';
import type { StageDef, TaskDef, WorkflowFile } from './workflow-schema.types';

const PLAN =
  '# Plan\n## Pieces\n### Apartment\nFind one.\n### Hotel\nFind one.\n### Villa\nFind one.\n### Hostel\nFind one.\n';
const EXAMPLE = '# Example\n## Pieces\n### Example one\nText.\n### Example two\nText.\n';

const job = (id: string, over: Partial<TaskDef> = {}): TaskDef => ({
  ...TASK,
  id,
  output: id,
  template: 'plan',
  details: { why: 'W.', example: EXAMPLE, goodLooksLike: ['G.'] },
  ...over,
});

/** Plan hands on `plan`; Research repeats per piece (demo cap 2); Report ends the run with a checkbox. */
const file = (): WorkflowFile => ({
  id: 'demo',
  title: 'Demo',
  scenario: { summary: 'S', facts: ['F'] },
  purposes: { role: 'r', context: 'c', task: 't', steps: 's', template: 'm', scope: 'o' },
  techniques: [],
  reviewer: { sections: [] },
  templates: { plan: '# <T>\n## Pieces\n' },
  stages: [
    { id: 'plan', title: 'Plan', learningGoal: 'G', jobs: [job('plan')] },
    {
      id: 'research',
      title: 'Research',
      learningGoal: 'G',
      foreach: { over: 'plan#pieces', demo: 2 },
      jobs: [job('look'), job('rank')],
    },
    {
      id: 'report',
      title: 'Report',
      learningGoal: 'G',
      jobs: [job('final', { output: undefined, review: undefined })],
    },
  ] satisfies StageDef[],
});

const researchOf = (results: Record<string, string>, demo: boolean) => runOf(file(), { results, demo }).stages[1]!;

describe('success cases', () => {
  it('makes one round per H3 under the named H2 of the pasted result, in document order, in full mode', () => {
    // ARRANGE
    const results = { 'plan.plan': PLAN };
    const numbers = [1, 2, 3, 4];
    // ACT
    const stage = researchOf(results, false);
    // ASSERT
    expect(stage.rounds.map((round) => round.title)).toEqual(['Apartment', 'Hotel', 'Villa', 'Hostel']);
    expect(stage.rounds.map((round) => round.number)).toEqual(numbers);
  });

  it('takes only the first N H3s, in document order, in demo mode', () => {
    // ARRANGE
    const results = { 'plan.plan': PLAN };
    // ACT
    const stage = researchOf(results, true);
    // ASSERT
    expect(stage.rounds.map((round) => round.title)).toEqual(['Apartment', 'Hotel']);
  });

  it('hands a round its item: the H3 heading and the text under it', () => {
    // ARRANGE
    const results = { 'plan.plan': PLAN };
    // ACT
    const [first] = researchOf(results, true).rounds;
    // ASSERT
    expect(first?.item).toBe('### Apartment\nFind one.');
  });

  it('titles the rounds by the example before anything is pasted', () => {
    // ARRANGE
    const results = {};
    // ACT
    const stage = researchOf(results, true);
    // ASSERT
    expect(stage.rounds.map((round) => round.title)).toEqual(['Example one', 'Example two']);
  });

  it('keys a result stage.job and a round stage.job#k', () => {
    // ARRANGE
    const keys = [resultKey('plan', 'plan'), resultKey('research', 'look', 2), checkedKey('research', 'look', 2)];
    // ACT
    const expected = ['plan.plan', 'research.look#2', 'research.look.checked#2'];
    // ASSERT
    expect(keys).toEqual(expected);
  });

  it("says a stage's state is the least advanced state of all its jobs, rounds included", () => {
    // ARRANGE
    const research = { 'research.look#1': 'x', 'research.rank#1': 'x', 'research.look#2': 'x' };
    const finished = { ...research, 'research.rank#2': 'x' };
    // ACT
    const states = [
      researchOf({}, true).state,
      researchOf({ 'plan.plan': PLAN, ...research }, true).state,
      researchOf({ 'plan.plan': PLAN, ...finished }, true).state,
    ];
    // ASSERT
    expect(states).toEqual(['open', 'open', 'done']);
  });

  it('says a job is open, done once its result is pasted and checked once its review is passed', () => {
    // ARRANGE
    const none = runOf(file(), { results: {}, demo: true }).stages[0]!.jobs[0];
    const pasted = runOf(file(), { results: { 'plan.plan': PLAN }, demo: true }).stages[0]!.jobs[0];
    const passed = runOf(file(), {
      results: { 'plan.plan': PLAN, [checkedKey('plan', 'plan')]: 'yes' },
      demo: true,
    }).stages[0]!.jobs[0];
    // ACT
    const states = [none, pasted, passed].map((each) => each?.state);
    // ASSERT
    expect(states).toEqual(['open', 'done', 'checked']);
  });

  it('marks a job without an output done by the checkbox value under its own key', () => {
    // ARRANGE
    const results = { [resultKey('report', 'final')]: 'done' };
    // ACT
    const [last] = runOf(file(), { results, demo: true }).stages[2]!.jobs;
    // ASSERT
    expect(last?.state).toBe('done');
  });

  it('counts the jobs whose result is in, per stage, rounds included', () => {
    // ARRANGE
    const results = {
      'plan.plan': PLAN,
      [resultKey('research', 'look', 1)]: 'a',
      [resultKey('research', 'rank', 1)]: 'b',
      [resultKey('research', 'look', 2)]: 'c',
    };
    // ACT
    const stages = runOf(file(), { results, demo: true }).stages;
    // ASSERT
    expect(stages.map(({ done, total }) => `${done}/${total}`)).toEqual(['1/1', '3/4', '0/1']);
  });

  it('gives a round the state of its least advanced job', () => {
    // ARRANGE
    const results = {
      'plan.plan': PLAN,
      [resultKey('research', 'look', 1)]: 'a',
      [resultKey('research', 'rank', 1)]: 'b',
    };
    // ACT
    const states = researchOf(results, true).rounds.map((round) => round.state);
    // ASSERT
    expect(states).toEqual(['done', 'open']);
  });

  it('reads the one CLI result of a repeated job as done in every round, and its check as checked in every round', () => {
    // ARRANGE
    const pasted = { 'plan.plan': PLAN, [resultKey('research', 'look')]: 'orchestrated' };
    const passed = { ...pasted, [checkedKey('research', 'look')]: 'yes' };
    const rounds = 2;
    // ACT
    const states = (results: Record<string, string>) =>
      researchOf(results, true).rounds.map((round) => round.jobs.find((each) => each.id === 'look')?.state);
    // ASSERT
    expect(states(pasted)).toEqual(['done', 'done']);
    expect(states(passed)).toEqual(['checked', 'checked']);
    expect(researchOf(pasted, true).done).toBe(rounds);
  });

  it('keeps the CLI result of a repeated job under stage.job, whose marker is the bare output', () => {
    // ARRANGE
    const results = { [resultKey('research', 'look')]: 'orchestrated' };
    // ACT
    const markers = markerValuesOf(file(), results);
    const back = resultsOf(file(), markers);
    // ASSERT
    expect(markers).toEqual({ look: 'orchestrated' });
    expect(back).toEqual(results);
  });

  it('lets demo mode change only while nothing is pasted', () => {
    // ARRANGE
    const empty = runOf(file(), { results: { 'plan.plan': '  ' }, demo: true });
    const started = runOf(file(), { results: { 'plan.plan': PLAN }, demo: true });
    // ACT
    const may = [empty.canChangeDemo, started.canChangeDemo];
    // ASSERT
    expect(may).toEqual([true, false]);
  });

  it('shows the results under the marker names the prompts use, and back', () => {
    // ARRANGE
    const results = {
      'plan.plan': PLAN,
      [resultKey('research', 'look', 2)]: 'two',
      [resultKey('report', 'final')]: 'done',
      'research_result#1': 'own',
    };
    // ACT
    const markers = markerValuesOf(file(), results);
    const back = resultsOf(file(), markers);
    // ASSERT
    expect(markers).toEqual({ plan: PLAN, look_2: 'two', 'final.done': 'done', 'research_result#1': 'own' });
    expect(back).toEqual(results);
  });
});

describe('failure cases', () => {
  it('ignores H3s under another H2 and inside a code fence', () => {
    // ARRANGE
    const pasted = '# P\n## Other\n### Not me\n## Pieces\n```\n### Fenced\n```\n### Real\nText.\n## After\n### Late\n';
    // ACT
    const stage = researchOf({ 'plan.plan': pasted }, false);
    // ASSERT
    expect(stage.rounds.map((round) => round.title)).toEqual(['Real']);
  });

  it('falls back to the example when the pasted result holds no H3 under the H2', () => {
    // ARRANGE
    const pasted = '# P\n## Pieces\nOnly prose.\n';
    // ACT
    const stage = researchOf({ 'plan.plan': pasted }, true);
    // ASSERT
    expect(stage.rounds.map((round) => round.title)).toEqual(['Example one', 'Example two']);
  });
});

describe('edge cases', () => {
  it('keeps fewer rounds than the cap when the result has fewer H3s', () => {
    // ARRANGE
    const pasted = '# P\n## Pieces\n### Only\nText.\n';
    // ACT
    const stage = researchOf({ 'plan.plan': pasted }, true);
    // ASSERT
    expect(stage.rounds.map((round) => round.title)).toEqual(['Only']);
  });

  it('has no rounds for a stage that does not repeat', () => {
    // ARRANGE
    const results = { 'plan.plan': PLAN };
    // ACT
    const stage = runOf(file(), { results, demo: true }).stages[0]!;
    // ASSERT
    expect(stage.rounds).toEqual([]);
  });
});
