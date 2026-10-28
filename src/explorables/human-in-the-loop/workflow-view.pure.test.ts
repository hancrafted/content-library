import { describe, expect, it } from 'vitest';
import { workflowOf } from './workflow-file-adapter.pure';
import { loadWorkflow } from './workflow-loader.pure';
import { workflowView } from './workflow-view.pure';
import fixtureEn from './workflow.fixture.en.yml';

const loaded = loadWorkflow(fixtureEn);
if ('problems' in loaded) throw new Error(loaded.problems.join('\n'));
const WORKFLOW = workflowOf(loaded.file);

const SIMPLE = { level: 'simple' } as const;
const TECHNICAL = { level: 'technical' } as const;
const jobOf = (view: ReturnType<typeof workflowView>, id: string) =>
  view.stages.flatMap((stage) => stage.jobs).find((card) => card.id === id)!;

describe('success cases', () => {
  it('gives one modal per stage with its jobs in order and the stage goal under the title', () => {
    // ARRANGE
    const stages = 3;
    const firstTwo = ['Ask', 'Each'];
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
    const steps = [SIMPLE, TECHNICAL].map((level) => stageOf(level, 'ask')?.jobs[0]?.task.steps.map((step) => step.id));
    const repeats = [SIMPLE, TECHNICAL].map((level) => stageOf(level, 'each')?.repeats);
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
    const look = jobOf(view, 'look').task.techniques;
    // ASSERT
    expect(look.map((each) => each.id)).toContain('fresh-context');
    expect(look.find((each) => each.id === 'fresh-context')).toMatchObject({ tier: 'advanced' });
    expect(look.every((each) => each.title && each.explain)).toBe(true);
  });

  it('hands the details one example per chat for a fan-out and one otherwise', () => {
    // ARRANGE
    const chats = 2;
    // ACT
    const view = workflowView(WORKFLOW, SIMPLE);
    // ASSERT
    expect(jobOf(view, 'look').task.examples).toHaveLength(chats);
    expect(jobOf(view, 'ask').task.examples).toHaveLength(1);
  });

  it("gives each job the goals of the Workflow file for the stepper's titles", () => {
    // ARRANGE
    const ask = loaded.file.stages[0]?.jobs[0];
    const expected = { do: ask?.goal.do, review: ask?.goal.review };
    const asks = 'Ask, then write';
    // ACT
    const goal = jobOf(workflowView(WORKFLOW, SIMPLE), 'ask').goal;
    // ASSERT
    expect(goal).toEqual(expected);
    expect(goal.do).toContain(asks);
  });
  it('hands a job the AI chat buttons it names, and none to a job that names none', () => {
    // ARRANGE
    const gemini = [{ label: 'Gemini', url: 'https://gemini.google.com/app', icon: 'gemini' }];
    const view = workflowView(WORKFLOW, SIMPLE);
    // ACT
    const named = jobOf(view, 'finish').task.openAIButtons;
    const none = jobOf(view, 'rank').task.openAIButtons;
    // ASSERT
    expect(named).toEqual(gemini);
    expect(none).toBeUndefined();
  });
});

describe('failure cases', () => {
  it('gives a task without a review no review step', () => {
    // ARRANGE
    const bare = (job: (typeof WORKFLOW.stages)[0]['jobs'][0]) =>
      job.id === 'ask' ? { ...job, task: { ...job.task, review: undefined } } : job;
    const stages = WORKFLOW.stages.map((stage) => ({ ...stage, jobs: stage.jobs.map(bare) }));
    const view = workflowView({ ...WORKFLOW, stages }, SIMPLE);
    // ACT
    const ids = jobOf(view, 'ask').task.steps.map((step) => step.id);
    // ASSERT
    expect(ids).toEqual(['do']);
  });
});

describe('edge cases', () => {
  it('keeps the prompt of the other level out of each step', () => {
    // ARRANGE
    const simple = jobOf(workflowView(WORKFLOW, SIMPLE), 'ask').task.steps[0]?.prompt.text ?? '';
    const role = 'patient interviewer';
    const command = 'questions about this';
    // ACT
    const technical = jobOf(workflowView(WORKFLOW, TECHNICAL), 'ask').task.steps[0]?.prompt.text ?? '';
    // ASSERT
    expect(simple).toContain(role);
    expect(technical).toContain(command);
    expect(simple).not.toContain(command);
  });
});
