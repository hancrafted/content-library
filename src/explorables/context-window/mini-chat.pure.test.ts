import { describe, expect, it } from 'vitest';
import type { Step } from './context.types';
import { blocksChat } from './mini-chat.pure';

/** The shared starting instructions a mini chat opens with, unless it leaves them out. */
const START: Step = { id: 'start', kind: 'start', blocks: [{ cat: 'sysprompt', tokens: 100 }] };

/** A step as the bar reads it: its id, its kind and its blocks' categories. */
const shape = (steps: readonly Step[]) =>
  steps.map((step) => ({ id: step.id, kind: step.kind, cats: step.blocks.map((block) => block.cat) }));

describe('success cases', () => {
  it('opens with the starting instructions, then one step per row, each kind from its category', () => {
    // ARRANGE
    const expected = {
      id: 'dive',
      steps: [
        { id: 'start', kind: 'start', cats: ['sysprompt'] },
        { id: 'dive-1', kind: 'memory', cats: ['memory'] },
        { id: 'dive-2', kind: 'you', cats: ['user'] },
        { id: 'dive-3', kind: 'ai', cats: ['assistant'] },
      ],
    };
    // ACT
    const chat = blocksChat('dive', START, [
      ['memory', 40],
      ['user', 10],
      ['assistant', 20],
    ]);
    // ASSERT
    expect({ id: chat.id, steps: shape(chat.steps) }).toEqual(expected);
  });

  it('folds a tool result into the call right before it, so the call and its result are one step', () => {
    // ARRANGE
    const expected = [
      { id: 'dive-1', kind: 'tool', cats: ['tool_use', 'tool_result'] },
      { id: 'dive-3', kind: 'ai', cats: ['assistant'] },
    ];
    // ACT
    const chat = blocksChat('dive', null, [
      ['tool_use', 5],
      ['tool_result', 900],
      ['assistant', 20],
    ]);
    // ASSERT
    expect(shape(chat.steps)).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('keeps two tool results in a row as two steps with distinct ids, so their block keys never collide', () => {
    // ARRANGE
    const expected = [
      { id: 'dive-1', kind: 'tool', cats: ['tool_result'] },
      { id: 'dive-2', kind: 'tool', cats: ['tool_result'] },
    ];
    // ACT
    const chat = blocksChat('dive', null, [
      ['tool_result', 9000],
      ['tool_result', 7000],
    ]);
    // ASSERT
    expect(shape(chat.steps)).toEqual(expected);
  });

  it('never folds a tool result into a step that is not a tool call', () => {
    // ARRANGE
    const expected = [
      { id: 'start', kind: 'start', cats: ['sysprompt'] },
      { id: 'dive-1', kind: 'tool', cats: ['tool_result'] },
    ];
    // ACT
    const chat = blocksChat('dive', START, [['tool_result', 300]]);
    // ASSERT
    expect(shape(chat.steps)).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('holds no step at all without the starting instructions and without rows', () => {
    // ARRANGE
    const expected = { id: 'empty', steps: [] };
    // ACT
    const chat = blocksChat('empty', null, []);
    // ASSERT
    expect(chat).toEqual(expected);
  });

  it('keeps each row its own tokens, and a category with no step of its own becomes a turn of yours', () => {
    // ARRANGE
    const expected = [
      { id: 'dive-1', kind: 'you', blocks: [{ cat: 'skills', tokens: 6000 }] },
      { id: 'dive-2', kind: 'you', blocks: [{ cat: 'sysprompt', tokens: 23000 }] },
    ];
    // ACT
    const chat = blocksChat('dive', null, [
      ['skills', 6000],
      ['sysprompt', 23000],
    ]);
    // ASSERT
    expect(chat.steps.map(({ id, kind, blocks }) => ({ id, kind, blocks }))).toEqual(expected);
  });
});
