import { describe, expect, it } from 'vitest';
import { AGENTS, casesOf, DEFAULT_AGENT, DEFAULT_OS, OPERATING_SYSTEMS, pickOf } from './picks.pure';

/*
 * The toolbar picks a setup step reads (FE-001 §1, transient, through `usePagePick`): the operating system and the AI
 * agent, each a list of options keyed by the value the page shares. The hrefs are the vendors' own pages, checked by
 * hand against each vendor on 2026-10-29.
 */

describe('success cases', () => {
  it('finds the AI agent the viewer picked', () => {
    // ARRANGE
    const expected = 'Codex';
    // ACT
    const agent = pickOf(AGENTS, 'codex', DEFAULT_AGENT);
    // ASSERT
    expect(agent.name).toBe(expected);
  });

  it("names the operating system the way the vendors' pages mark their steps", () => {
    // ARRANGE
    const expected = ['macOS', 'Windows', 'Linux'];
    // ACT
    const labels = OPERATING_SYSTEMS.map((os) => os.pageLabel);
    // ASSERT
    expect(labels).toEqual(expected);
  });

  it('draws one case per option, keyed by the value the page shares', () => {
    // ARRANGE
    const expected = { mac: 'macOS steps', windows: 'Windows steps', linux: 'Linux steps' };
    // ACT
    const cases = casesOf(OPERATING_SYSTEMS, (os) => `${os.pageLabel} steps`);
    // ASSERT
    expect(cases).toEqual(expected);
  });

  it("draws each AI agent's start screen only as far as its vendor's page shows it", () => {
    // ARRANGE
    const expected = [
      { mark: '✻', title: 'Welcome to Claude Code!', lines: ['/help for help'] },
      { mark: '', title: 'Antigravity', lines: [] },
      { mark: '>_', title: 'OpenAI Codex', lines: ['To get started, describe a task or try one of these commands:'] },
      { mark: '', title: 'GitHub Copilot', lines: [] },
    ];
    // ACT
    const screens = AGENTS.map((agent) => agent.startScreen);
    // ASSERT
    expect(screens).toEqual(expected);
  });

  it('offers Claude Code first, then Antigravity, Codex and GitHub Copilot', () => {
    // ARRANGE
    const expected = ['Claude Code', 'Antigravity', 'Codex', 'GitHub Copilot'];
    // ACT
    const names = AGENTS.map((agent) => agent.name);
    // ASSERT
    expect(names).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('falls back to the default AI agent for a value no option has', () => {
    // ARRANGE
    const expected = 'Claude Code';
    // ACT
    const agent = pickOf(AGENTS, 'cursor', DEFAULT_AGENT);
    // ASSERT
    expect(agent.name).toBe(expected);
  });

  it('falls back to the default operating system for an empty value', () => {
    // ARRANGE
    const expected = 'Mac';
    // ACT
    const os = pickOf(OPERATING_SYSTEMS, '', DEFAULT_OS);
    // ASSERT
    expect(os.name).toBe(expected);
  });
});

describe('edge cases', () => {
  it("links every AI agent's install and login page on its vendor's own site", () => {
    // ARRANGE
    const expected = [
      [
        'https://code.claude.com/docs/en/setup#install-claude-code',
        'https://code.claude.com/docs/en/authentication#log-in-to-claude-code',
      ],
      ['https://antigravity.google/docs/getting-started', 'https://antigravity.google/docs/install'],
      ['https://learn.chatgpt.com/docs/codex/cli', 'https://learn.chatgpt.com/docs/auth'],
      [
        'https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli',
        'https://docs.github.com/en/copilot/how-tos/copilot-cli/set-up-copilot-cli/authenticate-copilot-cli',
      ],
    ];
    // ACT
    const hrefs = AGENTS.map((agent) => [agent.installHref, agent.loginHref]);
    // ASSERT
    expect(hrefs).toEqual(expected);
  });

  it('shares the pick values every Section of the Guide stores, so the page-wide pick syncs', () => {
    // ARRANGE
    const expectedOs = ['mac', 'windows', 'linux'];
    const expectedAgents = ['claude-code', 'antigravity', 'codex', 'copilot'];
    // ACT
    const os = OPERATING_SYSTEMS.map((option) => option.id);
    const agents = AGENTS.map((option) => option.id);
    // ASSERT
    expect(os).toEqual(expectedOs);
    expect(agents).toEqual(expectedAgents);
  });
});
