import { describe, expect, it } from 'vitest';
import { toClaudeLog } from './claude-log-writer.pure';
import { fromClaudeLog, type LogOptions } from './claude-log.pure';
import type { Chat } from './context.types';

// One small chat with every kind of step: the round trip has to carry each of them.
const START = {
  id: 'm1',
  blocks: [
    { cat: 'sysprompt', tokens: 100 },
    { cat: 'systools', tokens: 200 },
  ],
} as const;
const OPTIONS: LogOptions = { id: 'party', start: START, memory: 50 };
const DATE = 'Today is 27 June.';
const CHAT: Chat = {
  id: 'party',
  steps: [
    { kind: 'start', ...START },
    { id: 'm2', kind: 'memory', path: 'CLAUDE.md', blocks: [{ cat: 'memory', tokens: 50 }] },
    {
      id: 'm3',
      kind: 'you',
      text: 'Find a venue in Lisbon.',
      blocks: [
        { cat: 'user', tokens: 5 },
        { cat: 'reminder', tokens: 4 },
      ],
      reminders: [{ kind: 'date', text: DATE }],
    },
    {
      id: 'm4',
      kind: 'tool',
      calls: [
        { name: 'WebSearch', input: { query: 'Lisbon garden venue' }, result: 'Quinta terrace, Estrela pavilion' },
        { name: 'WebFetch', input: { url: 'https://example.com/estrela', prompt: 'Capacity?' }, result: '60 guests' },
      ],
      blocks: [
        { cat: 'tool_use', tokens: 30 },
        { cat: 'tool_result', tokens: 400 },
      ],
    },
    { id: 'm5', kind: 'ai', text: 'The Estrela pavilion fits 60.', blocks: [{ cat: 'assistant', tokens: 20 }] },
    { id: 'm6', kind: 'you', text: 'Book it.', blocks: [{ cat: 'user', tokens: 8 }] },
    { id: 'm7', kind: 'cleared', cleared: 400, blocks: [] },
    { id: 'm8', kind: 'ai', text: 'Done.', blocks: [{ cat: 'assistant', tokens: 12 }] },
    {
      id: 'm9',
      kind: 'compact',
      trigger: 'auto',
      summary: 'A venue for 40.',
      blocks: [{ cat: 'summary', tokens: 60 }],
    },
    { id: 'm10', kind: 'ai', text: 'Anything else?', blocks: [{ cat: 'assistant', tokens: 15 }] },
  ],
};

const line = (value: object) => JSON.stringify(value);
const usage = (context: number, output: number) => ({
  input_tokens: 3,
  cache_read_input_tokens: context - 3,
  cache_creation_input_tokens: 0,
  output_tokens: output,
});
const blocksOf = (chat: Chat, id: string) => chat.steps.find((step) => step.id === id)?.blocks;

