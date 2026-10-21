import { describe, expect, it } from 'vitest';
import { barModel, durationText, sessionParts } from './context-bars.pure';
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
  lit: null,
  litFrom: null,
  ring: [],
};

const SECTIONS = [
  { id: 'a', share: 20 },
  { id: 'b', share: 40 },
  { id: 'c', share: 40 },
];

describe('success cases', () => {
  it('fills the session up to and including the current Section and hangs its name from the nearer edge', () => {
    // ARRANGE
    const expected = [
      ['done', 'start'],
      ['current', 'start'],
      ['upcoming', 'end'],
    ];
    // ACT
    const parts = sessionParts(SECTIONS, 'b');
    // ASSERT
    expect(parts.map((p) => [p.state, p.side])).toEqual(expected);
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
  it('leaves a fresh session empty', () => {
    // ARRANGE
    const expected = ['upcoming', 'upcoming', 'upcoming'];
    // ACT
    const fresh = sessionParts(SECTIONS, null).map((p) => p.state);
    // ASSERT
    expect(fresh).toEqual(expected);
  });

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
  it('refuses an unknown Section', () => {
    // ARRANGE
    const expected = 'unknown Section "x"';
    // ACT
    const draw = () => sessionParts(SECTIONS, 'x');
    // ASSERT
    expect(draw).toThrow(expected);
  });

  it('refuses a bar whose chat is missing', () => {
    // ARRANGE
    const bar: MiniBar = BAR;
    // ACT
    const draw = () => barModel(bar, undefined, WINDOW);
    // ASSERT
    expect(draw).toThrow('names no chat');
  });
});
