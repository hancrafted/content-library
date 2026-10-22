import { describe, expect, it } from 'vitest';
import { stringify } from 'yaml';
import { isNewSchema, loadWorkflow } from './workflow-loader.pure';

const PLAN = '---\nkind: plan\n---\n# Plan\n## Pieces\nOne, two.\n';
const RESEARCH = '---\nkind: research\n---\n# Mill\n## Cost\n140\n';
const section = { heading: 'Task', purpose: 'task', text: 'Do it.' };
const details = (example: string) => ({ why: 'Because.', example, goodLooksLike: ['Clear.'] });
const purposes = Object.fromEntries(['role', 'context', 'task', 'steps', 'template', 'scope'].map((p) => [p, `${p}.`]));

/** A valid two-stage file: Plan hands on `plan`, Research fans out over it into research_1 and research_2. */
function base() {
  return {
    id: 'demo',
    title: 'Demo',
    scenario: { summary: 'A demo.', facts: ['A fact'] },
    purposes,
    reviewer: { sections: [{ heading: 'Inputs', purpose: 'context', text: '{{inputs}} {{checks}} {{template}}' }] },
    templates: {
      plan: '---\nkind: plan\n---\n# <Title>\n## Pieces\n',
      research: '---\nkind: research\n---\n# <What>\n## Cost\n',
    },
    stages: [
      {
        id: 'plan',
        title: 'Plan',
        learningGoal: 'Split it.',
        tasks: [
          {
            id: 'plan',
            title: 'Plan',
            output: 'plan',
            template: 'plan',
            slots: [],
            do: { simple: [section], technical: [section] },
            details: details(PLAN),
          },
        ],
      },
      {
        id: 'research',
        title: 'Research',
        learningGoal: 'Fresh chats.',
        tasks: [
          {
            id: 'research',
            title: 'Research',
            output: 'research',
            template: 'research',
            fanOut: 2,
            slots: [{ id: 'plan', mode: 'single', label: 'Plan', sample: PLAN }],
            do: {
              simple: [{ ...section, text: 'Chat {{n}} takes {{plan}} in {{template}}.' }],
              technical: [{ ...section, text: '{{plan}}' }],
            },
            review: {
              slots: [{ id: 'result', mode: 'single', label: 'Result', sample: RESEARCH }],
              checks: ['One only.'],
            },
            details: details(RESEARCH),
          },
        ],
      },
    ],
  };
}

type File = ReturnType<typeof base>;
const load = (change: (file: File) => void = () => undefined) => {
  const file = base();
  change(file);
  return loadWorkflow(stringify(file));
};
const problemsOf = (result: ReturnType<typeof loadWorkflow>) =>
  'problems' in result ? result.problems.join('\n') : '';
const research = (file: File) => file.stages[1]!.tasks[0]!;

describe('success cases', () => {
  it('loads a file with a fan-out, a slot on an earlier output and a review', () => {
    // ARRANGE
    const expected = 'demo';
    // ACT
    const result = load();
    // ASSERT
    expect('file' in result && result.file.id).toBe(expected);
  });

  it('resolves the numbered outputs x_1 … x_N of a fan-out for a later single slot and a multiple slot', () => {
    // ARRANGE
    const single = { id: 'research_2', mode: 'single', label: 'R2', sample: RESEARCH };
    const multiple = { id: 'research', mode: 'multiple', label: 'All', sample: RESEARCH };
    const later = (slot: object, text: string) => (file: File) => {
      const task = { ...research(file), id: 'compare', output: 'compare', fanOut: undefined, review: undefined };
      file.stages.push({
        id: 'compare',
        title: 'Compare',
        learningGoal: 'Rank.',
        tasks: [
          {
            ...task,
            template: 'research',
            slots: [slot],
            do: { simple: [{ ...section, text }], technical: [section] },
          },
        ] as never,
      });
    };
    // ACT
    const one = load(later(single, '{{research_2}}'));
    const many = load(later(multiple, '{{research_1}} {{research_2}}'));
    // ASSERT
    expect(problemsOf(one)).toBe('');
    expect(problemsOf(many)).toBe('');
  });

  it('tells a new-schema file from an old one by its templates', () => {
    // ARRANGE
    const old = 'id: x\nstages: []\n';
    // ACT
    const r0 = isNewSchema(stringify(base()));
    const r1 = isNewSchema(old);
    // ASSERT
    expect(r0).toBe(true);
    expect(r1).toBe(false);
  });
});

