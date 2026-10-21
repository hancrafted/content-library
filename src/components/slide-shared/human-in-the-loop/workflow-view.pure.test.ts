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
    prompt: `Prompt of ${id} & more`,
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
    { id: 's1', name: 'One', jobs: [job('a', { exampleOutput: TEXT })] },
    {
      id: 's2',
      name: 'Two',
      gate: 1,
      jobs: [
        job('b', {
          dependsOn: ['a'],
          inputs: ['a-out'],
          fanOut: 3,
          skills: [{ group: 'engineering', name: 'research' }],
          command: '/research {{a-out}}',
          exampleInput: TEXT,
          exampleOutput: TEXT,
          check: { criteria: ['It is short.'], prompt: 'Check it' },
          page: { simple: 'Make a page', technical: 'Serve a page' },
        }),
        job('c', { dependsOn: ['a'] }),
      ],
    },
  ],
};

const jobOf = (view: ReturnType<typeof workflowView>, id: string) =>
  view.stages.flatMap((stage) => stage.jobs).find((card) => card.id === id)!;
const actionIds = (view: ReturnType<typeof workflowView>, id: string) =>
  jobOf(view, id).modal.actions.map((action) => action.id);

const SIMPLE = { mode: 'try', level: 'simple' } as const;
const TECHNICAL = { mode: 'try', level: 'technical' } as const;
const textOf = (view: ReturnType<typeof workflowView>, job: string, id: string) =>
  jobOf(view, job).modal.actions.find((a) => a.id === id && 'text' in a);

