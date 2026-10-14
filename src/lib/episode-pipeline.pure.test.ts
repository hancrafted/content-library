import { describe, expect, it } from 'vitest';
import { checkPipeline, type PipelineContext } from './episode-pipeline.pure';

/*
 * In-memory pipelines: a small one that passes, then one change per test that
 * breaks exactly one schema rule. The context is a hand-written stand-in for
 * the disk: the skills that exist and the repo paths that exist.
 */

const SKILL_FOLDER = 'skills/new-episode';

const CONTEXT: PipelineContext = {
  skillFolder: SKILL_FOLDER,
  skills: ['grilling', 'research', 'implement-spec', 'code-review', 'tdd', 'handoff'],
  disabled: ['handoff'],
  exists: (path) => [`${SKILL_FOLDER}/references/research.md`, 'docs/agents/grilling-voice.md'].includes(path),
  staging: 'docs/episodes/demo',
  perRun: false,
  governs: (output) =>
    [
      'docs/episodes/demo/brief.md',
      'docs/episodes/demo/research/*/research.md',
      'docs/episodes/demo/dossier.md',
    ].includes(output),
};

const PIPELINE = `status: draft
jobs:
  - id: brief-grill
    needs: []
    before: [mh-query]
    outputs: [docs/episodes/demo/brief.md]
    checks: [mh]
    retries: 0
    gate: human
    agents:
      - { type: implementor, skills: [grilling], references: [docs/agents/grilling-voice.md], model: inherit }
  - id: research
    needs: [brief-grill]
    isolation: worktree
    foreach: docs/episodes/demo/brief.md#research-questions
    before: [mh-query]
    outputs: [docs/episodes/demo/research/*/research.md]
    checks: [mh, vitest]
    retries: 2
    agents:
      - { type: implementor, skills: [research], references: [references/research.md, docs/episodes/demo/brief.md], model: inherit }
      - { type: reviewer, skills: [], references: [references/research.md], rubric: references/research.md#rubric, model: inherit }
`;

const FILE = 'pipeline.yml';

/** A template commit, as a per-run pipeline's `template` names it. */
const SHA = '6426e9c5b0c0f0e1d2a3b4c5d6e7f8091a2b3c4d';

function check(yaml: string, context: PipelineContext = CONTEXT): string[] {
  return checkPipeline(FILE, yaml, context).map(({ message }) => message);
}

describe('success cases', () => {
  it('finds nothing in a pipeline whose keys, edges, skills and paths all hold', () => {
    // ARRANGE
    const yaml = PIPELINE;
    // ACT
    const findings = checkPipeline(FILE, yaml, CONTEXT);
    // ASSERT
    expect(findings).toEqual([]);
  });

  it('accepts a plugin skill the context does not list', () => {
    // ARRANGE
    const yaml = PIPELINE.replace('skills: [research]', 'skills: [research, ui-ux-pro-max:slides]');
    // ACT
    const messages = check(yaml);
    // ASSERT
    expect(messages).toEqual([]);
  });

  it('accepts a ticket block on an implementor, and the checks sources and impeccable', () => {
    // ARRANGE
    const yaml = PIPELINE.replace(
      '{ type: implementor, skills: [research],',
      '{ type: implementor, ticket: { agent: archgate:developer, skills: [tdd, ui-ux-pro-max:slides] }, skills: [research],',
    ).replace('checks: [mh, vitest]', 'checks: [mh, vitest, sources, impeccable]');
    // ACT
    const messages = check(yaml);
    // ASSERT
    expect(messages).toEqual([]);
  });
});

