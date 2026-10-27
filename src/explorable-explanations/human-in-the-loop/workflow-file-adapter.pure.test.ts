import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { connectorInto } from './diagram-layout.pure';
import vacationEn from './vacation.en.yml';
import { workflowOf } from './workflow-file-adapter.pure';
import type { WorkflowFile } from './workflow-schema.types';
import { workflowView } from './workflow-view.pure';

const workflow = workflowOf(parse(vacationEn) as WorkflowFile);
const jobs = workflow.stages.flatMap((stage) => stage.jobs);

describe('success cases', () => {
  it('hands the file description on to the Workflow the picker lists', () => {
    // ARRANGE
    const file = parse(vacationEn) as WorkflowFile;
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
      ['interview', []],
      ['stay', ['interview']],
      ['compare', ['interview', 'stay']],
      ['pick', ['compare', 'stay', 'interview']],
      ['page', ['pick']],
    ];
    // ACT
    const edges = jobs.map((job) => [job.id, job.dependsOn]);
    // ASSERT
    expect(edges).toEqual(expected);
  });

  it('gives every job its bold title and its one-line summary from the Workflow file', () => {
    // ARRANGE
    const expected = [
      ['AI grills you', 'In rounds, then it writes the requirements'],
      ['Chat', 'One fresh chat per kind of stay, with web search'],
      ['Rank the stays', 'Against your acceptance criteria'],
      ['You pick', 'Your choice, written up with everything the page needs'],
      ['Make the page', 'One HTML file, opened in your browser'],
    ];
    // ACT
    const shown = jobs.map((job) => [job.title, job.detail]);
    // ASSERT
    expect(shown).toEqual(expected);
  });

  it('fans the hairlines out into the three research chats and back in', () => {
    // ARRANGE
    const branches = 3;
    const [brief, research, decide] = [0, 1, 2].map((at) => workflow.stages[at]!);
    // ACT
    const out = connectorInto(brief, research!, { research: branches });
    const back = connectorInto(research, decide!, { research: branches });
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
    const stay = jobs.find((job) => job.id === 'stay');
    const interview = jobs.find((job) => job.id === 'interview');
    // ACT
    const goal = workflow.stages[0]?.goal;
    // ASSERT
    expect(workflow.file.id).toBe('vacation');
    expect([stay?.reviewed, interview?.reviewed]).toEqual([false, true]);
    expect(goal).toContain('Interview first');
  });

  it('gives the popover of a task without a review only its do step, one template in each level', () => {
    // ARRANGE
    const find = (level: 'simple' | 'technical') =>
      workflowView(workflow, { level }).stages.find((stage) => stage.id === 'research')?.jobs[0]?.task;
    // ACT
    const simple = find('simple');
    const technical = find('technical');
    // ASSERT
    expect(simple?.steps.map((step) => step.id)).toEqual(['do']);
    expect(technical?.steps.map((step) => step.id)).toEqual(['do']);
    expect(simple?.goodLooksLike.length).toBeGreaterThan(0);
  });
});
