import { describe, expect, it } from 'vitest';
import { stuckPrompt } from './stuck-prompt.pure';

/*
 * The troubleshooting box's prompt (Visual language "The troubleshooting box"): the viewer's pasted error, wrapped
 * with the picked operating system, AI agent and step, ready to paste into free ChatGPT.
 */

const TEMPLATE = 'Computer: {os}. AI agent: {agent}. Step: {step}.\n\nError:\n{error}';
const NO_ERROR = '(no error pasted)';

describe('success cases', () => {
  it('wraps the pasted error with the operating system, the AI agent and the step', () => {
    // ARRANGE
    const expected =
      'Computer: Windows. AI agent: Codex. Step: Step 3: Install your AI agent.\n\nError:\ncodex: not found';
    // ACT
    const prompt = stuckPrompt(TEMPLATE, {
      os: 'Windows',
      agent: 'Codex',
      step: 'Step 3: Install your AI agent',
      error: 'codex: not found',
      noError: NO_ERROR,
    });
    // ASSERT
    expect(prompt).toBe(expected);
  });
});

describe('failure cases', () => {
  it('says no error was pasted when the paste area is blank, so the prompt never ends on nothing', () => {
    // ARRANGE
    const expected = 'Computer: Mac. AI agent: Claude Code. Step: Step 4: Log in.\n\nError:\n(no error pasted)';
    // ACT
    const prompt = stuckPrompt(TEMPLATE, {
      os: 'Mac',
      agent: 'Claude Code',
      step: 'Step 4: Log in',
      error: '  \n ',
      noError: NO_ERROR,
    });
    // ASSERT
    expect(prompt).toBe(expected);
  });
});

describe('edge cases', () => {
  it('keeps a pasted error as written, braces and surrounding blank lines trimmed only at its ends', () => {
    // ARRANGE
    const expected =
      'Computer: Linux. AI agent: Antigravity. Step: Step 4: Log in.\n\nError:\nunexpected {os} in line 2\n  at login';
    // ACT
    const prompt = stuckPrompt(TEMPLATE, {
      os: 'Linux',
      agent: 'Antigravity',
      step: 'Step 4: Log in',
      error: '\n\nunexpected {os} in line 2\n  at login\n',
      noError: NO_ERROR,
    });
    // ASSERT
    expect(prompt).toBe(expected);
  });
});
