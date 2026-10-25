import { describe, expect, it } from 'vitest';
import { createState, reduce } from './context-state.pure';
import { stepView } from './context-step.pure';
import type { Chat, Preset } from './context.types';

const CHAT: Chat = {
  id: 'party',
  steps: [
    { id: 'm1', kind: 'start', blocks: [{ cat: 'sysprompt', tokens: 20000 }] },
    { id: 'm2', kind: 'you', text: 'Find a venue.', blocks: [{ cat: 'user', tokens: 1000 }] },
    { id: 'm3', kind: 'ai', text: 'The boathouse.', blocks: [{ cat: 'assistant', tokens: 4000 }] },
    {
      id: 'm4',
      kind: 'compact',
      trigger: 'auto',
      summary: 'They chose the boathouse.',
      blocks: [{ cat: 'summary', tokens: 500 }],
    },
    { id: 'm5', kind: 'you', text: 'Book it.', blocks: [{ cat: 'user', tokens: 200 }] },
  ],
};
const SMART = { id: 'smart', tokens: 20000, label: 'Smart zone', who: 'Matt', short: '20K' };
const SMALL = { tokens: 100000, bufferTokens: 16500, lines: [SMART] };
const LARGE = { tokens: 1000000, bufferTokens: 33000, lines: [] };
const PRESET: Preset = {
  id: 'test',
  chat: 'party',
  step: 3,
  depth: 'simple',
  pinned: null,
  show: { chat: true, timeline: true, context: true, category: true, panel: false, attention: true },
  order: ['chat', 'timeline', 'context', 'category', 'panel', 'attention'],
  fade: false,
  attention: {
    layout: 'list',
    curve: { start: 20, recent: 20, middle: 30, newest: 30 },
    falloff: { start: [70, 20, 10], newest: [50, 30, 20] },
  },
  controls: { '*': { show: true } },
  timelineLocked: false,
  windows: [SMALL, LARGE],
  motion: 'rise',
  height: 38,
};
const SPLIT = { m1: 60, m2: 10, m3: 30 };
const DATA = { preset: PRESET, chat: CHAT, notes: {}, overrides: { '3': SPLIT } };
const CONTEXT = { preset: PRESET, steps: CHAT.steps.length };

describe('success cases', () => {
  it('shows the preview step while scrubbing and keeps the committed one', () => {
    // ARRANGE
    const committed = 3;
    const preview = 5;
    const state = reduce(createState(PRESET), { type: 'PREVIEW', step: preview }, CONTEXT);

    // ACT
    const view = stepView(DATA, CHAT, state);

    // ASSERT
    expect({ vis: view.vis, committed: view.committed }).toEqual({ vis: preview, committed });
  });

  it('sizes the window by the one the reader switched to', () => {
    // ARRANGE
    const state = reduce(createState(PRESET), { type: 'SET_WINDOW', value: 1 }, CONTEXT);

    // ACT
    const view = stepView(DATA, CHAT, state);

    // ASSERT
    expect(view.window).toBe(LARGE);
  });

  it('reads out the step on screen against the window', () => {
    // ARRANGE
    const state = reduce(createState(PRESET), { type: 'PREVIEW', step: 2 }, CONTEXT);
    const expected = { step: 2, steps: 5, used: 21000, delta: 1000, percent: 21, crossed: SMART };

    // ACT
    const view = stepView(DATA, CHAT, state);

    // ASSERT
    expect(view.readout).toEqual(expected);
  });

  it("splits attention by the Preset's own split at its step", () => {
    // ARRANGE
    const expected = [
      { id: 'm1', units: SPLIT.m1 },
      { id: 'm2', units: SPLIT.m2 },
      { id: 'm3', units: SPLIT.m3 },
    ];

    // ACT
    const view = stepView(DATA, CHAT, createState(PRESET));

    // ASSERT
    expect({ attention: view.attention, overridden: view.overridden }).toEqual({
      attention: expected,
      overridden: true,
    });
  });

  it('lights a pinned step the screen has not reached as a ghost', () => {
    // ARRANGE
    const later = 'm5';
    const state = reduce(createState(PRESET), { type: 'PIN', part: later }, CONTEXT);

    // ACT
    const view = stepView(DATA, CHAT, state);

    // ASSERT
    expect({ lit: view.lit, ghost: view.ghost }).toEqual({ lit: later, ghost: later });
  });

  it('marks the messages a compaction removed by the step on screen as gone', () => {
    // ARRANGE
    const afterCompaction = 5;
    const state = reduce(createState(PRESET), { type: 'COMMIT', step: afterCompaction }, CONTEXT);
    const youAndAiBefore = [1, 2];

    // ACT
    const view = stepView(DATA, CHAT, state);

    // ASSERT
    expect([...view.gone]).toEqual(youAndAiBefore);
  });
});

describe('failure cases', () => {
  it('refuses a Preset with no window size', () => {
    // ARRANGE
    const data = { ...DATA, preset: { ...PRESET, windows: [] } };
    const state = createState(data.preset);

    // ACT
    const build = () => stepView(data, CHAT, state);

    // ASSERT
    expect(build).toThrow(/has no window size/);
  });
});

describe('edge cases', () => {
  it('shows the last step of a chat shorter than the state', () => {
    // ARRANGE
    const last = CHAT.steps.length;
    const state = createState({ ...PRESET, step: last + 4 });

    // ACT
    const view = stepView(DATA, CHAT, state);

    // ASSERT
    expect(view.vis).toBe(last);
  });

  it("ignores the Preset's split on a chat the reader opened", () => {
    // ARRANGE
    const opened: Chat = { ...CHAT, id: 'opened' };

    // ACT
    const view = stepView(DATA, opened, createState(PRESET));

    // ASSERT
    expect(view.overridden).toBe(false);
  });

  it('keeps the frame it had across a hover, so memoised items do not redraw', () => {
    // ARRANGE
    const usedAtStep3 = 25000;
    const rest = createState(PRESET);
    const hovered = reduce(rest, { type: 'HOVER', part: 'm2' }, CONTEXT);

    // ACT
    const before = stepView(DATA, CHAT, rest);
    const after = stepView(DATA, CHAT, hovered);

    // ASSERT
    expect(before.frame.used).toBe(usedAtStep3);
    expect(after.frame).toBe(before.frame);
  });

  it('keeps the attention it had across a hover, so the compressed list does not refit', () => {
    // ARRANGE
    const rest = createState(PRESET);
    const hovered = reduce(rest, { type: 'HOVER', part: 'm2' }, CONTEXT);
    const before = stepView(DATA, CHAT, rest);

    // ACT
    const after = stepView(DATA, CHAT, hovered);

    // ASSERT
    expect(after.attention).toBe(before.attention);
  });
});
