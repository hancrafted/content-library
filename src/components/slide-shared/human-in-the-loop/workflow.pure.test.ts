import { describe, expect, it } from 'vitest';
import { parse, stringify } from 'yaml';
import { loadWorkflow } from './workflow.pure';

const BLOCK = (kind: string, rest: string) => '```handoff\nkind: ' + kind + '\n' + rest + '\n```';
const TEXT = BLOCK('text', 'text: hi');

/** A small sound Workflow: two stages, a pasted input, an example output of its kind. */
interface JobFx {
  id: string;
  chat: string;
  dependsOn: string[];
  inputs: string[];
  outputs: { id: string; kind: string }[];
  skills: string[];
  fanOut?: number;
}
interface JobWords {
  title: string;
  description: string;
  prompt: string;
  exampleInput?: string;
  exampleOutput?: string;
}
interface Fixture {
  config: { id: string; focalJob: string; stages: { id: string; move?: string; gate?: number; jobs: JobFx[] }[] };
  words: {
    title: string;
    scenario: string;
    stages: Record<string, { name: string; move?: string }>;
    jobs: { ask: JobWords; write: JobWords; other?: JobWords };
  };
}

function base(): Fixture {
  const config = {
    id: 'demo',
    focalJob: 'ask',
    stages: [
      {
        id: 'first',
        move: 'I',
        jobs: [
          {
            id: 'ask',
            chat: 'new',
            dependsOn: [],
            inputs: [],
            outputs: [{ id: 'answers', kind: 'text' }],
            skills: ['productivity/grilling'],
          },
        ],
      },
      {
        id: 'second',
        gate: 1,
        jobs: [
          {
            id: 'write',
            chat: 'new',
            dependsOn: ['ask'],
            inputs: ['answers'],
            outputs: [{ id: 'spec', kind: 'text' }],
            fanOut: 3,
            skills: [],
          },
        ],
      },
    ],
  };
  const job = (prompt: string, extra: object) => ({ title: 'T', description: 'D', prompt, ...extra });
  const words = {
    title: 'Demo',
    scenario: 'One sentence.',
    stages: { first: { name: 'First', move: 'Ask' }, second: { name: 'Second' } },
    jobs: {
      ask: job('Ask me. Reply with a handoff block.', { exampleOutput: TEXT }),
      write: job('Use {{answers}}. Reply with a handoff block.', { exampleInput: TEXT, exampleOutput: TEXT }),
    },
  };
  return { config, words };
}

const load = (config: object, words: object, localeWords: object = words) =>
  loadWorkflow(stringify({ ...config, words }), stringify({ words: localeWords }));
const problemsOf = (result: ReturnType<typeof loadWorkflow>) => ('problems' in result ? result.problems : []);

describe('success cases', () => {
  it('loads a sound pair into stages, jobs and their words', () => {
    // ARRANGE
    const { config, words } = base();
    // ACT
    const result = load(config, words);
    const fanOut = 3;
    // ASSERT
    expect(problemsOf(result)).toEqual([]);
    const [first, second] = 'workflow' in result ? result.workflow.stages : [];
    expect(first?.jobs[0]?.skills).toEqual([{ group: 'productivity', name: 'grilling' }]);
    expect(second?.jobs[0]).toMatchObject({ id: 'write', fanOut, inputs: ['answers'], title: 'T' });
    expect([first?.id, second?.id]).toEqual(['first', 'second']);
  });

  it('lets the locale words win over the config words, and an override over both', () => {
    // ARRANGE
    const { config, words } = base();
    const german = { ...words, title: 'Titel' };
    const override = { stages: { second: { name: 'Slide says' } } };
    // ACT
    const result = loadWorkflow(stringify({ ...config, words }), stringify({ words: german }), override);
    // ASSERT
    const flow = 'workflow' in result ? result.workflow : undefined;
    expect(flow?.title).toBe('Titel');
    expect(flow?.stages[1]?.name).toBe('Slide says');
    expect(flow?.stages[0]?.name).toBe('First');
  });
});

