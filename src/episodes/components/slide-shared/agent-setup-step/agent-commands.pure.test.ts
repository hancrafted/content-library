import { describe, expect, it } from 'vitest';
import { docsHref, installCommand, launchCommand, PAIRS } from './agent-commands.pure';
import { AGENTS } from './picks.pure';

/*
 * The lines a first-timer copies: every AI agent on every operating system has an install line, every AI agent a
 * docs link and a launch command. The lines themselves are the vendors' (Han's handoff, 2026-10-30).
 */

describe('success cases', () => {
  it('has an install line for every AI agent on every operating system', () => {
    // ARRANGE
    const expected = PAIRS.length;
    const systems = 3;
    // ACT
    const lines = PAIRS.map(({ agent, os }) => installCommand(agent, os).text).filter((text) => text !== '');
    // ASSERT
    expect(lines).toHaveLength(expected);
    expect(expected).toBe(AGENTS.length * systems);
  });

  it('has an official docs link over https for every AI agent', () => {
    // ARRANGE
    const ids = AGENTS.map((agent) => agent.id);
    // ACT
    const links = ids.map(docsHref);
    // ASSERT
    expect(links.every((link) => link.startsWith('https://'))).toBe(true);
  });

  it('gives Claude Code the vendor lines for macOS and for PowerShell', () => {
    // ARRANGE
    const expected = ['curl -fsSL https://claude.ai/install.sh | bash', 'irm https://claude.ai/install.ps1 | iex'];
    // ACT
    const lines = [installCommand('claude-code', 'mac').text, installCommand('claude-code', 'windows').text];
    // ASSERT
    expect(lines).toEqual(expected);
  });

  it('offers Claude Code on Windows a Command Prompt line too', () => {
    // ARRANGE
    const expected = 'curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd';
    // ACT
    const alternative = installCommand('claude-code', 'windows').commandPrompt;
    // ASSERT
    expect(alternative).toBe(expected);
  });

  it('starts each AI agent with its own command, and GitHub Copilot signs in inside with /login', () => {
    // ARRANGE
    const expected = ['claude', 'agy', 'codex', 'copilot'];
    // ACT
    const commands = AGENTS.map((agent) => launchCommand(agent.id).text);
    // ASSERT
    expect(commands).toEqual(expected);
    expect(launchCommand('copilot').inside).toBe('/login');
  });
});

describe('failure cases', () => {
  it('throws for an AI agent it has no install line for', () => {
    // ARRANGE
    const agent = 'unknown';
    // ACT
    const act = () => installCommand(agent, 'mac');
    // ASSERT
    expect(act).toThrow(/unknown/);
  });
});

describe('edge cases', () => {
  it('types a PowerShell line on Windows and a terminal line elsewhere', () => {
    // ARRANGE
    const expected = ['terminal', 'terminal', 'powershell'];
    // ACT
    const shells = ['mac', 'linux', 'windows'].map((os) => installCommand('codex', os).shell);
    // ASSERT
    expect(shells).toEqual(expected);
  });
});
