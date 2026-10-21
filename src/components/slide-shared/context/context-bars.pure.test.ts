import { describe, expect, it } from 'vitest';
import { barModel, durationText } from './context-bars.pure';
import type { Chat, MiniBar, WindowSize } from './context.types';

const WINDOW: WindowSize = { tokens: 200000, bufferTokens: 16500, lines: [] };
const CHAT: Chat = {
  id: 'c',
  steps: [
    { id: 'a', kind: 'start', blocks: [{ cat: 'sysprompt', tokens: 30000 }] },
    { id: 'b', kind: 'you', text: '', blocks: [{ cat: 'user', tokens: 1000 }] },
    { id: 'c', kind: 'tool', calls: [], blocks: [{ cat: 'tool_result', tokens: 60000 }] },
    { id: 'd', kind: 'ai', text: '', blocks: [{ cat: 'assistant', tokens: 9000 }] },
  ],
};
const BAR: MiniBar = {
  label: 'x',
  chat: 'c',
  step: 4,
  discarded: false,
  segments: null,
  lit: null,
  litFrom: null,
  ring: [],
};

describe('success cases', () => {
  it('draws a call as its minutes in order, the standout ringed and the middle faded', () => {
    // ARRANGE
    const bar: MiniBar = {
      ...BAR,
      chat: null,
      segments: [
        [4, 'lit'],
        [37, 'faded'],
        [1, 'standout'],
      ],
    };
    const expected = { total: 42, starts: [0, 4, 41] };
    // ACT
    const model = barModel(bar, undefined, WINDOW);
    // ASSERT
    expect({ total: model.total, starts: model.blocks.map((b) => b.start) }).toEqual(expected);
    expect(model.blocks.map((b) => [b.faded, b.ring])).toEqual([
      [false, false],
      [true, false],
      [false, true],
    ]);
  });

  it('derives the used tokens of a chat bar from its data', () => {
    // ARRANGE
    const expected = 100000;
    // ACT
    const model = barModel(BAR, CHAT, WINDOW);
    // ASSERT
    expect(model.used).toBe(expected);
    expect(model.total).toBe(WINDOW.tokens);
    expect(model.blocks.every((b) => !b.faded)).toBe(true);
  });

  it('fades what is not lit by category, step or ring', () => {
    // ARRANGE
    const bar: MiniBar = { ...BAR, lit: ['start'], litFrom: 'd', ring: ['b'] };
    // ACT
    const faded = barModel(bar, CHAT, WINDOW).blocks.map((b) => [b.key, b.faded, b.ring]);
    // ASSERT
    expect(faded).toEqual([
      ['a@sysprompt', false, false],
      ['b@user', false, true],
      ['c@tool_result', true, false],
      ['d@assistant', false, false],
    ]);
  });

  it('says a duration in hours and minutes', () => {
    // ARRANGE
    const words = { hours: 'h', minutes: 'min' };
    // ACT
    const said = [durationText(82, words), durationText(40, words), durationText(120, words)];
    // ASSERT
    expect(said).toEqual(['1 h 22 min', '40 min', '2 h']);
  });
});

describe('edge cases', () => {
  it('fades nothing on a chat bar that names no light', () => {
    // ARRANGE
    const expected = 0;
    // ACT
    const faded = barModel(BAR, CHAT, WINDOW).blocks.filter((b) => b.faded);
    // ASSERT
    expect(faded).toHaveLength(expected);
  });
});

describe('failure cases', () => {
  it('refuses a bar with neither chat nor segments', () => {
    // ARRANGE
    const bar: MiniBar = { ...BAR, chat: null };
    // ACT
    const draw = () => barModel(bar, undefined, WINDOW);
    // ASSERT
    expect(draw).toThrow('names no chat or segments');
  });
});
