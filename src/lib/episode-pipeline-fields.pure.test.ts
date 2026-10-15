import { describe, expect, it } from 'vitest';
import { agentFields, JOB_FIELDS, LEGACY_FIELDS, TOP_FIELDS } from './episode-pipeline-fields.pure';
import { checkMapping } from './mapping-fields.pure';

/*
 * The pipeline vocabulary through checkMapping, the one way the pipeline
 * check and the dashboard read it: a valid agent and job, then the values each list refuses.
 */

const AGENT = { type: 'reviewer', skills: [], references: [], rubric: 'references/x.md#rubric', model: 'opus' };

describe('success cases', () => {
  it('accepts a reviewer with a rubric, a model and every optional key', () => {
    // ARRANGE
    const agent = { ...AGENT, agent: 'general-purpose', session: 'orchestrator' };
    // ACT
    const messages = checkMapping('Agent', agent, agentFields(true));
    // ASSERT
    expect(messages).toEqual([]);
  });

  it('lets a Run scaffolded before stages leave out stages and stage, and keep a ticket block, which the template may not', () => {
    // ARRANGE
    const top = { status: 'approved', jobs: [] };
    const job = { id: 'a', needs: [], outputs: [], checks: [], retries: 0, agents: [AGENT] };
    const agent = { ...AGENT, ticket: { agent: 'general-purpose', skills: [] } };
    const expected = [
      'Pipeline lacks the key "stages".',
      'Job lacks the key "stage".',
      'Agent has an unknown key "ticket"; the keys are type, skills, references, rubric, agent, model, session.',
    ];
    // ACT
    const legacy = [
      ...checkMapping('Pipeline', top, LEGACY_FIELDS.top),
      ...checkMapping('Job', job, LEGACY_FIELDS.job),
      ...checkMapping('Agent', agent, LEGACY_FIELDS.agent(true)),
    ];
    const strict = [
      ...checkMapping('Pipeline', top, TOP_FIELDS),
      ...checkMapping('Job', job, JOB_FIELDS),
      ...checkMapping('Agent', agent, agentFields(true)),
    ];
    // ASSERT
    expect(legacy).toEqual([]);
    expect(strict).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('names the allowed models and sessions when a value is outside them', () => {
    // ARRANGE
    const agent = { ...AGENT, model: 'gpt', session: 'main' };
    const expected = [
      'Agent has model "gpt"; it must be opus, sonnet, haiku or inherit.',
      'Agent has session "main"; it must be subagent or orchestrator.',
    ];
    // ACT
    const messages = checkMapping('Agent', agent, agentFields(true));
    // ASSERT
    expect(messages).toEqual(expected);
  });

  it('names the allowed before steps when a job lists another', () => {
    // ARRANGE
    const job = {
      id: 'a',
      stage: 'build',
      needs: [],
      before: ['lint'],
      outputs: [],
      checks: [],
      retries: 0,
      agents: [AGENT],
    };
    const expected = ['Job has before ["lint"]; the steps are mh-query.'];
    // ACT
    const messages = checkMapping('Job', job, JOB_FIELDS);
    // ASSERT
    expect(messages).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('accepts a port from 1024 to 65535 and refuses one outside it or not whole', () => {
    // ARRANGE
    const job = { id: 'a', stage: 'build', needs: [], outputs: [], checks: [], retries: 0, agents: [AGENT] };
    const ports = [1024, 65535, 1023, 65536, 4000.5, '4000'];
    const range = 'it must be a whole number from 1024 to 65535.';
    const expected = [
      [],
      [],
      [`Job has port 1023; ${range}`],
      [`Job has port 65536; ${range}`],
      [`Job has port 4000.5; ${range}`],
      [`Job has port "4000"; ${range}`],
    ];
    // ACT
    const messages = ports.map((port) => checkMapping('Job', { ...job, port }, JOB_FIELDS));
    // ASSERT
    expect(messages).toEqual(expected);
  });

  it('requires a rubric of a reviewer and leaves it optional for an implementor', () => {
    // ARRANGE
    const withoutRubric = { type: 'reviewer', skills: [], references: [], model: 'opus' };
    const expected = ['Agent lacks the key "rubric".'];
    // ACT
    const reviewer = checkMapping('Agent', withoutRubric, agentFields(true));
    const implementor = checkMapping('Agent', { ...withoutRubric, type: 'implementor' }, agentFields(false));
    // ASSERT
    expect(reviewer).toEqual(expected);
    expect(implementor).toEqual([]);
  });
});