describe('success cases', () => {
  it('reads back the chat it wrote, step for step', () => {
    // ARRANGE
    const expected = CHAT;
    // ACT
    const chat = fromClaudeLog(toClaudeLog(CHAT), OPTIONS);
    // ASSERT
    expect(chat).toStrictEqual(expected);
  });

  it('sizes each message from the exact context of the next request', () => {
    // ARRANGE
    const log = [
      line({ type: 'user', uuid: 'u1', message: { role: 'user', content: 'Plan a party.' } }),
      line({
        type: 'assistant',
        uuid: 'a1',
        requestId: 'r1',
        message: { role: 'assistant', content: [{ type: 'text', text: 'For how many?' }], usage: usage(1000, 7) },
      }),
      line({ type: 'user', uuid: 'u2', message: { role: 'user', content: 'Forty.' } }),
      line({
        type: 'assistant',
        uuid: 'a2',
        requestId: 'r2',
        message: { role: 'assistant', content: [{ type: 'text', text: 'Noted.' }], usage: usage(1019, 3) },
      }),
    ].join('\n');
    const options: LogOptions = { id: 'log', start: { id: 'start', blocks: [{ cat: 'sysprompt', tokens: 990 }] } };
    const expected = {
      u1: [{ cat: 'user', tokens: 10 }],
      a1: [{ cat: 'assistant', tokens: 7 }],
      u2: [{ cat: 'user', tokens: 12 }],
    };
    // ACT
    const chat = fromClaudeLog(log, options);
    // ASSERT
    expect(blocksOf(chat, 'u1')).toEqual(expected.u1);
    expect(blocksOf(chat, 'a1')).toEqual(expected.a1);
    expect(blocksOf(chat, 'u2')).toEqual(expected.u2);
  });

  it('sizes a compaction summary as the context after it, less the starting instructions and memory', () => {
    // ARRANGE
    const log = toClaudeLog(CHAT);
    const expected = [{ cat: 'summary', tokens: 60 }];
    // ACT
    const chat = fromClaudeLog(log, OPTIONS);
    // ASSERT
    expect(blocksOf(chat, 'm9')).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('skips lines that are not JSON and lines of a side chain', () => {
    // ARRANGE
    const log = [
      'not json',
      line({ type: 'user', uuid: 'side', isSidechain: true, message: { role: 'user', content: 'A worker task.' } }),
      line({ type: 'user', uuid: 'u1', message: { role: 'user', content: 'Hello.' } }),
    ].join('\n');
    const expected = ['start', 'u1'];
    // ACT
    const chat = fromClaudeLog(log, { id: 'log', start: { id: 'start', blocks: [{ cat: 'sysprompt', tokens: 10 }] } });
    // ASSERT
    expect(chat.steps.map((step) => step.id)).toEqual(expected);
  });

  it('refuses to write a chat that does not open with its starting instructions', () => {
    // ARRANGE
    const chat: Chat = { id: 'x', steps: CHAT.steps.slice(1) };
    const expected = 'chat "x" must open with a start step';
    // ACT
    const write = () => toClaudeLog(chat);
    // ASSERT
    expect(write).toThrow(expected);
  });
});

describe('edge cases', () => {
  it('shares one request’s growth over two messages by their length', () => {
    // ARRANGE
    const log = [
      line({ type: 'user', uuid: 'u1', message: { role: 'user', content: 'Short.' } }),
      line({ type: 'user', uuid: 'u2', message: { role: 'user', content: 'A message three times longer.' } }),
      line({
        type: 'assistant',
        uuid: 'a1',
        requestId: 'r1',
        message: { role: 'assistant', content: [{ type: 'text', text: 'Ok.' }], usage: usage(140, 2) },
      }),
    ].join('\n');
    const options: LogOptions = { id: 'log', start: { id: 'start', blocks: [{ cat: 'sysprompt', tokens: 100 }] } };
    const expected = { u1: [{ cat: 'user', tokens: 7 }], u2: [{ cat: 'user', tokens: 33 }] };
    // ACT
    const chat = fromClaudeLog(log, options);
    // ASSERT
    expect(blocksOf(chat, 'u1')).toEqual(expected.u1);
    expect(blocksOf(chat, 'u2')).toEqual(expected.u2);
  });

  it('keeps a hidden user text as a system reminder of the step before it', () => {
    // ARRANGE
    const hidden = '<system-reminder>The task list is empty.</system-reminder>';
    const log = [
      line({ type: 'user', uuid: 'u1', message: { role: 'user', content: 'Hello.' } }),
      line({ type: 'user', uuid: 'h1', message: { role: 'user', content: hidden } }),
    ].join('\n');
    const expected = [{ kind: 'hidden', text: hidden }];
    // ACT
    const chat = fromClaudeLog(log, { id: 'log', start: { id: 'start', blocks: [{ cat: 'sysprompt', tokens: 10 }] } });
    // ASSERT
    expect(chat.steps.at(-1)?.reminders).toEqual(expected);
  });
});
