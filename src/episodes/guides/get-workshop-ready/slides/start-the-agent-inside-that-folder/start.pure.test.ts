import { describe, expect, it } from 'vitest';
import { fallbackCommand, openMenu, startCommand, terminalPrompt } from './start.pure';

describe('success cases', () => {
  it('opens the terminal on Mac from the folder menu by its Services submenu', () => {
    // ARRANGE
    const expected = 'services';
    // ACT
    const menu = openMenu('mac');
    // ASSERT
    expect(menu).toBe(expected);
  });

  it('shows the folder name in front of the cursor, in each OS its own prompt', () => {
    // ARRANGE
    const expected = [
      { before: 'han@MacBook ', folder: 'starter-folder', after: ' %' },
      { before: 'PS C:\\Users\\han\\Downloads\\', folder: 'starter-folder', after: '>' },
      { before: 'han@laptop:~/Downloads/', folder: 'starter-folder', after: '$' },
    ];
    // ACT
    const prompts = [terminalPrompt('mac'), terminalPrompt('windows'), terminalPrompt('linux')];
    // ASSERT
    expect(prompts).toEqual(expected);
  });

  it('starts Claude Code, Codex and GitHub Copilot by their command names', () => {
    // ARRANGE
    const expected = ['claude', 'codex', 'copilot'];
    // ACT
    const commands = [startCommand('claude-code'), startCommand('codex'), startCommand('copilot')];
    // ASSERT
    expect(commands).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('types no command for Antigravity, whose start is not confirmed', () => {
    // ARRANGE
    const agent = 'antigravity';
    // ACT
    const command = startCommand(agent);
    // ASSERT
    expect(command).toBeNull();
  });
});

describe('edge cases', () => {
  it('writes the fallback path with the separator of the picked OS', () => {
    // ARRANGE
    const expected = ['cd Downloads/starter-folder', 'cd Downloads\\starter-folder', 'cd Downloads/starter-folder'];
    // ACT
    const commands = [fallbackCommand('mac'), fallbackCommand('windows'), fallbackCommand('linux')];
    // ASSERT
    expect(commands).toEqual(expected);
  });

  it('draws the Windows 11 short menu, and no menu on Linux', () => {
    // ARRANGE
    const expected = ['short', null];
    // ACT
    const menus = [openMenu('windows'), openMenu('linux')];
    // ASSERT
    expect(menus).toEqual(expected);
  });
});
