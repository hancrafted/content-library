import { describe, expect, it } from 'vitest';
import { stringify } from 'yaml';
import { isNewSchema, loadWorkflow } from './workflow-loader.pure';
import { slotSample } from './workflow-sample.pure';

const PLAN = '# Plan\n## Pieces\nOne, two.\n';
const RESEARCH = '# Mill\n## Cost\n140\n';
const section = { heading: 'Task', purpose: 'task', text: 'Do it.' };
const details = (example: string | string[]) => ({ why: 'Because.', example, goodLooksLike: ['Clear.'] });
const purposes = Object.fromEntries(['role', 'context', 'task', 'steps', 'template', 'scope'].map((p) => [p, `${p}.`]));

/** A valid two-stage file: Plan hands on `plan`, Research repeats per piece of it, handing on research_1 and research_2. */
function base() {
  return {
    id: 'demo',
    title: 'Demo',
    scenario: { summary: 'A demo.', facts: ['A fact'] },
    purposes,
    techniques: [{ id: 'delimiters', tier: 'basic', title: 'Delimiters', explain: 'Fence pasted text.' }],
    reviewer: { sections: [{ heading: 'Inputs', purpose: 'context', text: '{{inputs}} {{checks}} {{template}}' }] },
    templates: {
      plan: '# <Title>\n## Pieces\n',
      research: '# <What>\n## Cost\n',
    },
    stages: [
      {
        id: 'plan',
        title: 'Plan',
        learningGoal: 'Split it.',
        jobs: [
          {
            id: 'plan',
            title: 'Plan',
            goal: { do: 'Cut the task into pieces.', review: 'Check the pieces.' },
            output: 'plan',
            template: 'plan',
            slots: [],
            do: { simple: [section], technical: [section] },
            review: {
              slots: [{ id: 'plan_result', mode: 'single', label: 'Result', sample: PLAN }],
              checks: ['Clear.'],
            },
            details: details(PLAN),
          },
        ],
      },
      {
        id: 'research',
        title: 'Research',
        learningGoal: 'Fresh chats.',
        foreach: { over: 'plan#pieces', demo: 2 },
        jobs: [
          {
            id: 'research',
            title: 'Research',
            goal: { do: 'Research each piece.', review: 'Check the research.' },
            output: 'research',
            template: 'research',
            slots: [{ id: 'plan', mode: 'single', label: 'Plan', sample: PLAN }],
            do: {
              simple: [{ ...section, text: 'Round {{item}} takes {{plan}} in {{template}}.' }],
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
    ...file.stages[1]!.jobs[0]!,
    id: 'compare',
    output: 'compare',
    goal: { do: 'Rank.', review: 'Check the ranking.' },
    details: details(RESEARCH),
  };
  file.stages.push({
    id: 'compare',
    title: 'Compare',
    learningGoal: 'Rank.',
    jobs: [
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
type Research = File['stages'][1]['jobs'][0] & {
  instructions?: string;
  review: { instructions?: string };
};
const research = (file: File): Research => file.stages[1]!.jobs[0]! as Research;

/** A second job of the Plan stage that checks the plan: it takes `plan` and hands on `checked`, with `over` laid on top. */
function checking(file: File, over: object = {}): void {
  const [plan] = file.stages[0]!.jobs;
  file.stages[0]!.jobs.push({
    ...plan!,
    id: 'check',
    goal: { do: 'Check the plan.', review: 'Check the check.' },
    output: 'checked',
    slots: [{ id: 'plan', mode: 'single', label: 'Plan', sample: PLAN }],
    needs: ['plan'],
    ...over,
  } as never);
}

/** A last stage whose only job hands nothing on and has no review: the end of the run. */
function ending(file: File, over: object = {}): void {
  const [plan] = file.stages[0]!.jobs;
  file.stages.push({
    id: 'end',
    title: 'End',
    learningGoal: 'Done.',
    jobs: [
      {
        ...plan!,
        id: 'finish',
        goal: { do: 'Finish.' },
        output: undefined,
        review: undefined,
        slots: [{ id: 'plan', mode: 'single', label: 'Plan', sample: PLAN }],
        ...over,
      },
    ] as never,
  });
}

describe('success cases', () => {
  it('loads the AI chat buttons a job offers, each a label, an https link and an icon or none', () => {
    // ARRANGE
    const buttons = [
      { label: 'Gemini', url: 'https://gemini.google.com/app', icon: null },
      { label: 'Spark', url: 'https://example.com/chat', icon: 'sparkles' },
    ];
    const change = (file: File) => void Object.assign(research(file), { openAIButtons: buttons });
    // ACT
    const result = load(change);
    const read = 'file' in result ? result.file.stages[1]?.jobs[0]?.openAIButtons : problemsOf(result);
    // ASSERT
    expect(read).toEqual(buttons);
  });

  it('loads a job that hands on an output without a review, so only the gates need a check', () => {
    // ARRANGE
    const change = (file: File) => void delete (file.stages[0]!.jobs[0] as { review?: unknown }).review;
    // ACT
    const problems = problemsOf(load(change));
    // ASSERT
    expect(problems).toBe('');
  });

  it('keeps the optional picker description of a file, and loads a file without one', () => {
    // ARRANGE
    const described = load((file) => Object.assign(file, { description: 'One sentence for the picker.' }));
    const plain = load();
    // ACT
    const read = [described, plain].map((result) => ('file' in result ? result.file.description : 'refused'));
    // ASSERT
    expect(read).toEqual(['One sentence for the picker.', undefined]);
  });

  it('lets a free slot without a sample take the scenario text as its sample', () => {
    // ARRANGE
    const free = (file: File) =>
      void (research(file).slots[0] = { id: 'plan', mode: 'single', label: 'Plan', free: true } as never);
    // ACT
    const result = load(free);
    // ASSERT
    expect(problemsOf(result)).toBe('');
    expect('file' in result && slotSample(result.file, result.file.stages[1]!.jobs[0]!.slots[0]!)).toBe(
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
    expect('file' in result && result.file.stages[1]!.jobs[0]!.instructions).toBe('Open a fresh chat.');
    expect('file' in result && result.file.stages[1]!.jobs[0]!.review?.instructions).toBe(
      'Paste the fix handoff back.',
    );
  });

  it('lets a job take the output of a job of its own stage that it needs', () => {
    // ARRANGE
    const change = (file: File) => checking(file);
    // ACT
    const result = load(change);
    // ASSERT
    expect(problemsOf(result)).toBe('');
    expect('file' in result && result.file.stages[0]!.jobs[1]!.needs).toEqual(['plan']);
  });

  it('loads a final job without an output and without a review', () => {
    // ARRANGE
    const change = (file: File) => ending(file);
    // ACT
    const result = load(change);
    // ASSERT
    expect(problemsOf(result)).toBe('');
  });

  it('loads a stage summary of eight words and the goals of a job', () => {
    // ARRANGE
    const change = (file: File) =>
      void Object.assign(file.stages[0]!, { summary: 'One two three four five six seven eight' });
    // ACT
    const result = load(change);
    // ASSERT
    expect(problemsOf(result)).toBe('');
    expect('file' in result && result.file.stages[1]!.jobs[0]!.goal).toEqual({
      do: 'Research each piece.',
      review: 'Check the research.',
    });
  });

  it('loads a file with a repeated stage, a slot on an earlier output and a review', () => {
    // ARRANGE
    const expected = 'demo';
    // ACT
    const result = load();
    // ASSERT
    expect('file' in result && result.file.id).toBe(expected);
  });

  it('resolves the numbered outputs x_1 … x_N of a repeated stage for a later single slot and a multiple slot', () => {
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
      file.stages[0]!.jobs[0]!.slots = [free] as never;
      file.stages[0]!.jobs[0]!.do.simple = [{ ...section, text: 'Task: {{task}}' }];
    };
    // ACT
    const result = load(change);
    // ASSERT
    expect(problemsOf(result)).toBe('');
  });

  it('takes one example per demo round of a repeated stage', () => {
    // ARRANGE
    const change = (file: File) => void (research(file).details.example = [RESEARCH, RESEARCH] as never);
    // ACT
    const result = load(change);
    // ASSERT
    expect(problemsOf(result)).toBe('');
  });

  it('fills {{limit.name}} from the limits of a job, with a full and a demo value', () => {
    // ARRANGE
    const change = (file: File) => {
      Object.assign(research(file), { limits: { questions: { full: 8, demo: 5 } } });
      research(file).do.simple = [{ ...section, text: 'Ask at most {{limit.questions}}. {{item}} {{plan}}' }];
    };
    // ACT
    const result = load(change);
    // ASSERT
    expect(problemsOf(result)).toBe('');
  });

  it('allows {{item}} in the checks of a job of a repeated stage', () => {
    // ARRANGE
    const change = (file: File) => void (research(file).review as { checks: string[] }).checks.push('Covers {{item}}.');
    // ACT
    const result = load(change);
    // ASSERT
    expect(problemsOf(result)).toBe('');
  });

  it('expands {{research_*}} of a multiple slot into one marker per demo round', () => {
    // ARRANGE
    const many = { id: 'research', mode: 'multiple', label: 'All', sample: [RESEARCH, RESEARCH] };
    // ACT
    const result = load((file) => later(file, many, 'All: {{research_*}}'));
    // ASSERT
    expect(problemsOf(result)).toBe('');
  });

  it('lets a job of a repeated stage take the output of a needed job of the same stage as its own round', () => {
    // ARRANGE
    const change = (file: File) => {
      const [first] = file.stages[1]!.jobs;
      file.stages[1]!.jobs.push({
        ...first!,
        id: 'second',
        output: 'second',
        needs: ['research'],
        goal: { do: 'Second.', review: 'Check second.' },
        slots: [{ id: 'research', mode: 'single', label: 'Its research', sample: RESEARCH }],
        details: details([RESEARCH, RESEARCH]),
        do: { simple: [{ ...section, text: 'Round {{item}}: {{research}}' }], technical: [section] },
      } as never);
    };
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
  it('rejects a chat button whose link is not https, whose icon is unknown, and an empty list', () => {
    // ARRANGE
    const buttons = (list: object[]) => (file: File) => void Object.assign(research(file), { openAIButtons: list });
    const insecure = buttons([{ label: 'Chat', url: 'http://example.com/', icon: null }]);
    const unknownIcon = buttons([{ label: 'Chat', url: 'https://example.com/', icon: 'rocket' }]);
    const where = 'stages[1].jobs[0].openAIButtons';
    // ACT
    const [link, icon, empty] = [insecure, unknownIcon, buttons([])].map((change) => problemsOf(load(change)));
    // ASSERT
    expect(link).toContain(`${where}[0].url "http://example.com/" must start with https://.`);
    expect(icon).toContain(`${where}[0].icon is "rocket"`);
    expect(empty).toContain(`${where} needs at least 1 entries.`);
  });

  it('reports a description that is not a text', () => {
    // ARRANGE
    const result = load((file) => Object.assign(file, { description: 3 }));
    // ACT
    const problems = problemsOf(result);
    // ASSERT
    expect(problems).toMatch(/description/);
  });

  it('reports a needs id that names no job of the stage', () => {
    // ARRANGE
    const change = (file: File) => checking(file, { needs: ['ghost'] });
    // ACT
    const problems = problemsOf(load(change));
    // ASSERT
    expect(problems).toContain('Job "check" needs "ghost", which is not a job of its stage.');
  });

  it('reports a needs cycle, naming the jobs on it', () => {
    // ARRANGE
    const change = (file: File) => {
      checking(file);
      Object.assign(file.stages[0]!.jobs[0]!, { needs: ['check'] });
    };
    // ACT
    const problems = problemsOf(load(change));
    // ASSERT
    expect(problems).toMatch(/Stage "plan" has a needs cycle: plan, check/);
  });

  it('reports a slot that takes a same-stage output without needing that job', () => {
    // ARRANGE
    const change = (file: File) => checking(file, { needs: undefined });
    // ACT
    const problems = problemsOf(load(change));
    // ASSERT
    expect(problems).toContain(
      'Slot "plan" of task "check" takes the output of "plan" in its own stage; add it to needs.',
    );
  });

  it('reports a job that has no output unless it is the final job of the last stage', () => {
    // ARRANGE
    const change = (file: File) => void delete (file.stages[0]!.jobs[0] as { output?: unknown }).output;
    // ACT
    const problems = problemsOf(load(change));
    // ASSERT
    expect(problems).toContain('Task "plan" has no output; only the final job of the last stage may have none.');
  });

  it('reports a stage summary of more than eight words', () => {
    // ARRANGE
    const change = (file: File) =>
      void Object.assign(file.stages[0]!, { summary: 'One two three four five six seven eight nine' });
    // ACT
    const problems = problemsOf(load(change));
    // ASSERT
    expect(problems).toContain('The summary of stage "plan" has 9 words; at most 8.');
  });

  it('reports a job without a goal, and a review without a review goal', () => {
    // ARRANGE
    const none = (file: File) => void delete (research(file) as { goal?: unknown }).goal;
    const half = (file: File) => void Object.assign(research(file), { goal: { do: 'Research.' } });
    // ACT
    const r0 = problemsOf(load(none));
    const r1 = problemsOf(load(half));
    // ASSERT
    expect(r0).toContain('stages[1].jobs[0].goal is missing.');
    expect(r1).toContain('Task "research" has a review but no review goal.');
  });

  it('rejects instructions that are not text', () => {
    // ARRANGE
    const change = (file: File) => {
      (research(file) as { instructions?: unknown }).instructions = 3;
    };
    // ACT
    const problems = problemsOf(load(change));
    // ASSERT
    expect(problems).toContain('stages[1].jobs[0].instructions must be text.');
  });

  it('reports a stage that still uses the old tasks: key as an unknown field', () => {
    // ARRANGE
    const change = (file: File) => {
      const stage = file.stages[0] as unknown as Record<string, unknown>;
      stage.tasks = stage.jobs;
      delete stage.jobs;
    };
    // ACT
    const problems = problemsOf(load(change));
    // ASSERT
    expect(problems).toContain('stages[0].tasks is not a field of the schema.');
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
    expect(problems).toMatch(/entry 2 of slot "research" of task "compare".*H2 sections/);
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
    const list = (file: File) => void (file.stages[0]!.jobs[0]!.details.example = [PLAN] as never);
    // ACT
    const r0 = problemsOf(load(short));
    const r1 = problemsOf(load(list));
    // ASSERT
    expect(r0).toMatch(/example of task "research" needs 2 examples, one per demo round, and has 1/);
    expect(r1).toMatch(/example of task "plan" is a list but its stage does not repeat/);
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

  it('accepts a section shown only in demo mode or a full run, and rejects another mode', () => {
    // ARRANGE
    const only = (mode: string) => (file: File) =>
      void (research(file).do.simple = [...research(file).do.simple, { ...section, only: mode } as never]);
    const unknown = 'sometimes';
    // ACT
    const demo = problemsOf(load(only('demo')));
    const full = problemsOf(load(only('full')));
    const other = problemsOf(load(only(unknown)));
    // ASSERT
    expect([demo, full]).toEqual(['', '']);
    expect(other).toContain(`only is "${unknown}", which is not one of demo, full`);
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

  it('rejects an unknown marker, ', () => {
    // ARRANGE
    const unknown = (file: File) => void (research(file).do.simple[0]!.text = '{{nothing}}');
    const noFan = (file: File) => void (file.stages[0]!.jobs[0]!.do.simple[0]!.text = 'Round {{item}}');
    // ACT
    const r0 = problemsOf(load(unknown));
    const r1 = problemsOf(load(noFan));
    // ASSERT
    expect(r0).toMatch(/unknown marker \{\{nothing\}\}/);
    expect(r1).toMatch(/unknown marker \{\{item\}\}/);
  });

  it('rejects a slot naming no earlier output', () => {
    // ARRANGE
    const change = (file: File) => void (research(file).slots[0]!.id = 'later');
    // ACT
    const problems = problemsOf(load(change));
    // ASSERT
    expect(problems).toMatch(/Slot "later".*names no output of an earlier stage/);
  });

  it('rejects a sample of another template or with other H2s than its template', () => {
    // ARRANGE
    const kind = (file: File) => void (research(file).slots[0]!.sample = RESEARCH);
    const h2 = (file: File) => void (research(file).slots[0]!.sample = PLAN.replace('Pieces', 'Parts'));
    // ACT
    const r0 = problemsOf(load(kind));
    const r1 = problemsOf(load(h2));
    // ASSERT
    expect(r0).toMatch(/H2 sections \[Cost\]/);
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
      void delete (research(file).details as Partial<File['stages'][0]['jobs'][0]['details']>).why;
    // ACT
    const r0 = problemsOf(load(change));
    const r1 = problemsOf(loadWorkflow('a: [b'));
    // ASSERT
    expect(r0).toMatch(/stages\[1\]\.jobs\[0\]\.details\.why is missing/);
    expect(r1).toMatch(/not valid YAML/);
  });

  it('reports fanOut as an unknown field of a job', () => {
    // ARRANGE
    const change = (file: File) => void Object.assign(research(file), { fanOut: 2 });
    // ACT
    const problems = problemsOf(load(change));
    // ASSERT
    expect(problems).toContain('stages[1].jobs[0].fanOut is not a field of the schema.');
  });

  const foreach =
    (over: string, demo: unknown = 2) =>
    (file: File) =>
      void Object.assign(file.stages[1]!, { foreach: { over, demo } });

  it('reports a foreach over an output no earlier stage hands on', () => {
    // ARRANGE
    const change = foreach('ghost#pieces');
    // ACT
    const problems = problemsOf(load(change));
    // ASSERT
    expect(problems).toContain('Stage "research" repeats over "ghost#pieces", but no earlier stage hands on "ghost".');
  });

  it("reports a foreach over a heading the output's template does not have", () => {
    // ARRANGE
    const change = foreach('plan#ghost');
    // ACT
    const problems = problemsOf(load(change));
    // ASSERT
    expect(problems).toContain(
      'Stage "research" repeats over "plan#ghost", but the template of "plan" has no H2 "ghost".',
    );
  });

  it('reports a foreach over that is not written output#heading', () => {
    // ARRANGE
    const change = foreach('plan');
    // ACT
    const problems = problemsOf(load(change));
    // ASSERT
    expect(problems).toContain('Stage "research" repeats over "plan"; write it as <output>#<h2 slug>.');
  });

  it('accepts the word a round is called, and reports one that is not text', () => {
    // ARRANGE
    const named = (item: unknown) => (file: File) =>
      void Object.assign(file.stages[1]!, { foreach: { over: 'plan#pieces', demo: 2, item } });
    // ACT
    const accepted = problemsOf(load(named('piece')));
    const number = problemsOf(load(named(3)));
    const blank = problemsOf(load(named(' ')));
    // ASSERT
    expect(accepted).not.toContain('foreach.item');
    expect(number).toContain('stages[1].foreach.item must be text.');
    expect(blank).toContain('stages[1].foreach.item must be text.');
  });

  it('reports a demo cap below 1', () => {
    // ARRANGE
    const change = foreach('plan#pieces', 0);
    // ACT
    const problems = problemsOf(load(change));
    // ASSERT
    expect(problems).toContain('stages[1].foreach.demo must be a whole number of at least 1.');
  });

  it('reports a foreach in the first stage, which has no earlier output to repeat over', () => {
    // ARRANGE
    const change = (file: File) => void Object.assign(file.stages[0]!, { foreach: { over: 'plan#pieces', demo: 2 } });
    // ACT
    const problems = problemsOf(load(change));
    // ASSERT
    expect(problems).toContain('Stage "plan" repeats over "plan#pieces", but no earlier stage hands on "plan".');
  });

  it('rejects a {{limit.name}} the job does not declare, and a demo value above the full one', () => {
    // ARRANGE
    const undeclared = (file: File) =>
      void (research(file).do.simple = [{ ...section, text: '{{limit.questions}} {{item}} {{plan}}' }]);
    const inverted = (file: File) =>
      void Object.assign(research(file), { limits: { questions: { full: 3, demo: 5 } } });
    // ACT
    const r0 = problemsOf(load(undeclared));
    const r1 = problemsOf(load(inverted));
    // ASSERT
    expect(r0).toMatch(/unknown marker \{\{limit\.questions\}\}/);
    expect(r1).toContain('The limit "questions" of task "research" has a demo value above its full value.');
  });

  it('rejects {{item}} in the checks of a job whose stage does not repeat, and an unknown marker in checks', () => {
    // ARRANGE
    const plain = (file: File) => void file.stages[0]!.jobs[0]!.review!.checks.push('Covers {{item}}.');
    const unknown = (file: File) => void research(file).review.checks.push('Covers {{nothing}}.');
    // ACT
    const r0 = problemsOf(load(plain));
    const r1 = problemsOf(load(unknown));
    // ASSERT
    expect(r0).toContain('The checks of task "plan" have the unknown marker {{item}}.');
    expect(r1).toContain('The checks of task "research" have the unknown marker {{nothing}}.');
  });

  it('rejects {{x_*}} on a single slot', () => {
    // ARRANGE
    const single = { id: 'research_2', mode: 'single', label: 'R2', sample: RESEARCH };
    // ACT
    const result = problemsOf(load((file) => later(file, single, '{{research_2_*}}')));
    // ASSERT
    expect(result).toMatch(/unknown marker/);
  });
});

describe('edge cases', () => {
  it('loads a final job that has an output and no review', () => {
    // ARRANGE
    const change = (file: File) => ending(file, { output: 'report' });
    const finalJob = 'Task "finish"';
    // ACT
    const problems = problemsOf(load(change));
    // ASSERT
    expect(problems).not.toContain(finalJob);
  });

  it('asks an output of a job of the last stage that is not its final job', () => {
    // ARRANGE
    const change = (file: File) => {
      ending(file);
      file.stages[2]!.jobs.unshift({ ...file.stages[2]!.jobs[0]!, id: 'early' } as never);
    };
    // ACT
    const problems = problemsOf(load(change));
    // ASSERT
    expect(problems).toContain('Task "early" has no output; only the final job of the last stage may have none.');
  });

  it('reports a file that is valid YAML but not a mapping as shape problems', () => {
    // ARRANGE
    const source = '- just\n- a list\n';
    // ACT
    const problems = problemsOf(loadWorkflow(source));
    // ASSERT
    expect(problems).toMatch(/must be a mapping/);
  });
});
