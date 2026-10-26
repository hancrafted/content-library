import { describe, expect, it } from 'vitest';
import { formatChangePrompt } from './change-prompt.pure';

describe('success cases', () => {
  it('names scope, theme, old and new value for each change', () => {
    // ARRANGE
    const changes = [
      { scope: { kind: 'global' as const }, theme: 'dark' as const, name: '--primary', from: 'white', to: 'grey' },
      {
        scope: { kind: 'slide' as const, id: 'intro--hero', folder: 'src/episodes/ai-token-economy' },
        theme: 'light' as const,
        name: '--sun',
        from: '#fff',
        to: '#eee',
      },
    ];
    const expectedParts = [
      '- `--primary` (dark theme): `white` -> `grey`',
      'Global tokens',
      'Slide `intro--hero`',
      'src/episodes/ai-token-economy/',
      '- `--sun` (light theme): `#fff` -> `#eee`',
    ];
    // ACT
    const prompt = formatChangePrompt(changes);
    // ASSERT
    for (const part of expectedParts) expect(prompt).toContain(part);
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
        scope: { kind: 'slide' as const, id: 'x', folder: null },
        theme: 'light' as const,
        name: '--a',
        from: '1',
        to: '2',
      },
    ];
    const expectedPart = "Slide `x` (the Slide's token file, a CSS module in the Slide's folder)";
    // ACT
    const prompt = formatChangePrompt(changes);
    // ASSERT
    expect(prompt).toContain(expectedPart);
  });

  it("points an Event's copy at its folder under its Event, as the page reports it", () => {
    // ARRANGE
    const changes = [
      {
        scope: {
          kind: 'slide' as const,
          id: 'x',
          folder: 'src/episodes/by-event/2026-10-23-axel-agentic-workflow/intro',
        },
        theme: 'light' as const,
        name: '--a',
        from: '1',
        to: '2',
      },
    ];
    const expectedPart = 'src/episodes/by-event/2026-10-23-axel-agentic-workflow/intro/';
    // ACT
    const prompt = formatChangePrompt(changes);
    // ASSERT
    expect(prompt).toContain(expectedPart);
  });
});
