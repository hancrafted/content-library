import { describe, expect, it } from 'vitest';
import { agentOf, openCommand, osOf, stuckContext, stuckPrompt } from './first-skill.pure';

/*
 * The plain logic behind "Run your first skill" (Spec Option 7a): the command the permission prompt shows for the
 * page's OS pick, and the troubleshooting box's prompt, which wraps the viewer's error with OS, AI agent and step.
 */

describe('success cases', () => {
  it('shows the command that opens the homepage on each operating system', () => {
    // ARRANGE
    const expected = ['open https://hancrafted.net', 'start https://hancrafted.net', 'xdg-open https://hancrafted.net'];
    // ACT
    const commands = (['mac', 'windows', 'linux'] as const).map((os) => openCommand(os, 'https://hancrafted.net'));
    // ASSERT
    expect(commands).toEqual(expected);
  });

  it('names the OS, AI agent and step above the paste area', () => {
    // ARRANGE
    const expected = 'Windows · GitHub Copilot · Step 7: Run your first skill';
    // ACT
    const line = stuckContext({ os: 'windows', agent: 'copilot', step: 'Step 7: Run your first skill' });
    // ASSERT
    expect(line).toBe(expected);
  });

  it("wraps the viewer's pasted error with OS, AI agent and step", () => {
    // ARRANGE
    const expected = 'On Linux with Codex at Step 7: Run your first skill:\nerror: command not found';
    // ACT
    const prompt = stuckPrompt('On {os} with {agent} at {step}:\n{error}', {
      os: 'linux',
      agent: 'codex',
      step: 'Step 7: Run your first skill',
      error: '  error: command not found\n',
      empty: '(nothing pasted)',
    });
    // ASSERT
    expect(prompt).toBe(expected);
  });
});

describe('failure cases', () => {
  it('says nothing was pasted when the paste area is empty', () => {
    // ARRANGE
    const expected = 'On Mac with Claude Code at Step 7:\n(nothing pasted)';
    // ACT
    const prompt = stuckPrompt('On {os} with {agent} at {step}:\n{error}', {
      os: 'mac',
      agent: 'claude-code',
      step: 'Step 7',
      error: '   ',
      empty: '(nothing pasted)',
    });
    // ASSERT
    expect(prompt).toBe(expected);
  });
});

describe('edge cases', () => {
  it('reads an unknown page pick as the default Mac and Claude Code', () => {
    // ARRANGE
    const expected = ['mac', 'claude-code'];
    // ACT
    const picks = [osOf('beos'), agentOf('cursor')];
    // ASSERT
    expect(picks).toEqual(expected);
  });
});
