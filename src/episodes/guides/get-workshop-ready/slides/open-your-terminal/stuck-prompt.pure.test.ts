import { describe, expect, it } from 'vitest';
import { agentOf, osOf, stuckPrompt } from './stuck-prompt.pure';

const TEMPLATE = 'Computer: {os}\nAI agent: {agent}\nStep: {step}\n\nWhat I see:\n{error}';

describe('success cases', () => {
  it('wraps the pasted error with the computer, the AI agent and the step', () => {
    // ARRANGE
    const parts = {
      os: 'Windows',
      agent: 'Codex',
      step: 'Step 2: Open your terminal',
      error: "'claude' is not recognized",
      empty: '(nothing pasted yet)',
    };
    const expected =
      "Computer: Windows\nAI agent: Codex\nStep: Step 2: Open your terminal\n\nWhat I see:\n'claude' is not recognized";
    // ACT
    const prompt = stuckPrompt(TEMPLATE, parts);
    // ASSERT
    expect(prompt).toBe(expected);
  });

  it('reads a known pick as itself', () => {
    // ARRANGE
    const expected = { os: 'linux', agent: 'copilot' };
    // ACT
    const picks = { os: osOf('linux'), agent: agentOf('copilot') };
    // ASSERT
    expect(picks).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('reads a pick it does not know as Mac and Claude Code, the defaults the toolbar shows', () => {
    // ARRANGE
    const expected = { os: 'mac', agent: 'claude-code' };
    // ACT
    const picks = { os: osOf('beos'), agent: agentOf('') };
    // ASSERT
    expect(picks).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('says nothing was pasted when the paste area is empty or only whitespace', () => {
    // ARRANGE
    const parts = { os: 'Mac', agent: 'Claude Code', step: 'Step 2', error: '  \n ', empty: '(nothing pasted yet)' };
    const expected = 'Computer: Mac\nAI agent: Claude Code\nStep: Step 2\n\nWhat I see:\n(nothing pasted yet)';
    // ACT
    const prompt = stuckPrompt(TEMPLATE, parts);
    // ASSERT
    expect(prompt).toBe(expected);
  });

  it('keeps a pasted error that itself holds braces as written', () => {
    // ARRANGE
    const parts = { os: 'Mac', agent: 'Codex', step: 'Step 2', error: 'zsh: {os} not found', empty: '-' };
    const expected = 'Computer: Mac\nAI agent: Codex\nStep: Step 2\n\nWhat I see:\nzsh: {os} not found';
    // ACT
    const prompt = stuckPrompt(TEMPLATE, parts);
    // ASSERT
    expect(prompt).toBe(expected);
  });
});
