import { describe, expect, it } from 'vitest';
import { blockedBy, createState, ghostOf, matcher, moveTo, panelKey, reduce, renderModeOf } from './context-state.pure';
import type { Chat, Preset } from './context.types';

const CHAT: Chat = {
  id: 'party',
  steps: [
    { id: 'm1', kind: 'start', blocks: [{ cat: 'sysprompt', tokens: 20000 }] },
    { id: 'm2', kind: 'you', text: 'Find a venue.', blocks: [{ cat: 'user', tokens: 7 }] },
    {
      id: 'm3',
      kind: 'tool',
      calls: [],
      blocks: [
        { cat: 'tool_use', tokens: 200 },
        { cat: 'tool_result', tokens: 15000 },
      ],
    },
  ],
};
const WINDOW = { tokens: 200000, bufferTokens: 16500, lines: [] };
const PRESET: Preset = {
  id: 'test',
  chat: 'party',
  step: 3,
  depth: 'simple',
  pinned: null,
  show: { chat: true, timeline: true, context: true, category: true, panel: false, attention: false },
  order: ['chat', 'timeline', 'context', 'category', 'panel', 'attention'],
  fade: false,
  attention: { layout: 'list' },
  controls: { '*': { show: false }, window: { show: true } },
  timelineLocked: false,
  windows: [WINDOW, { tokens: 1000000, bufferTokens: 33000, lines: [] }],
  motion: 'rise',
  height: 38,
};
const CONTEXT = { preset: PRESET, steps: CHAT.steps.length };

const WITH_MODES = {
  ...PRESET,
  controls: {
    '*': { show: false },
    window: { show: true },
    technical: { show: true },
    conversationTechnical: { show: true },
  },
};
const MODES = { preset: WITH_MODES, steps: CHAT.steps.length };

const view = (lit: string | null) => ({
  depth: 'simple' as const,
  lit,
  ghost: null,
});

const REORDERING = { ...PRESET, controls: { '*': { show: false }, parts: { show: true, reorder: true } } };

describe('success cases', () => {
  it('switches the window size when the Preset offers two', () => {
    // ARRANGE
    const expected = 1;
    // ACT
    const next = reduce(createState(PRESET), { type: 'SET_WINDOW', value: 1 }, CONTEXT);
    // ASSERT
    expect(next.window).toBe(expected);
  });

  it('pins a part, and unpins it on a second click', () => {
    // ARRANGE
    const expected = ['m2', null];
    // ACT
    const once = reduce(createState(PRESET), { type: 'PIN', part: 'm2' }, CONTEXT);
    const twice = reduce(once, { type: 'PIN', part: 'm2' }, CONTEXT);
    // ASSERT
    expect([once.pinned, twice.pinned]).toEqual(expected);
  });

  it('changes the panel key with what Details explains and with the renderMode', () => {
    // ARRANGE
    const resting = panelKey(view(null));
    // ACT
    const keys = [panelKey(view('m3')), panelKey({ ...view(null), depth: 'technical' })];
    // ASSERT
    expect(keys.map((key) => key === resting)).toEqual([false, false]);
  });
  it('starts in the Preset order and moves a part to the slot of another', () => {
    // ARRANGE
    const preset = { ...REORDERING, order: ['panel', 'chat', 'timeline', 'context', 'category', 'attention'] as const };
    const expected = ['panel', 'timeline', 'chat', 'context', 'category', 'attention'];
    // ACT
    const start = createState(preset);
    const next = reduce(start, { type: 'REORDER', part: 'chat', before: 'timeline' }, { ...CONTEXT, preset });
    // ASSERT
    expect(start.order).toEqual(preset.order);
    expect(next.order).toEqual(expected);
  });

  it('moves a part forwards and backwards over the parts between', () => {
    // ARRANGE
    const order = PRESET.order;
    // ACT
    const back = moveTo(order, 'attention', 'chat');
    const forward = moveTo(order, 'chat', 'attention');
    // ASSERT
    expect(back).toEqual(['attention', 'chat', 'timeline', 'context', 'category', 'panel']);
    expect(forward).toEqual(['timeline', 'context', 'category', 'panel', 'attention', 'chat']);
  });

  it('keeps the same array when a part is dropped on itself', () => {
    // ARRANGE
    const order = PRESET.order;
    // ACT
    const same = moveTo(order, 'chat', 'chat');
    // ASSERT
    expect(same).toBe(order);
  });
});

