import { describe, expect, it } from 'vitest';
import { rackOf, satisfactionOf } from './factory-preview.pure';

describe('success cases', () => {
  it('fills one slot per waiting document when the work fits the six slots', () => {
    // ARRANGE
    const waiting = 2;
    const expected = { filled: 2, full: false, overflow: 0 };
    // ACT
    const rack = rackOf(waiting);
    // ASSERT
    expect(rack).toEqual(expected);
  });

  it('reads a backlog of 223 as a full rack with 217 past the six slots', () => {
    // ARRANGE
    const waiting = 223;
    const expected = { filled: 6, full: true, overflow: 217 };
    // ACT
    const rack = rackOf(waiting);
    // ASSERT
    expect(rack).toEqual(expected);
  });

  it('reads eight good releases of twelve as 67 % satisfied, to whole percent', () => {
    // ARRANGE
    const releases = [
      'good',
      'good',
      'bad',
      'good',
      'good',
      'bad',
      'good',
      'bad',
      'good',
      'good',
      'bad',
      'good',
    ] as const;
    const expected = 0.67;
    // ACT
    const satisfied = satisfactionOf(releases);
    // ASSERT
    expect(satisfied).toBe(expected);
  });
});

describe('failure cases', () => {
  it('refuses a negative backlog', () => {
    // ARRANGE
    const waiting = -1;
    const message = /whole number of documents/;
    // ACT
    const read = () => rackOf(waiting);
    // ASSERT
    expect(read).toThrow(message);
  });

  it('refuses a fractional backlog', () => {
    // ARRANGE
    const waiting = 2.5;
    const message = /whole number of documents/;
    // ACT
    const read = () => rackOf(waiting);
    // ASSERT
    expect(read).toThrow(message);
  });
});

describe('edge cases', () => {
  it('reads exactly six waiting documents as full with nothing past the slots', () => {
    // ARRANGE
    const waiting = 6;
    const expected = { filled: 6, full: true, overflow: 0 };
    // ACT
    const rack = rackOf(waiting);
    // ASSERT
    expect(rack).toEqual(expected);
  });

  it('leaves an idle work center empty', () => {
    // ARRANGE
    const expected = { filled: 0, full: false, overflow: 0 };
    // ACT
    const rack = rackOf(0);
    // ASSERT
    expect(rack).toEqual(expected);
  });

  it('reads no releases as fully satisfied, since nothing has gone wrong yet', () => {
    // ARRANGE
    const expected = 1;
    // ACT
    const satisfied = satisfactionOf([]);
    // ASSERT
    expect(satisfied).toBe(expected);
  });
});
