import { describe, expect, it } from 'vitest';
import { blockedBy, createState, ghostOf, matcher, panelKey, reduce, renderModeOf } from './context-state.pure';
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
  mode: 'explain',
  depth: 'simple',
  pinned: null,
  show: { chat: true, timeline: true, context: true, preview: true, panel: false },
  controls: { '*': { show: false }, window: { show: true } },
  timelineLocked: false,
  windows: [WINDOW, { tokens: 1000000, bufferTokens: 33000, lines: [] }],
  motion: 'rise',
  height: 38,
};
const CONTEXT = { preset: PRESET, steps: CHAT.steps.length };

const WITH_MODES = { ...PRESET, controls: { '*': { show: false }, window: { show: true }, technical: { show: true } } };
const MODES = { preset: WITH_MODES, steps: CHAT.steps.length };

const view = (mode: 'explain' | 'attention', lit: string | null) => ({
  mode,
  depth: 'simple' as const,
  lit,
  ghost: null,
});

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

  it('changes the panel key with what Explain explains and with the mode', () => {
    // ARRANGE
    const resting = panelKey(view('explain', null));
    // ACT
    const keys = [panelKey(view('explain', 'm3')), panelKey(view('attention', null))];
    // ASSERT
    expect(keys.map((key) => key === resting)).toEqual([false, false]);
  });
});

describe('failure cases', () => {
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

  it('keeps the same panel key while Attention is lit, so hovering a row never remounts the card', () => {
    // ARRANGE
    const resting = panelKey(view('attention', null));
    // ACT
    const lit = panelKey(view('attention', 'm3'));
    // ASSERT
    expect(lit).toBe(resting);
  });
});
