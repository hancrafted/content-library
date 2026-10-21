import { describe, expect, it } from 'vitest';
import { blockedBy, createState, ghostOf, matcher, reduce } from './context-state.pure';
import type { Chat, Preset } from './context-window.types';

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
  show: { chat: true, timeline: true, context: true, panel: false },
  controls: ['show'],
  controlsHidden: false,
  timelineLocked: false,
  meterHidden: false,
  download: true,
  upload: false,
  windows: [WINDOW, { tokens: 1000000, bufferTokens: 33000, lines: [] }],
  motion: 'rise',
};
const CONTEXT = { preset: PRESET, steps: CHAT.steps.length };

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
});

describe('failure cases', () => {
  it('ignores a control the Preset hides, and names why', () => {
    // ARRANGE
    const state = createState(PRESET);
    const event = { type: 'SET_DEPTH', value: 'technical' } as const;
    const expected = 'control "depth" hidden';
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
