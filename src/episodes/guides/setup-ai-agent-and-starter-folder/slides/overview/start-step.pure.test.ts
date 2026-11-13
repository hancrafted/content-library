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

  it('names step 3 once the AI agent is installed, because logging in happens in the folder', () => {
    // ARRANGE
    const expected = { step: 3, allDone: false };
    // ACT
    const result = startStep(ids('terminal-open', 'agent-installed'));
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

  it('stays at step 3 while logging in is still open', () => {
    // ARRANGE
    const expected = 3;
    // ACT
    const result = startStep(ids('terminal-open', 'agent-installed', 'folder-unzipped', 'agent-in-folder')).step;
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
    const ticked = ids('folder-unzipped', 'agent-in-folder');
    // ACT
    const done = [isStepDone(3, ticked), isStepDone(3, ids('folder-unzipped', 'agent-in-folder', 'agent-logged-in'))];
    // ASSERT
    expect(done).toEqual([false, true]);
  });
});
