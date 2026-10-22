import { describe, expect, it } from 'vitest';
import { stringify } from 'yaml';
import { isNewSchema, loadWorkflow } from './workflow-loader.pure';
import { slotSample } from './workflow-sample.pure';

const PLAN = '---\nkind: plan\n---\n# Plan\n## Pieces\nOne, two.\n';
const RESEARCH = '---\nkind: research\n---\n# Mill\n## Cost\n140\n';
const section = { heading: 'Task', purpose: 'task', text: 'Do it.' };
const details = (example: string | string[]) => ({ why: 'Because.', example, goodLooksLike: ['Clear.'] });
const purposes = Object.fromEntries(['role', 'context', 'task', 'steps', 'template', 'scope'].map((p) => [p, `${p}.`]));

/** A valid two-stage file: Plan hands on `plan`, Research fans out over it into research_1 and research_2. */
function base() {
  return {
    id: 'demo',
    title: 'Demo',
    scenario: { summary: 'A demo.', facts: ['A fact'] },
    purposes,
    techniques: [{ id: 'delimiters', tier: 'basic', title: 'Delimiters', explain: 'Fence pasted text.' }],
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
            details: details([RESEARCH, RESEARCH]),
          },
        ],
      },
    ],
  };
}

type File = ReturnType<typeof base>;

/** Adds a Compare stage after Research that takes `slot` and prompts with `text`. */
function later(file: File, slot: object, text: string): void {
  const task = {
    ...file.stages[1]!.tasks[0]!,
    id: 'compare',
    output: 'compare',
    fanOut: undefined,
    review: undefined,
    details: details(RESEARCH),
  };
  file.stages.push({
    id: 'compare',
    title: 'Compare',
    learningGoal: 'Rank.',
    tasks: [
      { ...task, template: 'research', slots: [slot], do: { simple: [{ ...section, text }], technical: [section] } },
    ] as never,
  });
}
const load = (change: (file: File) => void = () => undefined) => {
  const file = base();
  change(file);
  return loadWorkflow(stringify(file));
};
const problemsOf = (result: ReturnType<typeof loadWorkflow>) =>
  'problems' in result ? result.problems.join('\n') : '';
type Research = File['stages'][1]['tasks'][0] & {
  instructions?: string;
  review: { instructions?: string };
};
const research = (file: File): Research => file.stages[1]!.tasks[0]! as Research;