describe('failure cases', () => {
  it('rejects a top-level status other than draft or approved', () => {
    // ARRANGE
    const yaml = PIPELINE.replace('status: draft', 'status: checked');
    const expected = ['The pipeline has status "checked"; it must be draft or approved.'];
    // ACT
    const messages = check(yaml);
    // ASSERT
    expect(messages).toEqual(expected);
  });

  it('rejects an unknown key at the top, on a job and on an agent', () => {
    // ARRANGE
    const yaml = PIPELINE.replace('status: draft', 'status: draft\nowner: han')
      .replace('    retries: 2', '    retry: 2')
      .replace('skills: [grilling],', 'skill: [grilling],');
    const expected = [
      'The pipeline has an unknown key "owner"; the keys are status, jobs, template.',
      'Job "brief-grill", agent 1 lacks the key "skills".',
      'Job "brief-grill", agent 1 has an unknown key "skill"; the keys are type, skills, references, rubric, agent, ticket, model, session.',
      'Job "research" lacks the key "retries".',
      'Job "research" has an unknown key "retry"; the keys are id, intent, needs, wants, isolation, foreach, before, outputs, checks, retries, gate, agents.',
    ];
    // ACT
    const messages = check(yaml);
    // ASSERT
    expect(messages).toEqual(expected);
  });

  it('rejects a needs that names no job', () => {
    // ARRANGE
    const yaml = PIPELINE.replace('needs: [brief-grill]', 'needs: [brief-gril]');
    const unreachable = 'which job "brief-grill" writes, but "research" neither needs nor wants it.';
    const expected = [
      'Job "research" needs "brief-gril", which is no job in the pipeline.',
      `Job "research" foreach reads "docs/episodes/demo/brief.md#research-questions", ${unreachable}`,
      `Job "research", agent 1 reads "docs/episodes/demo/brief.md", ${unreachable}`,
    ];
    // ACT
    const messages = check(yaml);
    // ASSERT
    expect(messages).toEqual(expected);
  });

  it('rejects a cycle in the needs graph', () => {
    // ARRANGE
    const yaml = PIPELINE.replace('    needs: []', '    needs: [research]');
    const expected = ['The needs graph has a cycle: brief-grill → research → brief-grill.'];
    // ACT
    const messages = check(yaml);
    // ASSERT
    expect(messages).toEqual(expected);
  });

  it('rejects a reference file that does not exist', () => {
    // ARRANGE
    const yaml = PIPELINE.replace(
      'references: [references/research.md, docs/episodes/demo/brief.md]',
      'references: [references/reserch.md, docs/episodes/demo/brief.md]',
    );
    const expected = [
      `Job "research", agent 1 reads "references/reserch.md", which resolves to ${SKILL_FOLDER}/references/reserch.md, no existing file.`,
    ];
    // ACT
    const messages = check(yaml);
    // ASSERT
    expect(messages).toEqual(expected);
  });

  it('rejects a rubric whose file does not exist', () => {
    // ARRANGE
    const yaml = PIPELINE.replace('rubric: references/research.md#rubric', 'rubric: references/rubric.md#rubric');
    const expected = [
      `Job "research", agent 2 reads "references/rubric.md#rubric", which resolves to ${SKILL_FOLDER}/references/rubric.md, no existing file.`,
    ];
    // ACT
    const messages = check(yaml);
    // ASSERT
    expect(messages).toEqual(expected);
  });

  it('rejects an unknown skill name', () => {
    // ARRANGE
    const yaml = PIPELINE.replace('skills: [research]', 'skills: [reserch]');
    const expected = ['Job "research", agent 1 names the skill "reserch", which does not exist.'];
    // ACT
    const messages = check(yaml);
    // ASSERT
    expect(messages).toEqual(expected);
  });

  it('rejects a skill that disables model invocation, in skills and in ticket.skills', () => {
    // ARRANGE
    const yaml = PIPELINE.replace('skills: [research],', 'skills: [handoff], ticket: { agent: x, skills: [handoff] },');
    const why = 'which sets disable-model-invocation: true; the Skill tool refuses it for every agent.';
    const expected = [
      `Job "research", agent 1 names the skill "handoff", ${why}`,
      `Job "research", agent 1 ticket names the skill "handoff", ${why}`,
    ];
    // ACT
    const messages = check(yaml);
    // ASSERT
    expect(messages).toEqual(expected);
  });

  it('rejects an unknown ticket skill, a ticket without skills and a ticket on a reviewer', () => {
    // ARRANGE
    const unknown = PIPELINE.replace(
      'skills: [research],',
      'skills: [research], ticket: { agent: x, skills: [tdd2] },',
    );
    const bare = PIPELINE.replace('skills: [research],', 'skills: [research], ticket: { agent: x },');
    const reviewer = PIPELINE.replace(
      '{ type: reviewer, skills: [],',
      '{ type: reviewer, ticket: { agent: x, skills: [] }, skills: [],',
    );
    // ACT
    const messages = [check(unknown), check(bare), check(reviewer)];
    // ASSERT
    expect(messages).toEqual([
      ['Job "research", agent 1 ticket names the skill "tdd2", which does not exist.'],
      ['Job "research", agent 1 ticket lacks the key "skills".'],
      ['Job "research", agent 2 is a reviewer and has a ticket; only an implementor has one.'],
    ]);
  });

  it('rejects a staging file read before the job that writes it', () => {
    // ARRANGE
    const yaml = PIPELINE.replace('needs: [brief-grill]', 'needs: []');
    const unreachable = 'which job "brief-grill" writes, but "research" neither needs nor wants it.';
    const expected = [
      `Job "research" foreach reads "docs/episodes/demo/brief.md#research-questions", ${unreachable}`,
      `Job "research", agent 1 reads "docs/episodes/demo/brief.md", ${unreachable}`,
      'Job "brief-grill" may run beside another job but lacks isolation: worktree; each parallel job checks and merges from its own worktree.',
    ];
    // ACT
    const messages = check(yaml);
    // ASSERT
    expect(messages).toEqual(expected);
  });

  it('rejects a reviewer without a rubric and an implementor with one', () => {
    // ARRANGE
    const yaml = PIPELINE.replace(', rubric: references/research.md#rubric', '').replace(
      'references: [references/research.md, docs/episodes/demo/brief.md], model: inherit',
      'references: [references/research.md, docs/episodes/demo/brief.md], rubric: references/research.md#rubric, model: inherit',
    );
    const expected = [
      'Job "research", agent 1 is an implementor and has a rubric; only a reviewer has one.',
      'Job "research", agent 2 lacks the key "rubric".',
    ];
    // ACT
    const messages = check(yaml);
    // ASSERT
    expect(messages).toEqual(expected);
  });

  it('rejects a bad value type, gate, agent type, model and a duplicate job id', () => {
    // ARRANGE
    const yaml = PIPELINE.replace('retries: 0', 'retries: -1')
      .replace('gate: human', 'gate: auto')
      .replace('{ type: reviewer', '{ type: critic')
      .replace('[docs/agents/grilling-voice.md], model: inherit', '[docs/agents/grilling-voice.md], model: gpt')
      .replace('id: research', 'id: brief-grill')
      .replace('needs: [brief-grill]', 'needs: []');
    const expected = [
      'Job "brief-grill" has retries -1; it must be a whole number of 0 or more.',
      'Job "brief-grill" has gate "auto"; the only gate is human.',
      'Job "brief-grill", agent 1 has model "gpt"; it must be opus, sonnet, haiku or inherit.',
      'The job id "brief-grill" appears twice; job ids are unique.',
      'Job "brief-grill", agent 2 has type "critic"; it must be implementor or reviewer.',
    ];
    // ACT
    const messages = check(yaml);
    // ASSERT
    expect(messages).toEqual(expect.arrayContaining(expected));
  });

  it('rejects an agent without a model, a session other than subagent or orchestrator, and an agent type that is no name', () => {
    // ARRANGE
    const yaml = PIPELINE.replace('[docs/agents/grilling-voice.md], model: inherit', '[docs/agents/grilling-voice.md]')
      .replace(
        '[references/research.md, docs/episodes/demo/brief.md], model: inherit',
        '[references/research.md, docs/episodes/demo/brief.md], model: inherit, session: main',
      )
      .replace(
        'rubric: references/research.md#rubric, model: inherit',
        'rubric: references/research.md#rubric, model: inherit, agent: 3',
      );
    const expected = [
      'Job "brief-grill", agent 1 lacks the key "model".',
      'Job "research", agent 1 has session "main"; it must be subagent or orchestrator.',
      'Job "research", agent 2 has agent 3; it must be a Claude Code agent type.',
    ];
    // ACT
    const messages = check(yaml);
    // ASSERT
    expect(messages).toEqual(expected);
  });

  it('rejects a skill that spawns subagents in an agent that runs as a subagent', () => {
    // ARRANGE
    const yaml = PIPELINE.replace('skills: [research]', 'skills: [research, implement-spec]').replace(
      '{ type: reviewer, skills: []',
      '{ type: reviewer, skills: [code-review], session: subagent',
    );
    const expected = [
      'Job "research", agent 1 names the skill "implement-spec", which spawns subagents; the agent needs session: orchestrator.',
      'Job "research", agent 2 names the skill "code-review", which spawns subagents; the agent needs session: orchestrator.',
    ];
    // ACT
    const messages = check(yaml);
    // ASSERT
    expect(messages).toEqual(expected);
  });

  it('rejects an intent that is no text', () => {
    // ARRANGE
    const yaml = PIPELINE.replace('  - id: research\n', '  - id: research\n    intent: [research]\n');
    const expected = ['Job "research" has intent ["research"]; it must be the task, written as a prompt.'];
    // ACT
    const messages = check(yaml);
    // ASSERT
    expect(messages).toEqual(expected);
  });

  it('rejects a markdown output that no markdown-harness rule governs', () => {
    // ARRANGE
    const yaml = PIPELINE.replace(
      'outputs: [docs/episodes/demo/brief.md]',
      'outputs: [docs/episodes/demo/brief.md, docs/episodes/demo/notes.md, docs/episodes/demo/pipeline.yml]',
    );
    const expected = [
      'Job "brief-grill" writes "docs/episodes/demo/notes.md", which no markdown-harness rule governs; its implementor would query no intents.',
    ];
    // ACT
    const messages = check(yaml);
    // ASSERT
    expect(messages).toEqual(expected);
  });

  it('rejects a job that writes markdown without querying its intents first', () => {
    // ARRANGE
    const yaml = PIPELINE.replace('    before: [mh-query]\n', '');
    const expected = [
      'Job "brief-grill" writes markdown but lacks before: [mh-query]; its implementor queries each output\'s intents before writing it.',
    ];
    // ACT
    const messages = check(yaml);
    // ASSERT
    expect(messages).toEqual(expected);
  });

  it('rejects a before step that is no known step, and mh-query on a job that writes no markdown', () => {
    // ARRANGE
    const yaml = PIPELINE.replace('    before: [mh-query]\n', '    before: [lint]\n').replace(
      'outputs: [docs/episodes/demo/research/*/research.md]',
      'outputs: [docs/episodes/demo/research/*/research.json]',
    );
    const expected = [
      'Job "brief-grill" has before ["lint"]; the steps are mh-query.',
      'Job "research" has before: [mh-query] but writes no markdown, so it has nothing to query.',
    ];
    // ACT
    const messages = check(yaml);
    // ASSERT
    expect(messages).toEqual(expect.arrayContaining(expected));
  });

  it("rejects an output outside the pipeline's staging folder", () => {
    // ARRANGE
    const yaml = PIPELINE.replace('outputs: [docs/episodes/demo/brief.md]', 'outputs: [docs/episodes/dmeo/brief.md]');
    const expected =
      'Job "brief-grill" writes "docs/episodes/dmeo/brief.md", outside its staging folder docs/episodes/demo.';
    // ACT
    const messages = check(yaml);
    // ASSERT
    expect(messages).toContain(expected);
  });

  it('rejects a foreach and a glob output in a per-run pipeline, whose jobs name one file each', () => {
    // ARRANGE
    const yaml = PIPELINE.replace('status: draft', `status: draft\ntemplate: ${SHA}`);
    const expected = [
      'Job "research" has foreach; a per-run pipeline names one job per item, which customize-pipeline expands.',
      'Job "research" writes "docs/episodes/demo/research/*/research.md", a glob; a per-run pipeline names each file.',
    ];
    // ACT
    const messages = check(yaml, { ...CONTEXT, perRun: true });
    // ASSERT
    expect(messages).toEqual(expected);
  });

  it('rejects a check that is not one of the named kinds', () => {
    // ARRANGE
    const yaml = PIPELINE.replace('checks: [mh, vitest]', 'checks: [mh, vitests]');
    const expected = [
      'Job "research" has the check "vitests"; the checks are mh, vitest, sources, impeccable, verify, build, test:build, visual-check.',
    ];
    // ACT
    const messages = check(yaml);
    // ASSERT
    expect(messages).toEqual(expected);
  });

  it('rejects a wants that names no job, a cycle through wants, and an isolation other than worktree', () => {
    // ARRANGE
    const yaml = PIPELINE.replace('    needs: []', '    needs: []\n    wants: [research]')
      .replace('    needs: [brief-grill]', '    needs: [brief-grill]\n    wants: [retrieval]')
      .replace('isolation: worktree', 'isolation: container');
    const expected = [
      'Job "research" has isolation "container"; it must be worktree.',
      'Job "research" wants "retrieval", which is no job in the pipeline.',
      'The needs graph has a cycle: brief-grill → research → brief-grill.',
    ];
    // ACT
    const messages = check(yaml);
    // ASSERT
    expect(messages).toEqual(expected);
  });

  it('rejects a per-run pipeline without the template commit it was tailored from, and a template that names one', () => {
    // ARRANGE
    const perRun = PIPELINE.replace('    foreach: docs/episodes/demo/brief.md#research-questions\n', '').replace(
      'research/*/research.md',
      'research/AIE-0001__why-recall-degrades/research.md',
    );
    const template = PIPELINE.replace('status: draft', `status: draft\ntemplate: ${SHA}`);
    const badSha = perRun.replace('status: draft', 'status: draft\ntemplate: main');
    const missing = ['The pipeline lacks template; a per-run pipeline names the template commit it was tailored from.'];
    const stray = [
      'The pipeline has template; only a per-run pipeline names the template commit it was tailored from.',
    ];
    const notSha = ['The pipeline has template "main"; it must be a commit sha.'];
    // ACT
    const governs = (): boolean => true;
    const perRunMessages = check(perRun, { ...CONTEXT, perRun: true, governs });
    const templateMessages = check(template);
    const badShaMessages = check(badSha, { ...CONTEXT, perRun: true, governs });
    // ASSERT
    expect(perRunMessages).toEqual(missing);
    expect(templateMessages).toEqual(stray);
    expect(badShaMessages).toEqual(notSha);
  });
});

