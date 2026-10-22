import { describe, expect, it } from 'vitest';
import { workflowView } from './workflow-view.pure';
import type { Job, Workflow } from './workflow.types';

const TEXT = '```handoff\nkind: text\ntext: hi\n```';

function job(id: string, extra: Partial<Job> = {}): Job {
  return {
    id,
    title: `Job ${id}`,
    description: `Does ${id}. Then more.`,
    chat: 'new',
    dependsOn: [],
    inputs: [],
    outputs: [{ id: `${id}-out`, kind: 'text' }],
    skills: [],
    run: { todo: `Run ${id}.`, prompt: `Prompt of ${id} & more` },
    ...extra,
  };
}

const WORKFLOW: Workflow = {
  id: 'demo',
  title: 'Demo',
  scenario: 'A scenario.',
  setup: 'install things',
  focalJobId: 'b',
  stages: [
    { id: 's1', name: 'One', moves: [], jobs: [job('a', { exampleOutput: TEXT })] },
    {
      id: 's2',
      name: 'Two',
      moves: [],
      gate: 1,
      jobs: [
        job('b', {
          dependsOn: ['a'],
          inputs: ['a-out'],
          fanOut: 3,
          skills: [{ group: 'engineering', name: 'research' }],
          run: { todo: 'Run b.', prompt: 'Prompt of b & more', short: 'Short b', shortCommand: '/research short' },
          command: '/research [paste it here]',
          exampleInput: TEXT,
          exampleOutput: TEXT,
          check: { todo: 'Check b.', criteria: ['It is short.'], prompt: 'Check it' },
          page: { todo: 'Page b.', simple: 'Make a page', technical: 'Serve a page' },
        }),
        job('c', { dependsOn: ['a'] }),
      ],
    },
  ],
};

const jobOf = (view: ReturnType<typeof workflowView>, id: string) =>
  view.stages.flatMap((stage) => stage.jobs).find((card) => card.id === id)!;
const stepIds = (view: ReturnType<typeof workflowView>, id: string) => jobOf(view, id).steps.map((step) => step.id);

const SIMPLE = { level: 'simple' } as const;
const TECHNICAL = { level: 'technical' } as const;

describe('success cases', () => {
  it('gives one modal per stage with its jobs in order', () => {
    // ARRANGE
    const expected = [
      ['One', ['a']],
      ['Two', ['b', 'c']],
    ];
    // ACT
    const view = workflowView(WORKFLOW, SIMPLE);
    // ASSERT
    expect(view.stages.map((stage) => [stage.name, stage.jobs.map((each) => each.id)])).toEqual(expected);
  });

  it('lists the steps top to bottom as run, check, page, each with its todo line, and only those a job has', () => {
    // ARRANGE
    const view = workflowView(WORKFLOW, SIMPLE);
    // ACT
    const full = jobOf(view, 'b').steps.map((step) => [step.id, step.todo]);
    const bare = stepIds(view, 'c');
    // ASSERT
    expect(full).toEqual([
      ['run', 'Run b.'],
      ['check', 'Check b.'],
      ['page', 'Page b.'],
    ]);
    expect(bare).toEqual(['run']);
  });

  it('Simple runs the long prompt with its short variant and shows no setup or skill links', () => {
    // ARRANGE
    const view = workflowView(WORKFLOW, SIMPLE);
    // ACT
    const modal = jobOf(view, 'b');
    // ASSERT
    expect(modal.steps[0]?.prompt).toEqual({ kind: 'prompt', text: 'Prompt of b & more', short: 'Short b' });
    expect(modal.setup).toBeUndefined();
    expect(modal.sections.map((s) => s.kind)).not.toContain('skills');
  });

  it('Technical runs the slash command with the setup and links the skill docs', () => {
    // ARRANGE
    const docs = 'https://github.com/mattpocock/skills/tree/main/skills/engineering/research';
    // ACT
    const modal = jobOf(workflowView(WORKFLOW, TECHNICAL), 'b');
    // ASSERT
    expect(modal.setup).toBe('install things');
    expect(modal.steps[0]?.prompt).toEqual({
      kind: 'command',
      text: '/research [paste it here]',
      short: '/research short',
    });
    expect(modal.sections.find((s) => s.kind === 'skills')).toMatchObject({
      links: [{ label: 'research', href: docs }],
    });
  });

  it('copies the check prompt as written and the page prompt of the level', () => {
    // ARRANGE
    const pageIn = (options: typeof SIMPLE | typeof TECHNICAL) =>
      jobOf(workflowView(WORKFLOW, options), 'b').steps.find((step) => step.id === 'page')?.prompt.text;
    const check = jobOf(workflowView(WORKFLOW, SIMPLE), 'b').steps.find((step) => step.id === 'check');
    // ACT
    const pages = [pageIn(SIMPLE), pageIn(TECHNICAL)];
    // ASSERT
    expect(check?.prompt.text).toBe('Check it');
    expect(pages).toEqual(['Make a page', 'Serve a page']);
  });

  it('puts the explanation below the steps: does, in, out, criteria, then the example result', () => {
    // ARRANGE
    const sections = jobOf(workflowView(WORKFLOW, SIMPLE), 'b').sections;
    // ACT
    const kinds = sections.map((s) => s.kind);
    // ASSERT
    expect(kinds).toEqual(['does', 'in', 'out', 'criteria', 'example']);
    expect(sections.find((x) => x.kind === 'in')).toMatchObject({ items: ['Job a'] });
    expect(sections.find((x) => x.kind === 'out')).toMatchObject({ items: ['b-out (text)'] });
  });

  it('parses the example output into handoffs for the renderer', () => {
    // ARRANGE
    const view = workflowView(WORKFLOW, SIMPLE);
    // ACT
    const examples = jobOf(view, 'b').examples;
    // ASSERT
    expect(examples).toEqual([{ kind: 'text', text: 'hi' }]);
  });
});

describe('failure cases', () => {
  it('leaves out an example block that does not parse instead of throwing', () => {
    // ARRANGE
    const broken: Workflow = {
      ...WORKFLOW,
      stages: [{ id: 's', name: 'S', moves: [], jobs: [job('x', { exampleOutput: '```handoff\nkind: nope\n```' })] }],
    };
    // ACT
    const view = workflowView(broken, SIMPLE);
    // ASSERT
    expect(jobOf(view, 'x').examples).toEqual([]);
  });
});

describe('edge cases', () => {
  it('Technical falls back to the prompt for a job with no command', () => {
    // ARRANGE
    const view = workflowView(WORKFLOW, TECHNICAL);
    // ACT
    const run = jobOf(view, 'a').steps[0];
    // ASSERT
    expect(run?.prompt).toMatchObject({ kind: 'prompt', text: 'Prompt of a & more' });
  });

  it('shows no example section for a job without an example output', () => {
    // ARRANGE
    const view = workflowView(WORKFLOW, SIMPLE);
    // ACT
    const kinds = jobOf(view, 'c').sections.map((s) => s.kind);
    // ASSERT
    expect(kinds).not.toContain('example');
    expect(jobOf(view, 'c').examples).toEqual([]);
  });
});
