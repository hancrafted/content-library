import { describe, expect, it } from 'vitest';
import { stuckPrompt } from './stuck-prompt.pure';

/*
 * The "Stuck?" box's prompt: the viewer's pasted error, wrapped with the operating system, the AI agent and the step,
 * ready to paste into free ChatGPT. The box copies exactly this text.
 */

const TEMPLATE = 'OS: {os}\nAgent: {agent}\nStep: {step}\nError:\n{error}';

describe('success cases', () => {
  it('wraps the pasted error with the picked operating system, AI agent and step', () => {
    // ARRANGE
    const expected = 'OS: Windows\nAgent: Codex\nStep: Step 8: Set up\nError:\nnpx: command not found';
    // ACT
    const actual = stuckPrompt(TEMPLATE, {
      os: 'Windows',
      agent: 'Codex',
      step: 'Step 8: Set up',
      error: '  npx: command not found\n',
      noError: '(no error pasted)',
    });
    // ASSERT
    expect(actual).toBe(expected);
  });
});

describe('failure cases', () => {
  it('says no error was pasted when the paste area is empty or blank', () => {
    // ARRANGE
    const expected = 'OS: Mac\nAgent: Claude Code\nStep: Step 8\nError:\n(no error pasted)';
    // ACT
    const actual = stuckPrompt(TEMPLATE, {
      os: 'Mac',
      agent: 'Claude Code',
      step: 'Step 8',
      error: ' \n ',
      noError: '(no error pasted)',
    });
    // ASSERT
    expect(actual).toBe(expected);
  });
});

describe('edge cases', () => {
  it('copies a pasted error with braces as pasted, never filling them', () => {
    // ARRANGE
    const expected = 'OS: Linux\nAgent: Codex\nStep: Step 8\nError:\nunexpected token {os}';
    // ACT
    const actual = stuckPrompt(TEMPLATE, {
      os: 'Linux',
      agent: 'Codex',
      step: 'Step 8',
      error: 'unexpected token {os}',
      noError: '(no error pasted)',
    });
    // ASSERT
    expect(actual).toBe(expected);
  });
});
