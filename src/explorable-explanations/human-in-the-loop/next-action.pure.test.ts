import { describe, expect, it } from 'vitest';
import { nextAction, type PanelProgress } from './next-action.pure';

const panel = (key: string, over: Partial<PanelProgress> = {}): PanelProgress => ({
  key,
  copied: false,
  done: false,
  ...over,
});

describe('success cases', () => {
  it('leads with Copy prompt of the do step while nothing is copied', () => {
    // ARRANGE
    const panels = [panel('do'), panel('review')];
    // ACT
    const next = nextAction(panels);
    // ASSERT
    expect(next).toEqual({ key: 'do', action: 'copy' });
  });

  it('moves to the result once the prompt is copied, never to the chat buttons', () => {
    // ARRANGE
    const panels = [panel('do', { copied: true }), panel('review')];
    // ACT
    const next = nextAction(panels);
    // ASSERT
    expect(next).toEqual({ key: 'do', action: 'answer' });
  });

  it('leads nowhere once the result is pasted: the check step is optional', () => {
    // ARRANGE
    const panels = [panel('do', { done: true }), panel('review', { optional: true })];
    // ACT
    const next = nextAction(panels);
    // ASSERT
    expect(next).toBeNull();
  });
});

describe('failure cases', () => {
  it('leads with the context while a field has neither a value nor a sample', () => {
    // ARRANGE
    const panels = [panel('do', { needsInput: true }), panel('review')];
    // ACT
    const next = nextAction(panels);
    // ASSERT
    expect(next).toEqual({ key: 'do', action: 'context' });
  });
});

describe('edge cases', () => {
  it('leads nowhere once every step is done, or when there is no step', () => {
    // ARRANGE
    const finished = [panel('do', { done: true }), panel('review', { done: true, copied: true })];
    // ACT
    const results = [nextAction(finished), nextAction([])];
    // ASSERT
    expect(results).toEqual([null, null]);
  });
});
