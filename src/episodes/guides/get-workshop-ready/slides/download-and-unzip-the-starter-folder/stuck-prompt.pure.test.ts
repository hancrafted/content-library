import { describe, expect, it } from 'vitest';
import { agentOf, osOf, stuckPrompt } from './stuck-prompt.pure';

const TEMPLATE = 'On {os} with {agent}, at {step}. I see:\n{error}';
const NAMES = {
  os: { mac: 'Mac', windows: 'Windows', linux: 'Linux' },
  agent: { 'claude-code': 'Claude Code', antigravity: 'Antigravity', codex: 'Codex', copilot: 'GitHub Copilot' },
};

describe('success cases', () => {
  it('wraps the pasted error with the picked OS, AI agent and step, by their names', () => {
    // ARRANGE
    const expected = 'On Windows with GitHub Copilot, at Step 5: Unzip. I see:\nAccess denied';
    const input = { os: 'windows', agent: 'copilot', step: 'Step 5: Unzip', error: 'Access denied', noError: '-' };
    // ACT
    const prompt = stuckPrompt(TEMPLATE, NAMES, input);
    // ASSERT
    expect(prompt).toBe(expected);
  });

  it('reads a known pick as itself', () => {
    // ARRANGE
    const expected = ['linux', 'antigravity'];
    // ACT
    const picks = [osOf('linux'), agentOf('antigravity')];
    // ASSERT
    expect(picks).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('reads an unknown pick as the page default, Mac and Claude Code', () => {
    // ARRANGE
    const expected = ['mac', 'claude-code'];
    // ACT
    const picks = [osOf('amiga'), agentOf('')];
    // ASSERT
    expect(picks).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('says nothing was pasted when the paste area is blank', () => {
    // ARRANGE
    const expected = 'On Mac with Claude Code, at Step 5. I see:\n(nothing pasted)';
    const input = { os: 'mac', agent: 'claude-code', step: 'Step 5', error: '  \n ', noError: '(nothing pasted)' };
    // ACT
    const prompt = stuckPrompt(TEMPLATE, NAMES, input);
    // ASSERT
    expect(prompt).toBe(expected);
  });

  it('keeps the pasted error as written, trimmed only at its ends', () => {
    // ARRANGE
    const expected = 'On Linux with Codex, at S. I see:\nline one\n  line two';
    const input = { os: 'linux', agent: 'codex', step: 'S', error: '\nline one\n  line two\n', noError: '-' };
    // ACT
    const prompt = stuckPrompt(TEMPLATE, NAMES, input);
    // ASSERT
    expect(prompt).toBe(expected);
  });
});
