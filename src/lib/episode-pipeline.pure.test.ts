import { describe, expect, it } from 'vitest';
import { checkPipeline, type PipelineContext } from './episode-pipeline.pure';

/*
 * In-memory pipelines: a small one that passes, then one change per test that
 * breaks exactly one schema rule. The context is a hand-written stand-in for
 * the disk: the skills that exist and the repo paths that exist.
 */

const SKILL_FOLDER = '.agents/skills/new-episode';

const CONTEXT: PipelineContext = {
  skillFolder: SKILL_FOLDER,
  skills: ['grilling', 'research'],
  exists: (path) => [`${SKILL_FOLDER}/references/research.md`, 'docs/agents/episode-brief-grill.md'].includes(path),
};

const PIPELINE = `status: draft
jobs:
  - id: brief-grill
    needs: []
    outputs: [brief.md]
    checks: [mh]
    retries: 0
    gate: human
    agents:
      - { type: implementor, skills: [grilling], references: [docs/agents/episode-brief-grill.md], profile: ~ }
  - id: research
    needs: [brief-grill]
    foreach: brief.md#research-questions
    outputs: [research/*/research.md]
    checks: [mh, vitest]
    retries: 2
    agents:
      - { type: implementor, skills: [research], references: [references/research.md, brief.md], profile: ~ }
      - { type: reviewer, skills: [], references: [references/research.md], rubric: references/research.md#rubric, profile: ~ }
`;

const FILE = 'pipeline.yml';

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
      'The pipeline has an unknown key "owner"; the keys are status, jobs.',
      'Job "brief-grill", agent 1 lacks the key "skills".',
      'Job "brief-grill", agent 1 has an unknown key "skill"; the keys are type, skills, references, rubric, profile.',
      'Job "research" lacks the key "retries".',
      'Job "research" has an unknown key "retry"; the keys are id, needs, foreach, outputs, checks, retries, gate, agents.',
    ];
    // ACT
    const messages = check(yaml);
    // ASSERT
    expect(messages).toEqual(expected);
  });

  it('rejects a needs that names no job', () => {
    // ARRANGE
    const yaml = PIPELINE.replace('needs: [brief-grill]', 'needs: [brief-gril]');
    const unreachable = 'which job "brief-grill" writes, but "research" does not need it.';
    const expected = [
      'Job "research" needs "brief-gril", which is no job in the pipeline.',
      `Job "research" foreach reads "brief.md#research-questions", ${unreachable}`,
      `Job "research", agent 1 reads "brief.md", ${unreachable}`,
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
      'references: [references/research.md, brief.md]',
      'references: [references/reserch.md, brief.md]',
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

  it('rejects a staging file read before the job that writes it', () => {
    // ARRANGE
    const yaml = PIPELINE.replace('needs: [brief-grill]', 'needs: []');
    const unreachable = 'which job "brief-grill" writes, but "research" does not need it.';
    const expected = [
      `Job "research" foreach reads "brief.md#research-questions", ${unreachable}`,
      `Job "research", agent 1 reads "brief.md", ${unreachable}`,
    ];
    // ACT
    const messages = check(yaml);
    // ASSERT
    expect(messages).toEqual(expected);
  });

  it('rejects a reviewer without a rubric and an implementor with one', () => {
    // ARRANGE
    const yaml = PIPELINE.replace(', rubric: references/research.md#rubric', '').replace(
      'references: [references/research.md, brief.md], profile: ~',
      'references: [references/research.md, brief.md], rubric: references/research.md#rubric, profile: ~',
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

  it('rejects a bad value type, gate, agent type, profile and a duplicate job id', () => {
    // ARRANGE
    const yaml = PIPELINE.replace('retries: 0', 'retries: -1')
      .replace('gate: human', 'gate: auto')
      .replace('{ type: reviewer', '{ type: critic')
      .replace(
        '[docs/agents/episode-brief-grill.md], profile: ~',
        '[docs/agents/episode-brief-grill.md], profile: opus',
      )
      .replace('id: research', 'id: brief-grill')
      .replace('needs: [brief-grill]', 'needs: []');
    const expected = [
      'Job "brief-grill" has retries -1; it must be a whole number of 0 or more.',
      'Job "brief-grill" has gate "auto"; the only gate is human.',
      'Job "brief-grill", agent 1 has profile "opus"; it stays empty (~) for now.',
      'The job id "brief-grill" appears twice; job ids are unique.',
      'Job "brief-grill", agent 2 has type "critic"; it must be implementor or reviewer.',
    ];
    // ACT
    const messages = check(yaml);
    // ASSERT
    expect(messages).toEqual(expect.arrayContaining(expected));
  });

  it('rejects a check that is not one of the named kinds', () => {
    // ARRANGE
    const yaml = PIPELINE.replace('checks: [mh, vitest]', 'checks: [mh, vitests]');
    const expected = [
      'Job "research" has the check "vitests"; the checks are mh, vitest, verify, build, test:build, visual-check.',
    ];
    // ACT
    const messages = check(yaml);
    // ASSERT
    expect(messages).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('accepts a needs graph with a diamond, which is no cycle', () => {
    // ARRANGE
    const job = (id: string, needs: string): string =>
      `  - { id: ${id}, needs: [${needs}], outputs: [], checks: [], retries: 0, agents: [{ type: implementor, skills: [], references: [], profile: ~ }] }`;
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
        '    foreach: brief.md#research-questions',
        '    outputs: [dossier.md]',
        '    checks: []',
        '    retries: 1',
        '    agents:',
        '      - { type: implementor, skills: [], references: [brief.md, research/*/research.md], profile: ~ }',
        '',
      ].join('\n'),
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
      'references: [references/research.md, brief.md]',
      'references: [references/reserch.md, brief.md]',
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
});
