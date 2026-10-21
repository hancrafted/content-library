import { describe, expect, it } from 'vitest';
import { columns } from './context-columns.pure';
import { contextData } from './context-data';
import { createState, reduce } from './context-state.pure';

const { presets, chats } = contextData('en');
const preset = presets['slide-7']!;
const context = { preset, steps: chats[preset.chat]!.steps.length };
const grid = (state: ReturnType<typeof createState>) => columns(state.parts, state, preset.height);
const simple = { depth: 'simple' } as const;

describe('success cases', () => {
  it('gives each part shown a column and an area, in the order of the state', () => {
    // ARRANGE
    const state = createState({ ...preset, ...simple, show: { ...preset.show, category: true, panel: false } });
    const expected = "'chat timeline ctx cat'";
    // ACT
    const found = grid(state);
    // ASSERT
    expect(found['--areas']).toBe(expected);
  });

  it('moves a part to the front of the areas when it is reordered there', () => {
    // ARRANGE
    const start = createState({ ...preset, ...simple, show: { ...preset.show, category: true, panel: false } });
    const moved = reduce(start, { type: 'REORDER', part: 'category', before: 'chat' }, context);
    const expected = "'cat chat timeline ctx'";
    // ACT
    const found = grid(moved);
    // ASSERT
    expect(found['--areas']).toBe(expected);
  });
});

describe('failure cases', () => {
  it('leaves no column or area for a part that is hidden', () => {
    // ARRANGE
    const state = createState({ ...preset, show: { ...preset.show, category: false, panel: false } });
    // ACT
    const found = grid(state);
    // ASSERT
    expect(found['--areas']).not.toContain('cat');
  });
});

describe('edge cases', () => {
  it('falls back to one column and no areas when nothing is shown', () => {
    // ARRANGE
    const none = { chat: false, timeline: false, context: false, category: false, panel: false, attention: false };
    const state = createState({ ...preset, show: none });
    const expected = ['1fr', 'none'];
    // ACT
    const found = grid(state);
    // ASSERT
    expect([found['--cols'], found['--areas']]).toEqual(expected);
  });

  it('widens the context column in Simple against Technical', () => {
    // ARRANGE
    const simple = createState({ ...preset, depth: 'simple' });
    const technical = createState({ ...preset, depth: 'technical' });
    const widths = ['16rem', '15rem'];
    // ACT
    const found = [grid(simple)['--cols'], grid(technical)['--cols']];
    // ASSERT
    expect(found.map((cols, i) => cols.includes(widths[i]!))).toEqual([true, true]);
  });

  it('keeps the category beside the window in Technical, and the chat in its column without a flexible part', () => {
    // ARRANGE
    const none = { ...preset.show, chat: true, context: true, category: true, panel: false, attention: false };
    const state = createState({ ...preset, depth: 'technical', show: none });
    const expected = ["'chat timeline ctx cat'", 'minmax(16rem, 40rem)'];
    // ACT
    const found = grid(state);
    // ASSERT
    expect([found['--areas'], found['--cols'].split(' 3.5rem')[0]]).toEqual(expected);
  });
});
