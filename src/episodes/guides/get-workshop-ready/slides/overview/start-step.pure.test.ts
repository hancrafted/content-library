import { describe, expect, it } from 'vitest';
import { BOXES, isStepDone, startStep, type BoxId } from './start-step.pure';

/* The plain logic behind the Overview checklist: which step "Start at step N" names. */

const ids = (...list: BoxId[]) => new Set<BoxId>(list);

describe('success cases', () => {
  it('names step 2 once the terminal box is ticked', () => {
    // ARRANGE
    const expected = { step: 2, allDone: false };
    // ACT
    const result = startStep(ids('terminal-open'));
    // ASSERT
    expect(result).toEqual(expected);
  });

  it('names step 3 once both AI agent boxes are ticked too', () => {
    // ARRANGE
    const expected = { step: 3, allDone: false };
    // ACT
    const result = startStep(ids('terminal-open', 'agent-installed', 'agent-logged-in'));
    // ASSERT
    expect(result).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('names step 1 when nothing is ticked', () => {
    // ARRANGE
    const expected = { step: 1, allDone: false };
    // ACT
    const result = startStep(ids());
    // ASSERT
    expect(result).toEqual(expected);
  });

  it('stays at step 2 while one of its two boxes is open', () => {
    // ARRANGE
    const expected = 2;
    // ACT
    const result = startStep(ids('terminal-open', 'agent-installed')).step;
    // ASSERT
    expect(result).toBe(expected);
  });
});

describe('edge cases', () => {
  it('sends the viewer to step 4 when every box is ticked', () => {
    // ARRANGE
    const expected = { step: 4, allDone: true };
    // ACT
    const result = startStep(new Set(BOXES.map((box) => box.id)));
    // ASSERT
    expect(result).toEqual(expected);
  });

  it('starts at the first open step even when a later box is ticked', () => {
    // ARRANGE
    const expected = 1;
    // ACT
    const result = startStep(ids('folder-unzipped')).step;
    // ASSERT
    expect(result).toBe(expected);
  });

  it('reports a step as done only when all its boxes are ticked', () => {
    // ARRANGE
    const ticked = ids('agent-installed');
    // ACT
    const done = [isStepDone(2, ticked), isStepDone(2, ids('agent-installed', 'agent-logged-in'))];
    // ASSERT
    expect(done).toEqual([false, true]);
  });
});
