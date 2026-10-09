import { describe, expect, it } from 'vitest';
import { nextSpineLevel } from './spine-stepper.pure';

describe('success cases', () => {
  it('steps down the spine one level at a time: Episode, Section, Slide', () => {
    // ARRANGE
    const expected = ['section', 'slide'];
    // ACT
    const stepped = [nextSpineLevel('episode'), nextSpineLevel('section')];
    // ASSERT
    expect(stepped).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('rejects a level that is not on the spine instead of quietly restarting', () => {
    // ARRANGE
    const stray = 'chapter' as never;
    // ACT
    const step = () => nextSpineLevel(stray);
    // ASSERT
    expect(step).toThrow('chapter');
  });
});

describe('edge cases', () => {
  it('starts over at the Episode after the last level', () => {
    // ARRANGE
    const expected = 'episode';
    // ACT
    const level = nextSpineLevel('slide');
    // ASSERT
    expect(level).toBe(expected);
  });
});
