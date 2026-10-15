import { describe, expect, it } from 'vitest';
import { repeated, unless, type Finding } from './finding.pure';

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

  it('finds no repeated value in a list of distinct ones', () => {
    // ARRANGE
    const ids = ['brief', 'setup', 'research'];
    const expected: string[] = [];
    // ACT
    const found = repeated(ids);
    // ASSERT
    expect(found).toEqual(expected);
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

  it('names each repeated value once, in the order it first repeats', () => {
    // ARRANGE
    const ids = ['setup', 'brief', 'brief', 'setup', 'brief'];
    const expected = ['brief', 'setup'];
    // ACT
    const found = repeated(ids);
    // ASSERT
    expect(found).toEqual(expected);
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

  it('finds no repeated value in an empty list', () => {
    // ARRANGE
    const ids: string[] = [];
    const expected: string[] = [];
    // ACT
    const found = repeated(ids);
    // ASSERT
    expect(found).toEqual(expected);
  });
});
