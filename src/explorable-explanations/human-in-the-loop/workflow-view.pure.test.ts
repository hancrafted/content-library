import { describe, expect, it } from 'vitest';
import vacationEn from './vacation.en.yml';
import { workflowOf } from './workflow-file-adapter.pure';
import { loadWorkflow } from './workflow-loader.pure';
import { workflowView } from './workflow-view.pure';

const loaded = loadWorkflow(vacationEn);
if ('problems' in loaded) throw new Error(loaded.problems.join('\n'));
const WORKFLOW = workflowOf(loaded.file);

const SIMPLE = { level: 'simple' } as const;
const TECHNICAL = { level: 'technical' } as const;
const jobOf = (view: ReturnType<typeof workflowView>, id: string) =>
  view.stages.flatMap((stage) => stage.jobs).find((card) => card.id === id)!;

describe('success cases', () => {
  it('gives one modal per stage with its jobs in order and the stage goal under the title', () => {
    // ARRANGE
    const stages = 4;
    const firstTwo = ['Brief', 'Research'];
    // ACT
    const view = workflowView(WORKFLOW, SIMPLE);
    // ASSERT
    expect(view.stages).toHaveLength(stages);
    expect(view.stages.map((stage) => stage.name).slice(0, firstTwo.length)).toEqual(firstTwo);
    expect(view.stages[0]?.goal).toBe(loaded.file.stages[0]?.learningGoal);
  });

  it('Both levels make one do step and one review, and only Simple plays a repeated stage once per round', () => {
    // ARRANGE
    const stageOf = (level: typeof SIMPLE | typeof TECHNICAL, id: string) =>
      workflowView(WORKFLOW, level).stages.find((stage) => stage.id === id);
    // ACT
    const steps = [SIMPLE, TECHNICAL].map((level) =>
      stageOf(level, 'brief')?.jobs[0]?.task.steps.map((step) => step.id),
    );
    const repeats = [SIMPLE, TECHNICAL].map((level) => stageOf(level, 'research')?.repeats);
    // ASSERT
    expect(steps).toEqual([
      ['do', 'review'],
      ['do', 'review'],
    ]);
    expect(repeats).toEqual([true, false]);
  });

  it('hands the details the techniques of a task, resolved from the catalogue with their tier', () => {
    // ARRANGE
    const view = workflowView(WORKFLOW, SIMPLE);
    // ACT
    const stay = jobOf(view, 'stay').task.techniques;
    // ASSERT
    expect(stay.map((each) => each.id)).toContain('fresh-context');
    expect(stay.find((each) => each.id === 'fresh-context')).toMatchObject({ tier: 'advanced' });
    expect(stay.every((each) => each.title && each.explain)).toBe(true);
  });

  it('hands the details one example per chat for a fan-out and one otherwise', () => {
    // ARRANGE
    const chats = 3;
    // ACT
    const view = workflowView(WORKFLOW, SIMPLE);
    // ASSERT
    expect(jobOf(view, 'stay').task.examples).toHaveLength(chats);
    expect(jobOf(view, 'interview').task.examples).toHaveLength(1);
  });

  it("gives each job the goals of the Workflow file for the stepper's titles", () => {
    // ARRANGE
    const interview = loaded.file.stages[0]?.jobs[0];
    const expected = { do: interview?.goal.do, review: interview?.goal.review };
    const asks = 'interview you';
    // ACT
    const goal = jobOf(workflowView(WORKFLOW, SIMPLE), 'interview').goal;
    // ASSERT
    expect(goal).toEqual(expected);
    expect(goal.do).toContain(asks);
  });
});

describe('failure cases', () => {
  it('gives a task without a review no review step', () => {
    // ARRANGE
    const bare = (job: (typeof WORKFLOW.stages)[0]['jobs'][0]) =>
      job.id === 'interview' ? { ...job, task: { ...job.task, review: undefined } } : job;
    const stages = WORKFLOW.stages.map((stage) => ({ ...stage, jobs: stage.jobs.map(bare) }));
    const view = workflowView({ ...WORKFLOW, stages }, SIMPLE);
    // ACT
    const ids = jobOf(view, 'interview').task.steps.map((step) => step.id);
    // ASSERT
    expect(ids).toEqual(['do']);
  });
});

describe('edge cases', () => {
  it('keeps the prompt of the other level out of each step', () => {
    // ARRANGE
    const simple = jobOf(workflowView(WORKFLOW, SIMPLE), 'interview').task.steps[0]?.prompt.text ?? '';
    const role = 'friendly interviewer';
    const command = '/grilling';
    // ACT
    const technical = jobOf(workflowView(WORKFLOW, TECHNICAL), 'interview').task.steps[0]?.prompt.text ?? '';
    // ASSERT
    expect(simple).toContain(role);
    expect(technical).toContain(command);
    expect(simple).not.toContain(command);
  });
});
