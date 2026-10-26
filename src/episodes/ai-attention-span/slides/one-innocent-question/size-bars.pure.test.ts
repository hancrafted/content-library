import { contextData } from '@/explorable-explanations/context/context-data';
import type { Chat } from '@/explorable-explanations/context/context.types';
import { describe, expect, it } from 'vitest';
import { SIZE_ROWS, sizeBars } from './size-bars.pure';

/** A hand-written chat: a question, a search with its call and result, and a one-line answer. */
const CHAT: Chat = {
  id: 'stand-in',
  steps: [
    { id: 'q', kind: 'you', text: 'Which one?', blocks: [{ cat: 'user', tokens: 10 }] },
    {
      id: 's',
      kind: 'tool',
      calls: [],
      blocks: [
        { cat: 'tool_use', tokens: 300 },
        { cat: 'tool_result', tokens: 2000 },
      ],
    },
    { id: 'a', kind: 'ai', text: 'That one.', blocks: [{ cat: 'assistant', tokens: 40 }] },
  ],
};

describe('success cases', () => {
  it("reads each row's tokens from its step's block of its category, the largest drawn full width", () => {
    // ARRANGE
    const rows = [
      { key: 'question', step: 'q', category: 'user' },
      { key: 'search', step: 's', category: 'tool_result' },
      { key: 'answer', step: 'a', category: 'assistant' },
    ] as const;
    const expected = [
      { key: 'question', tokens: 10, percent: 0.5 },
      { key: 'search', tokens: 2000, percent: 100 },
      { key: 'answer', tokens: 40, percent: 2 },
    ];
    // ACT
    const bars = sizeBars(CHAT, rows);
    // ASSERT
    expect(bars).toEqual(expected);
  });

  it('sets the question and answer at 15 tokens against 15k of search extracts and the 55k PDF read', () => {
    // ARRANGE
    const chat = contextData('en').chats['summer-party'] ?? { id: '', steps: [] };
    const expected = [
      { key: 'question', tokens: 15 },
      { key: 'searches', tokens: 15000 },
      { key: 'pdf', tokens: 55000 },
      { key: 'answer', tokens: 15 },
    ];
    // ACT
    const bars = sizeBars(chat, SIZE_ROWS).map(({ key, tokens }) => ({ key, tokens }));
    // ASSERT
    expect(bars).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('refuses a row whose step is not in the chat, so a renamed message cannot draw an empty bar', () => {
    // ARRANGE
    const rows = [{ key: 'gone', step: 'm99', category: 'user' }] as const;
    const expected = 'size bars: no step "m99" in chat "stand-in"';
    // ACT
    const draw = () => sizeBars(CHAT, rows);
    // ASSERT
    expect(draw).toThrow(expected);
  });

  it('refuses a row whose step holds no block of its category', () => {
    // ARRANGE
    const rows = [{ key: 'wrong', step: 'q', category: 'tool_result' }] as const;
    const expected = 'size bars: step "q" holds no tool_result block';
    // ACT
    const draw = () => sizeBars(CHAT, rows);
    // ASSERT
    expect(draw).toThrow(expected);
  });
});

describe('edge cases', () => {
  it('draws no rows for no rows', () => {
    // ARRANGE
    const rows = [] as const;
    // ACT
    const bars = sizeBars(CHAT, rows);
    // ASSERT
    expect(bars).toEqual([]);
  });
});
