import { describe, expect, it } from 'vitest';
import { stringify } from 'yaml';
import { isNewSchema, loadWorkflow } from './workflow-loader.pure';
import { slotSample } from './workflow-sample.pure';

const PLAN = '# Plan\n## Pieces\nOne, two.\n';
const RESEARCH = '# Mill\n## Cost\n140\n';
const section = { heading: 'Task', purpose: 'task', text: 'Do it.' };
const details = (example: string | string[]) => ({ why: 'Because.', example, goodLooksLike: ['Clear.'] });
const purposes = Object.fromEntries(['role', 'context', 'task', 'steps', 'template', 'scope'].map((p) => [p, `${p}.`]));

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
            do: { simple: [{ ...section }], technical: [{ ...section }] },
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

const optionalCheck = (file: File) => checking(file, { optional: true });
const takes = (id: string) => ({ id, mode: 'single', label: id, sample: PLAN });

describe('success cases', () => {
  it('loads the AI chat buttons a job offers, each a label, an https link and an icon or none', () => {
    // ARRANGE
    const buttons = [
      { label: 'ChatGPT', url: 'https://chatgpt.com/', icon: 'chatgpt' },
      { label: 'Gemini', url: 'https://gemini.google.com/app', icon: 'gemini' },
      { label: 'Other', url: 'https://example.com/chat', icon: null },
    ];
    const change = (file: File) => void Object.assign(research(file), { openAIButtons: buttons });
    // ACT
    const result = load(change);
    const read = 'file' in result ? result.file.stages[1]?.jobs[0]?.openAIButtons : problemsOf(result);
    // ASSERT
    expect(read).toEqual(buttons);
  });

  it('loads the recommended model tier of a job, and a job without one', () => {
    // ARRANGE
    const change = (file: File) => void Object.assign(research(file), { recommendedModel: 'high' });
    // ACT
    const tiered = load(change);
    const plain = load(() => undefined);
    // ASSERT
    expect('file' in tiered && tiered.file.stages[1]?.jobs[0]?.recommendedModel).toBe('high');
    expect('file' in plain && plain.file.stages[1]?.jobs[0]?.recommendedModel).toBeUndefined();
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

  it('loads a checkbox job anywhere in a stage, with the label of its own checkbox', () => {
    // ARRANGE
    const doneLabel = 'I opened the quiz and played it through';
    const change = (file: File) => checking(file, { output: undefined, doneLabel, review: undefined });
    // ACT
    const result = load(change);
    // ASSERT
    expect(problemsOf(result)).toBe('');
    expect('file' in result && result.file.stages[0]!.jobs[1]!.doneLabel).toBe(doneLabel);
  });

  it('loads a checkbox job without a template and an example, since it hands nothing on', () => {
    // ARRANGE
    const change = (file: File) =>
      checking(file, {
        output: undefined,
        review: undefined,
        template: undefined,
        details: { why: 'Because.', goodLooksLike: ['Clear.'] },
      });
    // ACT
    const problems = problemsOf(load(change));
    // ASSERT
    expect(problems).toBe('');
  });

  it('loads a free slot marked blank without a sample, and gives it none', () => {
    // ARRANGE
    const blank = { id: 'plan', mode: 'single', label: 'Notes', free: true, blank: true };
    const change = (file: File) => void (research(file).slots[0] = blank as never);
    // ACT
    const result = load(change);
    const slot = 'file' in result ? result.file.stages[1]!.jobs[0]!.slots[0]! : undefined;
    // ASSERT
    expect(problemsOf(result)).toBe('');
    expect(slot && 'file' in result && slotSample(result.file, slot)).toBeUndefined();
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

  it('loads several BRIEF moves on one stage, each with its own why', () => {
    // ARRANGE
    const expected = [
      { letter: 'R', why: 'Sign off before research.' },
      { letter: 'I', why: 'Grilled on the epic first.' },
    ];
    const change = (file: File) => void Object.assign(file.stages[0]!, { moves: expected });
    // ACT
    const result = load(change);
    // ASSERT
    expect(problemsOf(result)).toBe('');
    expect('file' in result && result.file.stages[0]!.moves).toEqual(expected);
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

  it('loads an optional job that no required job reads', () => {
    // ARRANGE
    const change = (file: File) => optionalCheck(file);
    // ACT
    const result = load(change);
    // ASSERT
    expect(problemsOf(result)).toBe('');
    expect('file' in result && result.file.stages[0]?.jobs[1]?.optional).toBe(true);
  });

  it('lets an optional job draw on an earlier optional job of its own stage', () => {
    // ARRANGE
    const change = (file: File) => {
      optionalCheck(file);
      file.stages[0]!.jobs.push({
        ...file.stages[0]!.jobs[0]!,
        id: 'again',
        output: 'again',
        optional: true,
        needs: ['check'],
        slots: [takes('checked')],
      } as never);
    };
    // ACT
    const problems = problemsOf(load(change));
    // ASSERT
    expect(problems).toBe('');
  });

  it('refuses a required job whose slot takes the output of an optional job, naming both', () => {
    // ARRANGE
    const change = (file: File) => {
      optionalCheck(file);
      later(file, takes('checked'), '{{checked}}');
    };
    // ACT
    const problems = problemsOf(load(change));
    // ASSERT
    expect(problems).toContain('Slot "checked" of task "compare" takes the output of the optional task "check"');
  });

  it('refuses a marker naming an optional output the required job has no slot for, so a marker cannot reach it', () => {
    // ARRANGE
    const change = (file: File) => {
      optionalCheck(file);
      later(file, takes('plan'), '{{checked}}');
    };
    // ACT
    const problems = problemsOf(load(change));
    // ASSERT
    expect(problems).toContain('The simple prompt of task "compare" has the unknown marker {{checked}}.');
  });

  it('refuses a required job in the same stage that needs an optional job', () => {
    // ARRANGE
    const change = (file: File) => {
      optionalCheck(file);
      file.stages[0]!.jobs.push({
        ...file.stages[0]!.jobs[0]!,
        id: 'after',
        output: 'after',
        needs: ['check'],
        slots: [],
      } as never);
    };
    // ACT
    const problems = problemsOf(load(change));
    // ASSERT
    expect(problems).toContain('Task "after" needs the optional task "check"');
  });

  it('refuses a required repeated stage that repeats over the output of an optional job', () => {
    // ARRANGE
    const change = (file: File) => {
      Object.assign(file.stages[0]!.jobs[0]!, { optional: true });
      file.stages[1]!.jobs[0]!.slots = [];
    };
    // ACT
    const problems = problemsOf(load(change));
    // ASSERT
    expect(problems).toContain('Stage "research" repeats over the output "plan" of the optional task "plan"');
  });

  it('refuses an optional stage that holds a required job', () => {
    // ARRANGE
    const change = (file: File) => Object.assign(file.stages[1]!, { optional: true });
    // ACT
    const problems = problemsOf(load(change));
    // ASSERT
    expect(problems).toContain('Stage "research" is optional, so its task "research" must be optional too');
  });

  it('loads an optional stage whose jobs are all optional, and lets a later optional stage take its output', () => {
    // ARRANGE
    const change = (file: File) => {
      Object.assign(file.stages[1]!, { optional: true });
      Object.assign(file.stages[1]!.jobs[0]!, { optional: true });
    };
    // ACT
    const result = load(change);
    // ASSERT
    expect(problemsOf(result)).toBe('');
    expect('file' in result && result.file.stages[1]?.optional).toBe(true);
  });

  it('refuses optional that is not true or false', () => {
    // ARRANGE
    const change = (file: File) => Object.assign(file.stages[0]!.jobs[0]!, { optional: 'yes' });
    // ACT
    const problems = problemsOf(load(change));
    // ASSERT
    expect(problems).toContain('stages[0].jobs[0].optional must be true or false.');
  });

  it('loads the skills a technical prompt calls and a second technical prompt with its own skills', () => {
    // ARRANGE
    const change = (file: File) =>
      Object.assign(research(file), {
        skills: ['grill-with-docs'],
        then: {
          skills: ['to-spec'],
          sections: [{ ...section, text: 'Write it to `.scratch/task/spec.md`, nowhere else.' }],
        },
      });
    // ACT
    const result = load(change);
    // ASSERT
    expect(problemsOf(result)).toBe('');
    expect('file' in result && result.file.stages[1]?.jobs[0]?.skills).toEqual(['grill-with-docs']);
  });

  it('loads a repeated stage that opts in to technical rounds, and lets its technical prompt name {{item}}', () => {
    // ARRANGE
    const change = (file: File) => {
      Object.assign(file.stages[1]!.foreach!, { technical: 'rounds' });
      research(file).do.technical = [{ ...section, text: 'Only {{item}} in {{plan}}.' }];
    };
    // ACT
    const problems = problemsOf(load(change));
    // ASSERT
    expect(problems).toBe('');
  });

  it('does not take a path, a URL or a word with a slash for a skill call', () => {
    // ARRANGE
    const text = 'Read .scratch/task/intent.md, see https://example.com/a/b, choose and/or stop, 1/2.';
    const change = (file: File) => void (research(file).do.technical = [{ ...section, text }]);
    // ACT
    const problems = problemsOf(load(change));
    // ASSERT
    expect(problems).toBe('');
  });

  it('takes a slash command inside backticks as text for the user, not a skill call', () => {
    // ARRANGE
    const text = 'End with one line: "Next: type `/to-spec` (or paste the second prompt)."';
    const change = (file: File) =>
      Object.assign(research(file), {
        do: { ...research(file).do, technical: [{ ...section, text }] },
        then: { skills: ['to-spec'], sections: [{ ...section, text: 'Then type `/research`.' }] },
      });
    // ACT
    const problems = problemsOf(load(change));
    // ASSERT
    expect(problems).toBe('');
  });
});

describe('failure cases', () => {
  it('rejects a chat button whose link is not https, whose icon is unknown, and an empty list', () => {
    // ARRANGE
    const buttons = (list: object[]) => (file: File) => void Object.assign(research(file), { openAIButtons: list });
    const insecure = buttons([{ label: 'Chat', url: 'http://example.com/', icon: null }]);
    const unknownIcon = buttons([{ label: 'Chat', url: 'https://example.com/', icon: 'sparkles' }]);
    const where = 'stages[1].jobs[0].openAIButtons';
    // ACT
    const [link, icon, empty] = [insecure, unknownIcon, buttons([])].map((change) => problemsOf(load(change)));
    // ASSERT
    expect(link).toContain(`${where}[0].url "http://example.com/" must start with https://.`);
    expect(icon).toContain(`${where}[0].icon is "sparkles", which is not one of chatgpt, gemini.`);
    expect(empty).toContain(`${where} needs at least 1 entries.`);
  });

  it('refuses a recommended model that is not high, medium or low', () => {
    // ARRANGE
    const change = (file: File) => void Object.assign(research(file), { recommendedModel: 'ultra' });
    // ACT
    const problems = problemsOf(load(change));
    // ASSERT
    expect(problems).toContain('stages[1].jobs[0].recommendedModel is "ultra", which is not one of high, medium, low.');
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

  it('reports a slot that takes what a checkbox job does not hand on', () => {
    // ARRANGE
    const change = (file: File) => {
      checking(file, { output: undefined, review: undefined });
      later(file, takes('checked'), '{{checked}}');
    };
    // ACT
    const problems = problemsOf(load(change));
    // ASSERT
    expect(problems).toContain('Slot "checked" of task "compare" names no output of an earlier stage.');
  });

  it('reports a doneLabel on a job that hands on an output', () => {
    // ARRANGE
    const change = (file: File) => checking(file, { doneLabel: 'Done.' });
    // ACT
    const problems = problemsOf(load(change));
    // ASSERT
    expect(problems).toContain('Task "check" has a doneLabel but hands on an output; only a checkbox job has one.');
  });

  it('reports a job that hands on an output but names no template and gives no example', () => {
    // ARRANGE
    const change = (file: File) =>
      checking(file, { template: undefined, details: { why: 'Because.', goodLooksLike: ['Clear.'] } });
    // ACT
    const problems = problemsOf(load(change));
    // ASSERT
    expect(problems).toContain('Task "check" hands on an output but names no template.');
    expect(problems).toContain('Task "check" hands on an output but gives no example.');
  });

  it('reports a blank slot that is not a free input', () => {
    // ARRANGE
    const blank = { id: 'plan', mode: 'single', label: 'Plan', blank: true };
    const change = (file: File) => void (research(file).slots[0] = blank as never);
    // ACT
    const problems = problemsOf(load(change));
    // ASSERT
    expect(problems).toContain('Slot "plan" of task "research" is blank but not a free input.');
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

  it('reports a stage that still uses the old move: key as an unknown field', () => {
    // ARRANGE
    const change = (file: File) => void Object.assign(file.stages[0]!, { move: 'B' });
    // ACT
    const problems = problemsOf(load(change));
    // ASSERT
    expect(problems).toContain('stages[0].move is not a field of the schema.');
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

  it('refuses a slash call written inside technical section text, naming the task and the call', () => {
    // ARRANGE
    const change = (file: File) =>
      void (research(file).do.technical = [{ ...section, text: 'Run /grilling on this.\n/to-spec then.' }]);
    // ACT
    const problems = problemsOf(load(change));
    // ASSERT
    expect(problems).toContain(
      'The technical prompt of task "research" calls /grilling in its text; name it in `skills`.',
    );
    expect(problems).toContain(
      'The technical prompt of task "research" calls /to-spec in its text; name it in `skills`.',
    );
  });

  it('refuses a slash call inside the sections of a second technical prompt', () => {
    // ARRANGE
    const change = (file: File) =>
      Object.assign(research(file), {
        then: { skills: ['to-spec'], sections: [{ ...section, text: 'Use /research.' }] },
      });
    // ACT
    const problems = problemsOf(load(change));
    // ASSERT
    expect(problems).toContain(
      'The second technical prompt of task "research" calls /research in its text; name it in `skills`.',
    );
  });

  it('refuses a skill name that is not a lowercase skill name', () => {
    // ARRANGE
    const change = (file: File) => Object.assign(research(file), { skills: ['/grilling', 'Write Spec'] });
    // ACT
    const problems = problemsOf(load(change));
    // ASSERT
    expect(problems).toContain(
      'Task "research" names the skill "/grilling"; write the name without the slash, lowercase.',
    );
    expect(problems).toContain(
      'Task "research" names the skill "Write Spec"; write the name without the slash, lowercase.',
    );
  });

  it('refuses {{item}} in a technical prompt of a stage that does not opt in to technical rounds', () => {
    // ARRANGE
    const change = (file: File) => void (research(file).do.technical = [{ ...section, text: 'Only {{item}}.' }]);
    // ACT
    const problems = problemsOf(load(change));
    // ASSERT
    expect(problems).toContain(
      'The technical prompt of task "research" names {{item}}, but stage "research" has no `foreach.technical: rounds`.',
    );
  });

  it('refuses a foreach.technical that is not rounds', () => {
    // ARRANGE
    const change = (file: File) => Object.assign(file.stages[1]!.foreach!, { technical: 'always' });
    // ACT
    const problems = problemsOf(load(change));
    // ASSERT
    expect(problems).toContain('stages[1].foreach.technical is "always", which is not one of rounds.');
  });

  it('reports {{item}} in a then prompt of a stage without technical rounds once, not as an unknown marker too', () => {
    // ARRANGE
    const then = { skills: ['to-spec'], sections: [{ ...section, text: 'Write {{item}}.' }] };
    const change = (file: File) => Object.assign(research(file), { then });
    const wanted = 'names {{item}}, but stage "research" has no `foreach.technical: rounds`';
    // ACT
    const lines = problemsOf(load(change)).split('\n');
    // ASSERT
    expect(lines.filter((line) => line.includes(wanted))).toHaveLength(1);
    expect(lines.filter((line) => line.includes('{{item}}'))).toHaveLength(1);
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

  it('reports a file that is valid YAML but not a mapping as shape problems', () => {
    // ARRANGE
    const source = '- just\n- a list\n';
    // ACT
    const problems = problemsOf(loadWorkflow(source));
    // ASSERT
    expect(problems).toMatch(/must be a mapping/);
  });

  it('loads two stages that hand on the same output and hold the same gate in opposite modes', () => {
    // ARRANGE
    const change = (file: File) => plannedTwice(file);
    // ACT
    const result = load(change);
    // ASSERT
    expect(problemsOf(result)).toBe('');
    expect('file' in result && result.file.stages.map((stage) => stage.only)).toEqual(['demo', 'full', undefined]);
  });

  it('refuses the same output on two stages when they can run together, marked the same or not at all', () => {
    // ARRANGE
    const same = (file: File) => plannedTwice(file, { quick: { only: 'full' } });
    const open = (file: File) => plannedTwice(file, { quick: { only: undefined } });
    // ACT
    const problems = [problemsOf(load(same)), problemsOf(load(open))];
    // ASSERT
    expect(problems[0]).toContain('The output "plan" is handed on by two tasks.');
    expect(problems[1]).toContain('The output "plan" is handed on by two tasks.');
  });

  it('refuses the same gate on two stages that can run together, naming it', () => {
    // ARRANGE
    const change = (file: File) => {
      Object.assign(file.stages[0]!, { gate: 1 });
      Object.assign(file.stages[1]!, { gate: 1 });
    };
    // ACT
    const problems = problemsOf(load(change));
    // ASSERT
    expect(problems).toContain('The gate 1 is held by two stages that can run together.');
  });

  it('still refuses a stage id or a task id used twice across opposite modes', () => {
    // ARRANGE
    const stageId = (file: File) => plannedTwice(file, { quick: { id: 'plan' } });
    const taskId = (file: File) =>
      plannedTwice(file, { quick: { jobs: [{ ...file.stages[0]!.jobs[0]!, id: 'plan' }] } });
    // ACT
    const problems = [problemsOf(load(stageId)), problemsOf(load(taskId))];
    // ASSERT
    expect(problems[0]).toContain('The stage id "plan" is used twice.');
    expect(problems[1]).toContain('The task id "plan" is used twice.');
  });

  it('checks dependencies per mode: a slot taking an output that exists only in the other mode is refused', () => {
    // ARRANGE
    const change = (file: File) => {
      Object.assign(file.stages[0]!, { only: 'full' });
      Object.assign(file.stages[0]!.jobs[0]!, { output: 'plan' });
      Object.assign(file.stages[1]!, { only: 'demo' });
    };
    // ACT
    const problems = problemsOf(load(change));
    // ASSERT
    expect(problems).toContain('Stage "research" repeats over "plan#pieces", but no earlier stage hands on "plan".');
    expect(problems).toContain('Slot "plan" of task "research" names no output of an earlier stage.');
  });

  it('reports a problem of a mode-marked stage once, not once per mode', () => {
    // ARRANGE
    const change = (file: File) => Object.assign(file.stages[1]!.jobs[0]!, { template: 'missing' });
    // ACT
    const problems = problemsOf(load(change)).split('\n');
    // ASSERT
    expect(problems.filter((line) => line.includes('unknown template "missing"'))).toHaveLength(1);
  });

  it('refuses an `only` that is neither demo nor full', () => {
    // ARRANGE
    const change = (file: File) => Object.assign(file.stages[0]!, { only: 'always' });
    // ACT
    const problems = problemsOf(load(change));
    // ASSERT
    expect(problems).toContain('stages[0].only is "always", which is not one of demo, full.');
  });
});

function plannedTwice(file: File, over: { quick?: object; thorough?: object } = {}): void {
  const [plan] = file.stages;
  const quick = {
    ...plan!,
    id: 'plan-quick',
    only: 'demo',
    gate: 1,
    jobs: [{ ...plan!.jobs[0]!, id: 'plan-quick' }],
    ...over.quick,
  };
  Object.assign(plan!, { only: 'full', gate: 1, ...over.thorough });
  file.stages.splice(0, 0, quick as never);
}
