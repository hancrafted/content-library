import { describe, expect, it } from 'vitest';
import { contextData } from './context-data';
import { attentionAt, gridBoxes, largestRemainder, readoutAt, usageRows } from './context-usage.pure';
import { categoriesOf, framesOf } from './context.pure';
import type { Chat, WindowSize } from './context.types';

const CHAT: Chat = {
  id: 'party',
  steps: [
    { id: 'm1', kind: 'start', blocks: [{ cat: 'sysprompt', tokens: 20000 }] },
    {
      id: 'm2',
      kind: 'you',
      text: 'Budget 40,000.',
      blocks: [
        { cat: 'user', tokens: 20 },
        { cat: 'reminder', tokens: 30 },
      ],
      reminders: [{ kind: 'date', text: 'x'.repeat(120) }],
    },
    {
      id: 'm3',
      kind: 'tool',
      calls: [{ name: 'Read', input: { file_path: 'offers.pdf' }, result: 'Offers' }],
      blocks: [
        { cat: 'tool_use', tokens: 200 },
        { cat: 'tool_result', tokens: 70000 },
      ],
    },
    { id: 'm4', kind: 'ai', text: 'Sabor Verde.', blocks: [{ cat: 'assistant', tokens: 15 }] },
  ],
};
const MATT = { id: 'matt', tokens: 80000, label: 'Smart zone by Matt Pocock', who: 'Matt Pocock', short: '80K' };
const WINDOW: WindowSize = { tokens: 200000, bufferTokens: 16500, lines: [MATT] };

describe('success cases', () => {
  it('lists the System reminders row only for a chat that holds a reminder', () => {
    // ARRANGE
    const frame = framesOf(CHAT)[3];
    const plain: Chat = { id: 'plain', steps: CHAT.steps.slice(0, 1) };
    const expected = { key: 'scat:reminder', tokens: 30 };
    // ACT
    const rows = frame ? usageRows(frame, 'simple', { window: WINDOW, present: categoriesOf(CHAT) }) : [];
    const without = frame ? usageRows(frame, 'simple', { window: WINDOW, present: categoriesOf(plain) }) : [];
    // ASSERT
    expect(rows.find((row) => row.key === expected.key)?.tokens).toBe(expected.tokens);
    expect(without.map((row) => row.key)).not.toContain(expected.key);
  });

  it('shares 100 units of attention, or takes the override’s units as they are', () => {
    // ARRANGE
    const frames = framesOf(CHAT);
    const override = { m1: 20, m2: 50, m3: 0, m4: 30 };
    const expected = { total: 100, overridden: [20, 50, 0, 30] };
    // ACT
    const computed = attentionAt(CHAT, frames, { step: 4, windowTokens: WINDOW.tokens, notes: {} });
    const forced = attentionAt(CHAT, frames, { step: 4, windowTokens: WINDOW.tokens, notes: {}, override });
    // ASSERT
    expect(computed.reduce((sum, a) => sum + a.units, 0)).toBe(expected.total);
    expect(forced.map((a) => a.units)).toEqual(expected.overridden);
  });

  it('follows the curve it is given: a bigger newest share gives the newest rows more units', () => {
    // ARRANGE
    const frames = framesOf(CHAT);
    const base = { step: 4, windowTokens: WINDOW.tokens, notes: {} };
    const heavy = { start: 10, recent: 10, middle: 10, newest: 70 };
    const total = 100;
    // ACT
    const even = attentionAt(CHAT, frames, base);
    const lopsided = attentionAt(CHAT, frames, { ...base, curve: heavy });
    // ASSERT
    expect(lopsided.at(-1)?.units).toBeGreaterThan(even.at(-1)?.units ?? 0);
    expect(lopsided.reduce((sum, a) => sum + a.units, 0)).toBe(total);
  });

  it('reads the step’s growth and the highest smart-zone line the fill has crossed', () => {
    // ARRANGE
    const frames = framesOf(CHAT);
    const expected = { delta: 70200, crossed: 'matt' };
    // ACT
    const readout = readoutAt(frames, 3, WINDOW);
    // ASSERT
    expect(readout.delta).toBe(expected.delta);
    expect(readout.crossed?.id).toBe(expected.crossed);
  });
});

describe('failure cases', () => {
  it('shares units equally when every weight is zero', () => {
    // ARRANGE
    const expected = [34, 33, 33];
    // ACT
    const units = largestRemainder([0, 0, 0], 100);
    // ASSERT
    expect(units).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('draws 100 boxes with the buffer last, and gives a tiny category one box', () => {
    // ARRANGE
    const frame = framesOf(CHAT)[3];
    const expected = { total: 100, buffer: 8, user: 1 };
    // ACT
    const boxes = frame ? gridBoxes(frame, WINDOW) : [];
    // ASSERT
    expect(boxes).toHaveLength(expected.total);
    expect(boxes.filter((b) => b.kind === 'buffer')).toHaveLength(expected.buffer);
    expect(boxes.filter((b) => b.cat === 'user')).toHaveLength(expected.user);
  });

  it.each(['en', 'de'] as const)(
    'lays the %s grid boxes out in the order the messages appear in the chat',
    (locale) => {
      // ARRANGE
      const chats = Object.values(contextData(locale).chats);
      const misordered: string[] = [];
      // ACT
      for (const chat of chats) {
        framesOf(chat).forEach((frame, i) => {
          const order = frame.blocks.map((block) => block.key);
          const at = gridBoxes(frame, WINDOW).flatMap((box) =>
            box.kind === 'used' ? [order.indexOf(`${box.id}@${box.cat}`)] : [],
          );
          if (at.some((position, j) => position < (at[j - 1] ?? 0))) misordered.push(`${chat.id} step ${i + 1}`);
        });
      }
      // ASSERT
      expect(chats.length).toBeGreaterThan(0);
      expect(misordered).toEqual([]);
    },
  );

  it('lets a fill inside the buffer eat it, and keeps free space at zero', () => {
    // ARRANGE
    const full: Chat = {
      id: 'full',
      steps: [{ id: 'm1', kind: 'start', blocks: [{ cat: 'sysprompt', tokens: 190000 }] }],
    };
    const frame = framesOf(full)[0];
    const expected = { free: 0, buffer: 10000 };
    // ACT
    const rows = frame ? usageRows(frame, 'technical', { window: WINDOW, present: categoriesOf(full) }) : [];
    // ASSERT
    expect(rows.find((row) => row.kind === 'free')?.tokens).toBe(expected.free);
    expect(rows.find((row) => row.kind === 'buffer')?.tokens).toBe(expected.buffer);
  });
});
