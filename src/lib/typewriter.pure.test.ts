import { describe, expect, it } from 'vitest';
import { seededJitter, typewriterSchedule } from './typewriter.pure';

describe('success cases', () => {
  it('gives the same seed the same jitter, so the pace is stable across loads', () => {
    // ARRANGE
    const seed = 'foundations--why-a-template';
    const count = 12;
    // ACT
    const first = seededJitter(seed, count);
    const second = seededJitter(seed, count);
    // ASSERT
    expect(second).toEqual(first);
  });

  it('normalises the jitter to a mean of one, so a part keeps its length however uneven', () => {
    // ARRANGE
    const count = 40;
    const expectedSum = 40;
    const digits = 9;
    // ACT
    const weights = seededJitter('next-steps', count);
    const sum = weights.reduce((total, weight) => total + weight, 0);
    // ASSERT
    expect(weights).toHaveLength(count);
    expect(sum).toBeCloseTo(expectedSum, digits);
  });

  it('types the Eyebrow, then the title, then the caption, each character later than the one before', () => {
    // ARRANGE
    const lengths = [10, 20, 60];
    // ACT
    const schedule = typewriterSchedule(lengths, 'a--b');
    const flat = schedule.flat();
    // ASSERT
    expect(schedule.map((part) => part.length)).toEqual(lengths);
    flat.slice(1).forEach((delay, index) => expect(delay).toBeGreaterThan(flat[index]));
  });

  it('types the caption faster per character than the title', () => {
    // ARRANGE
    const lengths = [0, 20, 20];
    // ACT
    const [, title, caption] = typewriterSchedule(lengths, 'a--b');
    const titleSpan = title.at(-1)! - title[0];
    const captionSpan = caption.at(-1)! - caption[0];
    // ASSERT
    expect(captionSpan).toBeLessThan(titleSpan);
  });
});

describe('failure cases', () => {
  it('refuses a negative count', () => {
    // ARRANGE
    const count = -1;
    // ACT
    const call = () => seededJitter('x', count);
    // ASSERT
    expect(call).toThrow(/count/);
  });

  it('refuses a negative part length', () => {
    // ARRANGE
    const lengths = [3, -2];
    // ACT
    const call = () => typewriterSchedule(lengths, 'x');
    // ASSERT
    expect(call).toThrow(/length/);
  });
});

describe('edge cases', () => {
  it('is uneven: neighbouring characters do not all get the same weight', () => {
    // ARRANGE
    const count = 24;
    const atLeast = 12;
    // ACT
    const weights = seededJitter('timelines', count);
    const distinct = new Set(weights.map((weight) => weight.toFixed(6)));
    // ASSERT
    expect(distinct.size).toBeGreaterThan(atLeast);
  });

  it('gives two seeds two different paces', () => {
    // ARRANGE
    const count = 8;
    // ACT
    const one = seededJitter('grids', count);
    const other = seededJitter('timelines', count);
    // ASSERT
    expect(other).not.toEqual(one);
  });

  it('settles a very long header inside the typing budget', () => {
    // ARRANGE
    const lengths = [40, 120, 400];
    // ACT
    const last = typewriterSchedule(lengths, 'long').flat().at(-1)!;
    // ASSERT
    expect(last).toBeLessThan(TYPE_BUDGET_FOR_TEST);
  });

  it('returns no delays for an empty header', () => {
    // ARRANGE
    const lengths = [0, 0, 0];
    // ACT
    const schedule = typewriterSchedule(lengths, 'empty');
    // ASSERT
    expect(schedule).toEqual([[], [], []]);
  });
});

/** Every character starts typing within this many milliseconds; the caret's last blink fills the rest of 1.5s. */
const TYPE_BUDGET_FOR_TEST = 1200;
