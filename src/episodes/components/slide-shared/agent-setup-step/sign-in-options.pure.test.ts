import { describe, expect, it } from 'vitest';
import { AGENTS } from './picks.pure';
import { signInOptions } from './sign-in-options.pure';

/*
 * The sign-in choices per AI agent: every agent has at least one recommended option, and Codex lists the vendor's
 * three labels in the vendor's order.
 */

describe('success cases', () => {
  it('lists the three Codex sign-in labels in the order the vendor shows them', () => {
    // ARRANGE
    const expected = ['Sign in with ChatGPT', 'Sign in with Device Code', 'Sign in another way'];
    // ACT
    const labels = signInOptions('codex').map((option) => option.label);
    // ASSERT
    expect(labels).toEqual(expected);
  });

  it('recommends at least one option for every AI agent', () => {
    // ARRANGE
    const ids = AGENTS.map((agent) => agent.id);
    // ACT
    const counts = ids.map((id) => signInOptions(id).filter((option) => option.recommended).length);
    // ASSERT
    expect(counts.every((count) => count >= 1)).toBe(true);
  });

  it('recommends only ChatGPT sign-in for Codex', () => {
    // ARRANGE
    const expected = ['chatgpt'];
    // ACT
    const picked = signInOptions('codex')
      .filter((option) => option.recommended)
      .map((option) => option.id);
    // ASSERT
    expect(picked).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('throws for an unknown AI agent, so a gap fails a test', () => {
    // ARRANGE
    const unknown = 'no-such-agent';
    // ACT
    const act = () => signInOptions(unknown);
    // ASSERT
    expect(act).toThrow(unknown);
  });
});

describe('edge cases', () => {
  it('leaves the label out where the vendor does not publish it', () => {
    // ARRANGE
    const ids = ['claude-code', 'antigravity'];
    // ACT
    const first = ids.map((id) => signInOptions(id)[0]?.label);
    // ASSERT
    expect(first).toEqual([undefined, undefined]);
  });
});
