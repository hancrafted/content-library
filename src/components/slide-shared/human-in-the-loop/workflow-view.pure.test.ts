import { describe, expect, it } from 'vitest';
import summerPartyEn from './summer-party.en.yml';
import { workflowOf } from './workflow-file-adapter.pure';
import { loadWorkflow } from './workflow-loader.pure';
import { workflowView } from './workflow-view.pure';

const loaded = loadWorkflow(summerPartyEn);
if ('problems' in loaded) throw new Error(loaded.problems.join('\n'));
const WORKFLOW = workflowOf(loaded.file);

const SIMPLE = { level: 'simple' } as const;
const TECHNICAL = { level: 'technical' } as const;
const jobOf = (view: ReturnType<typeof workflowView>, id: string) =>
  view.stages.flatMap((stage) => stage.jobs).find((card) => card.id === id)!;

describe('success cases', () => {
  it('gives one modal per stage with its jobs in order and the stage goal under the title', () => {
    // ARRANGE
    const stages = 7;
    const firstTwo = ['Plan', 'Interview'];
    // ACT
    const view = workflowView(WORKFLOW, SIMPLE);
    // ASSERT
    expect(view.stages).toHaveLength(stages);
    expect(view.stages.map((stage) => stage.name).slice(0, firstTwo.length)).toEqual(firstTwo);
    expect(view.stages[0]?.goal).toBe(loaded.file.stages[0]?.learningGoal);
  });

  it('Simple makes one do step per chat of a fan-out and Technical one orchestrator step, each with its review', () => {
    // ARRANGE
    const chats = 3;
    // ACT
    const simple = jobOf(workflowView(WORKFLOW, SIMPLE), 'venue').task.steps;
    const technical = jobOf(workflowView(WORKFLOW, TECHNICAL), 'venue').task.steps;
    // ASSERT
    expect(simple.map((step) => step.id)).toEqual([...Array<string>(chats).fill('do'), 'review']);
    expect(technical.map((step) => step.id)).toEqual(['do', 'review']);
  });

  it('hands the details one example per chat for a fan-out and one otherwise', () => {
    // ARRANGE
    const chats = 3;
    // ACT
    const view = workflowView(WORKFLOW, SIMPLE);
    // ASSERT
    expect(jobOf(view, 'venue').task.examples).toHaveLength(chats);
    expect(jobOf(view, 'pieces').task.examples).toHaveLength(1);
  });
});

describe('failure cases', () => {
  it('gives a task without a review no review step', () => {
    // ARRANGE
    const view = workflowView(WORKFLOW, SIMPLE);
    // ACT
    const ids = jobOf(view, 'interview').task.steps.map((step) => step.id);
    // ASSERT
    expect(ids).toEqual(['do']);
  });
});

describe('edge cases', () => {
  it('keeps the prompt of the other level out of each step', () => {
    // ARRANGE
    const simple = jobOf(workflowView(WORKFLOW, SIMPLE), 'spec').task.steps[0]?.prompt.text ?? '';
    // ACT
    const technical = jobOf(workflowView(WORKFLOW, TECHNICAL), 'spec').task.steps[0]?.prompt.text ?? '';
    // ASSERT
    expect(simple).toContain('You are a spec writer');
    expect(technical).toContain('/to-spec');
    expect(simple).not.toContain('/to-spec');
  });
});
