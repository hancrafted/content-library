import { describe, expect, it } from 'vitest';
import { unless, type Finding } from './finding.pure';

const FINDING: Finding = { kind: 'pipeline', file: 'pipeline.yml', message: 'The pipeline lacks the key "jobs".' };

describe('success cases', () => {
  it('reports nothing when the rule holds', () => {
    // ARRANGE
    const expected: Finding[] = [];
    // ACT
    const findings = unless(true, FINDING);
    // ASSERT
    expect(findings).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('reports the finding when the rule breaks', () => {
    // ARRANGE
    const expected = [FINDING];
    // ACT
    const findings = unless(false, FINDING);
    // ASSERT
    expect(findings).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('reports a bare message as well as a finding', () => {
    // ARRANGE
    const message = 'Job "research" has no agent.';
    const expected = [message];
    // ACT
    const messages = unless(false, message);
    // ASSERT
    expect(messages).toEqual(expected);
  });
});