describe('failure cases', () => {
  it('reports a job that depends on a later stage', () => {
    // ARRANGE
    const { config, words } = base();
    config.stages[0]!.jobs[0]!.dependsOn = ['write'];
    // ACT
    const problems = problemsOf(load(config, words));
    // ASSERT
    expect(problems.some((problem) => problem.includes('later stage'))).toBe(true);
  });

  it('reports a cycle', () => {
    // ARRANGE
    const { config, words } = base();
    config.stages[1]!.jobs.push({ ...config.stages[1]!.jobs[0]!, id: 'other', dependsOn: ['write'] });
    config.stages[1]!.jobs[0]!.dependsOn = ['other'];
    words.jobs.other = words.jobs.write;
    // ACT
    const problems = problemsOf(load(config, words));
    // ASSERT
    expect(problems.some((problem) => problem.toLowerCase().includes('cycle'))).toBe(true);
  });

  it('reports a dependency on a job that does not exist and a repeated job id', () => {
    // ARRANGE
    const { config, words } = base();
    config.stages[1]!.jobs[0]!.dependsOn = ['ghost'];
    config.stages[0]!.jobs.push({ ...config.stages[0]!.jobs[0]! });
    // ACT
    const problems = problemsOf(load(config, words));
    // ASSERT
    expect(problems.some((problem) => problem.includes('ghost'))).toBe(true);
    expect(problems.some((problem) => problem.includes('twice'))).toBe(true);
  });

  it('reports an input no earlier job produces', () => {
    // ARRANGE
    const { config, words } = base();
    config.stages[1]!.jobs[0]!.inputs = ['nowhere'];
    words.jobs.write.prompt = 'Use {{nowhere}}.';
    // ACT
    const problems = problemsOf(load(config, words));
    // ASSERT
    expect(problems.some((problem) => problem.includes('nowhere'))).toBe(true);
  });

  it('reports an input with no paste slot and a slot naming no input', () => {
    // ARRANGE
    const { config, words } = base();
    words.jobs.write.prompt = 'Use {{stranger}}.';
    // ACT
    const problems = problemsOf(load(config, words));
    // ASSERT
    expect(problems.some((problem) => problem.includes('{{answers}}'))).toBe(true);
    expect(problems.some((problem) => problem.includes('{{stranger}}'))).toBe(true);
  });

  it('reports an example that does not parse for its kind', () => {
    // ARRANGE
    const { config, words } = base();
    config.stages[0]!.jobs[0]!.outputs[0].kind = 'spec';
    // ACT
    const problems = problemsOf(load(config, words));
    // ASSERT
    expect(problems.some((problem) => problem.includes('exampleOutput') && problem.includes('spec'))).toBe(true);
  });

  it('reports a job after the first that starts from no example input', () => {
    // ARRANGE
    const { config, words } = base();
    delete words.jobs.write.exampleInput;
    // ACT
    const problems = problemsOf(load(config, words));
    // ASSERT
    expect(problems.some((problem) => problem.includes('exampleInput'))).toBe(true);
  });

  it('reports a page that lacks its Simple or its Technical prompt', () => {
    // ARRANGE
    const { config, words } = base();
    Object.assign(words.jobs.write, { page: { simple: 'One HTML file.' } });
    // ACT
    const problems = problemsOf(load(config, words));
    // ASSERT
    expect(problems.some((problem) => problem.includes('"write"') && problem.includes('words.page.technical'))).toBe(
      true,
    );
  });

  it('reports a key the locale words lack, and one the config lacks', () => {
    // ARRANGE
    const { config, words } = base();
    const without = { ...words, title: undefined };
    const extra = { ...words, bonus: 'x' };
    // ACT
    const lacking = problemsOf(load(config, words, without));
    const surplus = problemsOf(load(config, words, extra));
    // ASSERT
    expect(lacking.some((problem) => problem.includes('"title"'))).toBe(true);
    expect(surplus.some((problem) => problem.includes('"bonus"'))).toBe(true);
  });

  it('reports a skill that is not group/name', () => {
    // ARRANGE
    const { config, words } = base();
    config.stages[0]!.jobs[0]!.skills = ['Grilling'];
    // ACT
    const problems = problemsOf(load(config, words));
    // ASSERT
    expect(problems.some((problem) => problem.includes('Grilling'))).toBe(true);
  });

  it('reports every problem at once', () => {
    // ARRANGE
    const { config, words } = base();
    config.stages[0]!.jobs[0]!.skills = ['Grilling'];
    config.stages[1]!.jobs[0]!.fanOut = 1;
    const found = 2;
    // ACT
    const problems = problemsOf(load(config, words));
    // ASSERT
    expect(problems.length).toBeGreaterThanOrEqual(found);
  });
});

describe('edge cases', () => {
  it('answers a problem for text that is not YAML or not a mapping', () => {
    // ARRANGE
    const broken = 'stages: [';
    const list = '- a';
    // ACT
    const first = problemsOf(loadWorkflow(broken, broken));
    const second = problemsOf(loadWorkflow(list, list));
    // ASSERT
    expect(first.length).toBeGreaterThan(0);
    expect(second.length).toBeGreaterThan(0);
  });

  it('is the identity for a config that parses back from its own YAML', () => {
    // ARRANGE
    const { config, words } = base();
    const text = stringify({ ...config, words });
    // ACT
    const result = loadWorkflow(text, text);
    // ASSERT
    expect(parse(text).id).toBe('demo');
    expect('workflow' in result).toBe(true);
  });
});