describe('failure cases', () => {
  it('ignores a reorder when the Preset sets parts.reorder to false, and names why', () => {
    // ARRANGE
    const preset = { ...REORDERING, controls: { parts: { show: true, reorder: false } } };
    const state = createState(preset);
    const event = { type: 'REORDER', part: 'chat', before: 'attention' } as const;
    // ACT
    const next = reduce(state, event, { ...CONTEXT, preset });
    const why = blockedBy(preset, event);
    // ASSERT
    expect(next).toBe(state);
    expect(why).toBe('reorder off');
  });

  it('ignores a reorder on a Preset that hides the parts chips', () => {
    // ARRANGE
    const state = createState(PRESET);
    const event = { type: 'REORDER', part: 'chat', before: 'attention' } as const;
    // ACT
    const next = reduce(state, event, CONTEXT);
    // ASSERT
    expect(next).toBe(state);
  });

  it("ignores a part's own renderMode on a Preset that hides the control", () => {
    // ARRANGE
    const state = createState(PRESET);
    const event = { type: 'SET_PART_MODE', part: 'timeline', value: 'technical' } as const;
    // ACT
    const next = reduce(state, event, CONTEXT);
    // ASSERT
    expect(next).toBe(state);
  });

  it('keeps the window size on a Preset without the window switch, and names why', () => {
    // ARRANGE
    const preset = { ...PRESET, controls: { '*': { show: false } } };
    const state = createState(preset);
    const event = { type: 'SET_WINDOW', value: 1 } as const;
    const expected = 'control "window" hidden';
    // ACT
    const next = reduce(state, event, { ...CONTEXT, preset });
    const why = blockedBy(preset, event);
    // ASSERT
    expect(next).toBe(state);
    expect(why).toBe(expected);
  });

  it('ignores a control the Preset hides, and names why', () => {
    // ARRANGE
    const state = createState(PRESET);
    const event = { type: 'SET_DEPTH', value: 'technical' } as const;
    const expected = 'control "technical" hidden';
    // ACT
    const next = reduce(state, event, CONTEXT);
    const why = blockedBy(PRESET, event);
    // ASSERT
    expect(next).toBe(state);
    expect(why).toBe(expected);
  });

  it('ignores the timeline on a locked Preset, but still lights a part on hover', () => {
    // ARRANGE
    const locked = { ...CONTEXT, preset: { ...PRESET, timelineLocked: true } };
    const state = createState(locked.preset);
    const expected = { step: 3, hover: 'm3' };
    // ACT
    const committed = reduce(state, { type: 'COMMIT', step: 1 }, locked);
    const hovered = reduce(state, { type: 'HOVER', part: 'm3' }, locked);
    // ASSERT
    expect(committed.step).toBe(expected.step);
    expect(hovered.hover).toBe(expected.hover);
  });
});

describe('edge cases', () => {
  it("lets the toolbar set every part, and a part's own toggle override only itself", () => {
    // ARRANGE
    const all = reduce(createState(WITH_MODES), { type: 'SET_DEPTH', value: 'technical' }, MODES);
    // ACT
    const one = reduce(all, { type: 'SET_PART_MODE', part: 'conversation', value: 'simple' }, MODES);
    // ASSERT
    expect(renderModeOf(all, 'timeline')).toBe('technical');
    expect(renderModeOf(one, 'conversation')).toBe('simple');
    expect(renderModeOf(one, 'timeline')).toBe('technical');
  });

  it('lets the latest action win: the toolbar after a part override resets that part', () => {
    // ARRANGE
    const part = reduce(createState(WITH_MODES), { type: 'SET_PART_MODE', part: 'details', value: 'technical' }, MODES);
    // ACT
    const toolbar = reduce(part, { type: 'SET_DEPTH', value: 'simple' }, MODES);
    // ASSERT
    expect(renderModeOf(part, 'details')).toBe('technical');
    expect(renderModeOf(toolbar, 'details')).toBe('simple');
  });

  it('draws a pinned step not yet in the window as a ghost', () => {
    // ARRANGE
    const state = { ...createState(PRESET), step: 2, pinned: 'm3' };
    const expected = 'm3';
    // ACT
    const ghost = ghostOf(CHAT, state);
    // ASSERT
    expect(ghost).toBe(expected);
  });

  it('matches a block key only on its own category', () => {
    // ARRANGE
    const match = matcher('m3@tool_result');
    // ACT
    const lit = [match('m3', 'tool_result'), match('m3', 'tool_use')];
    // ASSERT
    expect(lit).toEqual([true, false]);
  });

  it('clamps a committed step to the timeline', () => {
    // ARRANGE
    const expected = 3;
    // ACT
    const next = reduce(createState(PRESET), { type: 'COMMIT', step: 40 }, CONTEXT);
    // ASSERT
    expect(next.step).toBe(expected);
  });
});