describe('edge cases', () => {
  it('accepts a needs graph with a diamond, which is no cycle', () => {
    // ARRANGE
    const job = (id: string, needs: string): string =>
      `  - { id: ${id}, needs: [${needs}], isolation: worktree, outputs: [], checks: [], retries: 0, agents: [{ type: implementor, skills: [], references: [], model: inherit }] }`;
    const yaml = ['status: approved', 'jobs:', job('a', ''), job('b', 'a'), job('c', 'a'), job('d', 'b, c'), ''].join(
      '\n',
    );
    // ACT
    const findings = checkPipeline(FILE, yaml, CONTEXT);
    // ASSERT
    expect(findings).toEqual([]);
  });

  it('resolves a staging file the job reads through a transitive need, and a foreach file the same way', () => {
    // ARRANGE
    const yaml = PIPELINE.concat(
      [
        '  - id: consolidate',
        '    needs: [research]',
        '    isolation: worktree',
        '    foreach: docs/episodes/demo/brief.md#research-questions',
        '    before: [mh-query]',
        '    outputs: [docs/episodes/demo/dossier.md]',
        '    checks: []',
        '    retries: 1',
        '    agents:',
        '      - { type: implementor, skills: [], references: [docs/episodes/demo/brief.md, docs/episodes/demo/research/*/research.md], model: inherit }',
        '',
      ].join('\n'),
    );
    // ACT
    const findings = checkPipeline(FILE, yaml, CONTEXT);
    // ASSERT
    expect(findings).toEqual([]);
  });

  it('accepts a skill that spawns subagents in an agent that runs in the orchestrator session', () => {
    // ARRANGE
    const yaml = PIPELINE.replace(
      '{ type: reviewer, skills: []',
      '{ type: reviewer, skills: [code-review], session: orchestrator',
    );
    // ACT
    const findings = checkPipeline(FILE, yaml, CONTEXT);
    // ASSERT
    expect(findings).toEqual([]);
  });

  it('accepts a job that states its task as an intent', () => {
    // ARRANGE
    const yaml = PIPELINE.replace(
      '  - id: research\n',
      '  - id: research\n    intent: Answer one research question.\n',
    );
    // ACT
    const findings = checkPipeline(FILE, yaml, CONTEXT);
    // ASSERT
    expect(findings).toEqual([]);
  });

  it('tolerates a missing path the context lists as pending, and only that one', () => {
    // ARRANGE
    const pending = [`${SKILL_FOLDER}/references/reserch.md`];
    const yaml = PIPELINE.replace(
      'references: [references/research.md, docs/episodes/demo/brief.md]',
      'references: [references/reserch.md, docs/episodes/demo/brief.md]',
    );
    // ACT
    const findings = checkPipeline(FILE, yaml, { ...CONTEXT, pending });
    // ASSERT
    expect(findings).toEqual([]);
  });

  it('reports YAML that does not parse as one finding instead of throwing', () => {
    // ARRANGE
    const yaml = 'status: draft\njobs: [\n';
    const expectedKinds = ['pipeline'];
    // ACT
    const findings = checkPipeline(FILE, yaml, CONTEXT);
    // ASSERT
    expect(findings.map(({ kind }) => kind)).toEqual(expectedKinds);
  });
  it('resolves a staging file the job reads through a wants edge, as through a needs edge', () => {
    // ARRANGE
    const yaml = PIPELINE.concat(
      [
        '  - id: write-dossier',
        '    needs: [brief-grill]',
        '    wants: [research]',
        '    before: [mh-query]',
        '    outputs: [docs/episodes/demo/dossier.md]',
        '    checks: []',
        '    retries: 1',
        '    agents:',
        '      - { type: implementor, skills: [], references: [docs/episodes/demo/research/*/research.md], model: inherit }',
        '',
      ].join('\n'),
    );
    // ACT
    const findings = checkPipeline(FILE, yaml, CONTEXT);
    // ASSERT
    expect(findings).toEqual([]);
  });
});