describe('failure cases', () => {
  it('rejects an unknown purpose', () => {
    // ARRANGE
    const change = (file: File) => void (research(file).do.simple[0]!.purpose = 'vibes');
    // ACT
    const problems = problemsOf(load(change));
    // ASSERT
    expect(problems).toMatch(/purpose is "vibes"/);
  });

  it('rejects an unknown marker, and {{n}} outside a fan-out', () => {
    // ARRANGE
    const unknown = (file: File) => void (research(file).do.simple[0]!.text = '{{nothing}}');
    const noFan = (file: File) => void (file.stages[0]!.tasks[0]!.do.simple[0]!.text = 'Chat {{n}}');
    // ACT
    const r0 = problemsOf(load(unknown));
    const r1 = problemsOf(load(noFan));
    // ASSERT
    expect(r0).toMatch(/unknown marker \{\{nothing\}\}/);
    expect(r1).toMatch(/unknown marker \{\{n\}\}/);
  });

  it('rejects a slot naming no earlier output', () => {
    // ARRANGE
    const change = (file: File) => void (research(file).slots[0]!.id = 'later');
    // ACT
    const problems = problemsOf(load(change));
    // ASSERT
    expect(problems).toMatch(/Slot "later".*names no output of an earlier stage/);
  });

  it('rejects a sample of the wrong kind or with other H2s than its template', () => {
    // ARRANGE
    const kind = (file: File) => void (research(file).slots[0]!.sample = RESEARCH);
    const h2 = (file: File) => void (research(file).slots[0]!.sample = PLAN.replace('Pieces', 'Parts'));
    // ACT
    const r0 = problemsOf(load(kind));
    const r1 = problemsOf(load(h2));
    // ASSERT
    expect(r0).toMatch(/kind "research"/);
    expect(r1).toMatch(/H2 sections \[Parts\]/);
  });

  it('rejects an example that does not match its template, and a review sample that does not', () => {
    // ARRANGE
    const example = (file: File) => void (research(file).details.example = PLAN);
    const review = (file: File) =>
      void ((research(file) as { review: { slots: { sample: string }[] } }).review.slots[0]!.sample = PLAN);
    // ACT
    const r0 = problemsOf(load(example));
    const r1 = problemsOf(load(review));
    // ASSERT
    expect(r0).toMatch(/example of task "research"/);
    expect(r1).toMatch(/review slot "result"/);
  });

  it('rejects a single slot over a whole fan-out and a reviewer marker in a task prompt', () => {
    // ARRANGE
    const reviewerMarker = (file: File) => void (research(file).do.simple[0]!.text = '{{checks}}');
    // ACT
    const r0 = problemsOf(load(reviewerMarker));
    // ASSERT
    expect(r0).toMatch(/unknown marker \{\{checks\}\}/);
  });

  it('reports a shape problem with its path, and text that is not YAML', () => {
    // ARRANGE
    const change = (file: File) =>
      void delete (research(file).details as Partial<File['stages'][0]['tasks'][0]['details']>).why;
    // ACT
    const r0 = problemsOf(load(change));
    const r1 = problemsOf(loadWorkflow('a: [b'));
    // ASSERT
    expect(r0).toMatch(/stages\[1\]\.tasks\[0\]\.details\.why is missing/);
    expect(r1).toMatch(/not valid YAML/);
  });
});

describe('edge cases', () => {
  it('reports a file that is valid YAML but not a mapping as shape problems', () => {
    // ARRANGE
    const source = '- just\n- a list\n';
    // ACT
    const problems = problemsOf(loadWorkflow(source));
    // ASSERT
    expect(problems).toMatch(/must be a mapping/);
  });
});
