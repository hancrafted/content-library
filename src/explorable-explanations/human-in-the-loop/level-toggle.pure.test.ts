import { describe, expect, it } from 'vitest';
import { toggledLevel } from './level-toggle.pure';

describe('success cases', () => {
  it('turns Chat (the default) into CLI when the toggle is pressed', () => {
    // ARRANGE
    const level = 'simple';
    // ACT
    const next = toggledLevel(level);
    // ASSERT
    expect(next).toBe('technical');
  });

  it('turns CLI back into Chat when the toggle is pressed again', () => {
    // ARRANGE
    const level = 'technical';
    // ACT
    const next = toggledLevel(level);
    // ASSERT
    expect(next).toBe('simple');
  });
});

describe('failure cases', () => {
  it('never returns the level it was given', () => {
    // ARRANGE
    const levels = ['simple', 'technical'] as const;
    // ACT
    const same = levels.filter((level) => toggledLevel(level) === level);
    // ASSERT
    expect(same).toEqual([]);
  });
});

describe('edge cases', () => {
  it('comes back to where it started after two presses', () => {
    // ARRANGE
    const start = 'simple';
    // ACT
    const end = toggledLevel(toggledLevel(start));
    // ASSERT
    expect(end).toBe('simple');
  });
});