describe('success cases', () => {
  it('Watch is today diagram: no step numbers, no guide, not clickable, fan-out and focal kept', () => {
    // ARRANGE
    const fan = 3;
    // ACT
    const view = workflowView(WORKFLOW, { mode: 'watch', level: 'simple' });
    // ASSERT
    expect(view.clickable).toBe(false);
    expect(view.stages.flatMap((s) => s.jobs).filter((card) => card.step !== undefined)).toEqual([]);
    expect(jobOf(view, 'a').guide).toBeUndefined();
    expect(jobOf(view, 'b')).toMatchObject({ fanOut: fan, focal: true });
    expect(view.stages[1]).toMatchObject({ gate: 1, name: 'Two' });
  });

  it('Try numbers the jobs in drawing order, gives each a one-line guide and is clickable', () => {
    // ARRANGE
    const ids = ['a', 'b', 'c'];
    // ACT
    const view = workflowView(WORKFLOW, SIMPLE);
    const cards = ids.map((id) => jobOf(view, id));
    // ASSERT
    expect(view.clickable).toBe(true);
    expect(cards.map((card) => card.step)).toEqual(cards.map((_, at) => at + 1));
    expect(cards[0]?.guide).toBe('Does a.');
  });

  it('Simple copies the long prompt and hides setup and skill links', () => {
    // ARRANGE
    const prompt = 'Prompt of b & more';
    // ACT
    const view = workflowView(WORKFLOW, SIMPLE);
    // ASSERT
    expect(view.setup).toBeUndefined();
    expect(textOf(view, 'b', 'copy-prompt')).toMatchObject({ text: prompt });
    expect(jobOf(view, 'b').modal.sections.map((s) => s.kind)).not.toContain('skills');
  });

  it('Technical copies the slash command, shows setup once, links skill docs and offers the full prompt', () => {
    // ARRANGE
    const docs = 'https://github.com/mattpocock/skills/tree/main/skills/engineering/research';
    // ACT
    const view = workflowView(WORKFLOW, TECHNICAL);
    const modal = jobOf(view, 'b').modal;
    // ASSERT
    expect(view.setup).toBe('install things');
    expect(modal.actions[0]).toMatchObject({ id: 'copy-command', text: '/research {{a-out}}' });
    expect(modal.sections.find((s) => s.kind === 'skills')).toMatchObject({
      links: [{ label: 'research', href: docs }],
    });
    expect(modal.sections.find((s) => s.kind === 'fullPrompt')).toMatchObject({ text: 'Prompt of b & more' });
  });

  it('offers every quick action a job has, in order, and only those', () => {
    // ARRANGE
    const view = workflowView(WORKFLOW, SIMPLE);
    // ACT
    const full = actionIds(view, 'b');
    const bare = actionIds(view, 'c');
    // ASSERT
    expect(full).toEqual(['copy-prompt', 'open-chatgpt', 'open-claude', 'copy-example', 'copy-check', 'copy-page']);
    expect(bare).toEqual(['copy-prompt', 'open-chatgpt', 'open-claude']);
  });

  it('prefills ChatGPT and Claude with the encoded prompt through ?q=', () => {
    // ARRANGE
    const encoded = encodeURIComponent('Prompt of b & more');
    // ACT
    const actions = jobOf(workflowView(WORKFLOW, SIMPLE), 'b').modal.actions;
    // ASSERT
    expect(actions.find((a) => a.id === 'open-chatgpt')).toMatchObject({ href: `https://chatgpt.com/?q=${encoded}` });
    expect(actions.find((a) => a.id === 'open-claude')).toMatchObject({ href: `https://claude.ai/new?q=${encoded}` });
  });

  it('copies the example input, the check prompt and the page prompt as written', () => {
    // ARRANGE
    const view = workflowView(WORKFLOW, SIMPLE);
    // ACT
    const texts = ['copy-example', 'copy-check', 'copy-page'].map(
      (id) => (textOf(view, 'b', id) as { text: string }).text,
    );
    // ASSERT
    expect(texts).toEqual([TEXT, 'Check it', 'Make a page']);
  });

  it('copies the Simple page prompt in Simple and the Technical one in Technical', () => {
    // ARRANGE
    const pageIn = (options: typeof SIMPLE | typeof TECHNICAL) =>
      (textOf(workflowView(WORKFLOW, options), 'b', 'copy-page') as { text: string }).text;
    // ACT
    const pages = [pageIn(SIMPLE), pageIn(TECHNICAL)];
    // ASSERT
    expect(pages).toEqual(['Make a page', 'Serve a page']);
  });

  it('orders the body as inverted pyramid: does, in, out, criteria, then the example result', () => {
    // ARRANGE
    const sections = jobOf(workflowView(WORKFLOW, SIMPLE), 'b').modal.sections;
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
    const examples = jobOf(view, 'b').modal.examples;
    // ASSERT
    expect(examples).toEqual([{ kind: 'text', text: 'hi' }]);
  });
});

describe('failure cases', () => {
  it('leaves out an example block that does not parse instead of throwing', () => {
    // ARRANGE
    const broken: Workflow = {
      ...WORKFLOW,
      stages: [{ id: 's', name: 'S', jobs: [job('x', { exampleOutput: '```handoff\nkind: nope\n```' })] }],
    };
    // ACT
    const view = workflowView(broken, SIMPLE);
    // ASSERT
    expect(jobOf(view, 'x').modal.examples).toEqual([]);
  });
});

describe('edge cases', () => {
  it('Technical falls back to the prompt for a job with no command and offers no full prompt', () => {
    // ARRANGE
    const view = workflowView(WORKFLOW, TECHNICAL);
    // ACT
    const first = actionIds(view, 'a')[0];
    // ASSERT
    expect(first).toBe('copy-prompt');
    expect(jobOf(view, 'a').modal.sections.map((s) => s.kind)).not.toContain('fullPrompt');
  });

  it('shows no example section for a job without an example output', () => {
    // ARRANGE
    const view = workflowView(WORKFLOW, SIMPLE);
    // ACT
    const kinds = jobOf(view, 'c').modal.sections.map((s) => s.kind);
    // ASSERT
    expect(kinds).not.toContain('example');
    expect(jobOf(view, 'c').modal.examples).toEqual([]);
  });
});
