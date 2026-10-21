import { describe, expect, it } from 'vitest';
import { columns } from './context-columns.pure';
import { contextData } from './context-data';
import { createState, reduce } from './context-state.pure';

const { presets, chats } = contextData('en');
const preset = presets['slide-7']!;
const context = { preset, steps: chats[preset.chat]!.steps.length };
const grid = (state: ReturnType<typeof createState>) => columns(state.parts, state, preset.height);

describe('success cases', () => {
  it('gives each part shown a column and an area, in the order of the state', () => {
    // ARRANGE
    const state = createState({ ...preset, show: { ...preset.show, preview: true, panel: false } });
    const expected = "'chat timeline ctx prev'";
    // ACT
    const found = grid(state);
    // ASSERT
    expect(found['--areas']).toBe(expected);
  });

  it('moves a part to the front of the areas when it is reordered there', () => {
    // ARRANGE
    const start = createState({ ...preset, show: { ...preset.show, preview: true, panel: false } });
    const moved = reduce(start, { type: 'REORDER', part: 'preview', before: 'chat' }, context);
    const expected = "'prev chat timeline ctx'";
    // ACT
    const found = grid(moved);
    // ASSERT
    expect(found['--areas']).toBe(expected);
  });
});

describe('failure cases', () => {
  it('leaves no column or area for a part that is hidden', () => {
    // ARRANGE
    const state = createState({ ...preset, show: { ...preset.show, preview: false, panel: false } });
    // ACT
    const found = grid(state);
    // ASSERT
    expect(found['--areas']).not.toContain('prev');
  });
});

describe('edge cases', () => {
  it('falls back to one column and no areas when nothing is shown', () => {
    // ARRANGE
    const none = { chat: false, timeline: false, context: false, preview: false, panel: false, attention: false };
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
});
