import { describe, expect, it } from 'vitest';
import { CONTEXT_PRESETS, contextData } from './context-data';
import { presetProblems } from './context-presets.pure';

const data = contextData('en');
const slide3 = data.presets['slide-3']!;
const chat = data.chats[slide3.chat];

describe('success cases', () => {
  it('finds nothing wrong with any shipped Preset against its own chat', () => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const problems = CONTEXT_PRESETS.flatMap((id) => {
      const preset = data.presets[id]!;
      return presetProblems(preset, data.chats[preset.chat]);
    });
    // ASSERT
    expect(problems).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('names a chat the Preset points at that does not exist', () => {
    // ARRANGE
    const expected = ['slide-3: unknown chat "summer-party"'];
    // ACT
    const problems = presetProblems(slide3, undefined);
    // ASSERT
    expect(problems).toEqual(expected);
  });

  it('refuses a fill that enters the buffer without a compaction right after', () => {
    // ARRANGE
    const tight = { ...slide3, windows: [{ ...slide3.windows[0]!, tokens: 1000, bufferTokens: 900 }] };
    // ACT
    const problems = presetProblems(tight, chat);
    // ASSERT
    expect(problems.some((problem) => problem.includes('enters the buffer'))).toBe(true);
  });

  it('refuses a Preset curve that does not sum to 100', () => {
    // ARRANGE
    const bad = {
      ...slide3,
      attention: { ...slide3.attention, curve: { start: 20, recent: 20, middle: 20, newest: 20 } },
    };
    const expected = 'slide-3: attention curve must sum to 100, got 80';
    // ACT
    const problems = presetProblems(bad, chat);
    // ASSERT
    expect(problems).toContain(expected);
  });

  it('keeps the default curve on a Preset that only names its layout', () => {
    // ARRANGE
    const slide4 = data.presets['slide-4']!;
    const expected = {
      layout: 'compressed',
      curve: { start: 20, recent: 20, middle: 25, newest: 35 },
      falloff: { start: [50, 25, 25], newest: [50, 30, 20] },
    };
    // ACT
    const actual = slide4.attention;
    // ASSERT
    expect(actual).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('refuses more than two lines on a window', () => {
    // ARRANGE
    const line = { id: 'a', tokens: 1, label: 'A', short: 'a', who: 'a' };
    const crowded = { ...slide3, windows: [{ ...slide3.windows[0]!, lines: [line, line, line] }] };
    const expected = 'slide-3: at most two lines on a window';
    // ACT
    const problems = presetProblems(crowded, chat);
    // ASSERT
    expect(problems).toContain(expected);
  });
});