describe('success cases', () => {
  it('lets a free slot without a sample take the scenario text as its sample', () => {
    // ARRANGE
    const free = (file: File) =>
      void (research(file).slots[0] = { id: 'plan', mode: 'single', label: 'Plan', free: true } as never);
    // ACT
    const result = load(free);
    // ASSERT
    expect(problemsOf(result)).toBe('');
    expect('file' in result && slotSample(result.file, result.file.stages[1]!.tasks[0]!.slots[0]!)).toBe(
      'A demo.\n\n- A fact',
    );
  });

  it('loads the instructions of a do step and of a review step', () => {
    // ARRANGE
    const change = (file: File) => {
      research(file).instructions = 'Open a fresh chat.';
      research(file).review.instructions = 'Paste the fix handoff back.';
    };
    // ACT
    const result = load(change);
    // ASSERT
    expect('file' in result && result.file.stages[1]!.tasks[0]!.instructions).toBe('Open a fresh chat.');
    expect('file' in result && result.file.stages[1]!.tasks[0]!.review?.instructions).toBe(
      'Paste the fix handoff back.',
    );
  });

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
    const multiple = { id: 'research', mode: 'multiple', label: 'All', sample: [RESEARCH, RESEARCH] };
    const after = (slot: object, text: string) => (file: File) => later(file, slot, text);
    // ACT
    const one = load(after(single, '{{research_2}}'));
    const many = load(after(multiple, '{{research_1}} {{research_2}}'));
    // ASSERT
    expect(problemsOf(one)).toBe('');
    expect(problemsOf(many)).toBe('');
  });

  it('loads a multiple slot with one sample per marker, and a free input slot that names no output', () => {
    // ARRANGE
    const many = { id: 'research', mode: 'multiple', label: 'All', sample: [RESEARCH, RESEARCH] };
    const free = { id: 'task', mode: 'single', label: 'Your task', sample: 'Plan a party.', free: true };
    const change = (file: File) => {
      later(file, many, '{{research_1}} {{research_2}}');
      file.stages[0]!.tasks[0]!.slots = [free] as never;
      file.stages[0]!.tasks[0]!.do.simple = [{ ...section, text: 'Task: {{task}}' }];
    };
    // ACT
    const result = load(change);
    // ASSERT
    expect(problemsOf(result)).toBe('');
  });

  it('takes one example per chat of a fan-out', () => {
    // ARRANGE
    const change = (file: File) => void (research(file).details.example = [RESEARCH, RESEARCH] as never);
    // ACT
    const result = load(change);
    // ASSERT
    expect(problemsOf(result)).toBe('');
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
  it('rejects instructions that are not text', () => {
    // ARRANGE
    const change = (file: File) => {
      (research(file) as { instructions?: unknown }).instructions = 3;
    };
    // ACT
    const problems = problemsOf(load(change));
    // ASSERT
    expect(problems).toContain('stages[1].tasks[0].instructions must be text.');
  });

  const many = (sample: unknown) => ({ id: 'research', mode: 'multiple', label: 'All', sample });
  const add =
    (slot: object, text = '{{research_1}} {{research_2}}') =>
    (file: File) =>
      later(file, slot, text);

  it('rejects a multiple slot whose sample count is not its marker count', () => {
    // ARRANGE
    const short = add(many([RESEARCH]));
    // ACT
    const problems = problemsOf(load(short));
    // ASSERT
    expect(problems).toMatch(/Slot "research" of task "compare" has 1 sample but 2 markers/);
  });

  it('rejects an entry sample that does not match its template, naming the entry', () => {
    // ARRANGE
    const wrong = add(many([RESEARCH, PLAN]));
    // ACT
    const problems = problemsOf(load(wrong));
    // ASSERT
    expect(problems).toMatch(/entry 2 of slot "research" of task "compare".*kind "research"/);
  });

  it('rejects a list sample on a single slot and a lone sample on a multiple slot', () => {
    // ARRANGE
    const list = (file: File) => void (research(file).slots[0]!.sample = [PLAN, PLAN] as never);
    const lone = add(many(RESEARCH));
    // ACT
    const r0 = problemsOf(load(list));
    const r1 = problemsOf(load(lone));
    // ASSERT
    expect(r0).toMatch(/Slot "plan" of task "research" is single but has a list of samples/);
    expect(r1).toMatch(/Slot "research" of task "compare" is multiple and needs a list of samples/);
  });

  it('rejects an example list that is not one per chat, and a list on a task without a fan-out', () => {
    // ARRANGE
    const short = (file: File) => void (research(file).details.example = [RESEARCH] as never);
    const list = (file: File) => void (file.stages[0]!.tasks[0]!.details.example = [PLAN] as never);
    // ACT
    const r0 = problemsOf(load(short));
    const r1 = problemsOf(load(list));
    // ASSERT
    expect(r0).toMatch(/example of task "research" needs 2 examples, one per chat, and has 1/);
    expect(r1).toMatch(/example of task "plan" is a list but the task has no fan-out/);
  });

  it('rejects a slot that is not free and has no sample', () => {
    // ARRANGE
    const bare = (file: File) =>
      void (research(file).slots[0] = { id: 'plan', mode: 'single', label: 'Plan' } as never);
    // ACT
    const problems = problemsOf(load(bare));
    // ASSERT
    expect(problems).toMatch(/Slot "plan" of task "research" needs a sample/);
  });

  it('rejects a slot naming no output unless it is a free input', () => {
    // ARRANGE
    const named = (file: File) =>
      void (research(file).slots[0] = { id: 'x', mode: 'single', label: 'X', sample: 'Text.' } as never);
    // ACT
    const problems = problemsOf(load(named));
    // ASSERT
    expect(problems).toMatch(/Slot "x" of task "research" names no output of an earlier stage/);
  });

  it('rejects an unknown purpose', () => {
    // ARRANGE
    const change = (file: File) => void (research(file).do.simple[0]!.purpose = 'vibes');
    // ACT
    const problems = problemsOf(load(change));
    // ASSERT
    expect(problems).toMatch(/purpose is "vibes"/);
  });

  it('rejects a catalogue entry without a tier or with an unknown one', () => {
    // ARRANGE
    const none = (file: File) => void delete (file.techniques[0] as { tier?: string }).tier;
    const odd = (file: File) => void (file.techniques[0]!.tier = 'expert');
    // ACT
    const r0 = problemsOf(load(none));
    const r1 = problemsOf(load(odd));
    // ASSERT
    expect(r0).toMatch(/techniques\[0\]\.tier is missing/);
    expect(r1).toMatch(/tier is "expert"/);
  });

  it('rejects a reference to an unknown technique id, in a section, the reviewer and the details', () => {
    // ARRANGE
    const inSection = (file: File) => void Object.assign(research(file).do.simple[0]!, { techniques: ['nope'] });
    const inReviewer = (file: File) => void Object.assign(file.reviewer.sections[0]!, { techniques: ['nope'] });
    const inDetails = (file: File) => void Object.assign(research(file).details, { techniques: ['nope'] });
    // ACT
    const [inSections, inReviewers, inDetailsOf] = [inSection, inReviewer, inDetails].map((change) =>
      problemsOf(load(change)),
    );
    // ASSERT
    expect(inSections).toMatch(/unknown technique "nope"/);
    expect(inReviewers).toMatch(/reviewer.*unknown technique "nope"/);
    expect(inDetailsOf).toMatch(/task "research".*unknown technique "nope"/);
  });

  it('rejects a technique id used twice', () => {
    // ARRANGE
    const twice = (file: File) => void file.techniques.push({ ...file.techniques[0]! });
    // ACT
    const problems = problemsOf(load(twice));
    // ASSERT
    expect(problems).toMatch(/technique id "delimiters" is used twice/);
  });

  it('accepts a section and details that name a catalogue technique', () => {
    // ARRANGE
    const ok = (file: File) => {
      Object.assign(research(file).do.simple[0]!, { techniques: ['delimiters'] });
      Object.assign(research(file).details, { techniques: ['delimiters'] });
    };
    // ACT
    const problems = problemsOf(load(ok));
    // ASSERT
    expect(problems).toBe('');
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
