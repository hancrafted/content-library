import { describe, expect, it } from 'vitest';
import { formatChangePrompt } from './change-prompt.pure';

describe('success cases', () => {
  it('names scope, theme, old and new value for each change', () => {
    // ARRANGE
    const changes = [
      { scope: { kind: 'global' as const }, theme: 'dark' as const, name: '--primary', from: 'white', to: 'grey' },
      {
        scope: { kind: 'slide' as const, id: 'intro--hero', episode: 'ai-token-economy' },
        theme: 'light' as const,
        name: '--sun',
        from: '#fff',
        to: '#eee',
      },
    ];
    // ACT
    const prompt = formatChangePrompt(changes);
    // ASSERT
    expect(prompt).toEqual(expect.stringContaining('- `--primary` (dark theme): `white` -> `grey`'));
    expect(prompt).toContain('Global tokens');
    expect(prompt).toContain('Slide `intro--hero`');
    expect(prompt).toContain('src/components/episodes/ai-token-economy/');
    expect(prompt).toContain('- `--sun` (light theme): `#fff` -> `#eee`');
  });
});

describe('failure cases', () => {
  it('is empty without changes', () => {
    // ARRANGE
    const changes: never[] = [];
    // ACT
    const prompt = formatChangePrompt(changes);
    // ASSERT
    expect(prompt).toBe('');
  });
});

describe('edge cases', () => {
  it('still names the Slide when its Episode is unknown', () => {
    // ARRANGE
    const changes = [
      {
        scope: { kind: 'slide' as const, id: 'x', episode: null },
        theme: 'light' as const,
        name: '--a',
        from: '1',
        to: '2',
      },
    ];
    // ACT
    const prompt = formatChangePrompt(changes);
    // ASSERT
    expect(prompt).toContain("Slide `x` (the Slide's token file, a CSS module in the Slide's folder)");
  });
});
