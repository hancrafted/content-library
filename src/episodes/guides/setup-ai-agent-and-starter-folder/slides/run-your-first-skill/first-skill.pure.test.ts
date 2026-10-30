import { describe, expect, it } from 'vitest';
import { agentOf, openCommand, osOf } from './first-skill.pure';

/*
 * The plain logic behind "Run your first skill" (Spec Option 7a): the command the permission prompt shows for the
 * page's OS pick, and how the page's picks read.
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
});

describe('failure cases', () => {
  it('reads an unknown page pick as the default Mac and Claude Code', () => {
    // ARRANGE
    const expected = ['mac', 'claude-code'];
    // ACT
    const picks = [osOf('beos'), agentOf('cursor')];
    // ASSERT
    expect(picks).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('keeps a known pick as picked', () => {
    // ARRANGE
    const expected = ['windows', 'codex'];
    // ACT
    const picks = [osOf('windows'), agentOf('codex')];
    // ASSERT
    expect(picks).toEqual(expected);
  });
});
