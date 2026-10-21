import { describe, expect, it } from 'vitest';
import { compactStepOf, framesOf, goneAt, miniFigure } from './context-window.pure';
import type { Chat } from './context-window.types';

const CHAT: Chat = {
  id: 'party',
  steps: [
    {
      id: 'm1',
      kind: 'start',
      blocks: [
        { cat: 'sysprompt', tokens: 6000 },
        { cat: 'systools', tokens: 14000 },
      ],
    },
    { id: 'm2', kind: 'memory', path: 'CLAUDE.md', blocks: [{ cat: 'memory', tokens: 2000 }] },
    { id: 'm3', kind: 'you', text: 'Budget 40,000.', blocks: [{ cat: 'user', tokens: 20 }] },
    {
      id: 'm4',
      kind: 'tool',
      calls: [{ name: 'Read', input: { file_path: 'offers.pdf' }, result: 'Offers' }],
      blocks: [
        { cat: 'tool_use', tokens: 200 },
        { cat: 'tool_result', tokens: 50000 },
      ],
    },
    { id: 'm5', kind: 'cleared', cleared: 30000, blocks: [] },
    { id: 'm6', kind: 'compact', trigger: 'auto', summary: 'Party.', blocks: [{ cat: 'summary', tokens: 8000 }] },
  ],
};
const WINDOW = { tokens: 200000, bufferTokens: 16500, lines: [] };

describe('success cases', () => {
  it('stacks each step’s blocks under the ones before it', () => {
    // ARRANGE
    const expected = { used: 72220, toolResultStart: 22220 };
    // ACT
    const frame = framesOf(CHAT)[3];
    // ASSERT
    expect(frame?.used).toBe(expected.used);
    expect(frame?.blocks.find((b) => b.key === 'm4@tool_result')?.start).toBe(expected.toolResultStart);
  });

  it('draws a mini bar as the window at its step, in percent of the window', () => {
    // ARRANGE
    const expected = 11;
    // ACT
    const figure = miniFigure(CHAT, { step: 3 }, WINDOW);
    // ASSERT
    expect(Math.round(figure.percent)).toBe(expected);
  });
});

describe('failure cases', () => {
  it('finds no compaction in a chat without one', () => {
    // ARRANGE
    const chat: Chat = { id: 'short', steps: CHAT.steps.slice(0, 3) };
    // ACT
    const step = compactStepOf(chat);
    // ASSERT
    expect(step).toBe(null);
  });
});

describe('edge cases', () => {
  it('clears the oldest tool results, then compacts every message into the summary', () => {
    // ARRANGE
    const frames = framesOf(CHAT);
    const expected = { cleared: 20000, compacted: ['m1@sysprompt', 'm1@systools', 'm2@memory', 'm6@summary'] };
    // ACT
    const cleared = frames[4]?.byCategory.tool_result;
    const compacted = frames[5]?.blocks.map((b) => b.key);
    // ASSERT
    expect(cleared).toBe(expected.cleared);
    expect(compacted).toEqual(expected.compacted);
  });

  it('marks a step a compaction removed as gone, and the starting instructions as kept', () => {
    // ARRANGE
    const frames = framesOf(CHAT);
    // ACT
    const gone = [goneAt(CHAT, frames, { index: 2, step: 6 }), goneAt(CHAT, frames, { index: 0, step: 6 })];
    // ASSERT
    expect(gone).toEqual([true, false]);
  });
});
