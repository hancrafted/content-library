import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { connectorInto } from './diagram-layout.pure';
import { workflowOf } from './workflow-file-adapter.pure';
import type { WorkflowFile } from './workflow-schema.types';
import { workflowView } from './workflow-view.pure';
import fixtureEn from './workflow.fixture.en.yml';

const workflow = workflowOf(parse(fixtureEn) as WorkflowFile);
const jobs = workflow.stages.flatMap((stage) => stage.jobs);

describe('success cases', () => {
  it('hands the file description on to the Workflow the picker lists', () => {
    // ARRANGE
    const file = parse(fixtureEn) as WorkflowFile;
    // ACT
    const described = workflowOf({ ...file, description: 'For the picker.' });
    // ASSERT
    expect([described.description, workflowOf({ ...file, description: undefined }).description]).toEqual([
      'For the picker.',
      undefined,
    ]);
  });

  it('derives every edge of the diagram from the slots: a job depends on the producers of the outputs it takes', () => {
    // ARRANGE
    const expected = [
      ['ask', []],
      ['look', ['ask']],
      ['judge', ['look']],
      ['rank', ['look', 'ask']],
      ['finish', ['rank']],
    ];
    // ACT
    const edges = jobs.map((job) => [job.id, job.dependsOn]);
    // ASSERT
    expect(edges).toEqual(expected);
  });

  it('gives every job its bold title and its one-line summary from the Workflow file', () => {
    // ARRANGE
    const expected = [
      ['Ask', 'In rounds'],
      ['Look', undefined],
      ['Judge', undefined],
      ['Rank', undefined],
      ['Finish', undefined],
    ];
    // ACT
    const shown = jobs.map((job) => [job.title, job.detail]);
    // ASSERT
    expect(shown).toEqual(expected);
  });

  it('fans the hairlines out into the two chats of the repeated stage and back in', () => {
    // ARRANGE
    const branches = 2;
    const [ask, each, end] = [0, 1, 2].map((at) => workflow.stages[at]!);
    // ACT
    const out = connectorInto(ask, each!, { each: branches });
    const back = connectorInto(each, end!, { each: branches });
    // ASSERT
    expect(out).toEqual({ kind: 'out', branches });
    expect(back).toEqual({ kind: 'in', branches });
  });
});

describe('failure cases', () => {
  it('gives a stage without a move no BRIEF letter', () => {
    // ARRANGE
    const last = workflow.stages.at(-1);
    // ACT
    const moves = last?.moves;
    // ASSERT
    expect(moves).toEqual([]);
  });
});

describe('edge cases', () => {
  it('keeps the file on the Workflow and the task on each job, with the review and the stage goal and summary', () => {
    // ARRANGE
    const look = jobs.find((job) => job.id === 'look');
    const ask = jobs.find((job) => job.id === 'ask');
    const id = 'fixture';
    const learningGoal = 'Ask first.';
    // ACT
    const goal = workflow.stages[0]?.goal;
    // ASSERT
    expect(workflow.file.id).toBe(id);
    expect([look?.reviewed, ask?.reviewed]).toEqual([false, true]);
    expect(goal).toBe(learningGoal);
  });

  it('gives the popover of a task without a review only its do step, one template in each level', () => {
    // ARRANGE
    const find = (level: 'simple' | 'technical') =>
      workflowView(workflow, { level }).stages.find((stage) => stage.id === 'each')?.jobs[0]?.task;
    // ACT
    const simple = find('simple');
    const technical = find('technical');
    // ASSERT
    expect(simple?.steps.map((step) => step.id)).toEqual(['do']);
    expect(technical?.steps.map((step) => step.id)).toEqual(['do']);
    expect(simple?.goodLooksLike.length).toBeGreaterThan(0);
  });
});
