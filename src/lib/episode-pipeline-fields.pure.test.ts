import { describe, expect, it } from 'vitest';
import { agentFields, JOB_FIELDS } from './episode-pipeline-fields.pure';
import { checkMapping } from './mapping-fields.pure';

/*
 * The pipeline vocabulary through checkMapping, the one way the pipeline
 * check reads it: a valid agent and job, then the values each list refuses.
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
    const job = { id: 'a', needs: [], before: ['lint'], outputs: [], checks: [], retries: 0, agents: [AGENT] };
    const expected = ['Job has before ["lint"]; the steps are mh-query.'];
    // ACT
    const messages = checkMapping('Job', job, JOB_FIELDS);
    // ASSERT
    expect(messages).toEqual(expected);
  });
});

describe('edge cases', () => {
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
