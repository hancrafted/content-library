import { describe, expect, it } from 'vitest';
import { focusOf, litOf, release } from './focus.pure';

const SLUGS = ['activities', 'travel', 'venue', 'food'];

describe('success cases', () => {
  it('lights the pointed card and dims the other three', () => {
    // ARRANGE
    const expected = ['dimmed', 'lit', 'dimmed', 'dimmed'];
    // ACT
    const actual = SLUGS.map((each) => focusOf('travel', each));
    // ASSERT
    expect(actual).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('keeps another card’s light when the pointer leaves a card it does not hold', () => {
    // ARRANGE
    const expected = ['venue', null];
    // ACT
    const actual = [release('venue', 'travel'), release('travel', 'travel')];
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('leaves every card at rest when nothing is pointed at', () => {
    // ARRANGE
    const expected = ['rest', 'rest', 'rest', 'rest'];
    // ACT
    const actual = SLUGS.map((each) => focusOf(null, each));
    // ASSERT
    expect(actual).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('lights the hovered card over the focused one, and the focused one when nothing is hovered', () => {
    // ARRANGE
    const expected = ['travel', 'venue', null];
    // ACT
    const actual = [litOf('travel', 'venue'), litOf(null, 'venue'), litOf(null, null)];
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('dims every card when the lit slug names none of them', () => {
    // ARRANGE
    const expected = ['dimmed', 'dimmed', 'dimmed', 'dimmed'];
    // ACT
    const actual = SLUGS.map((each) => focusOf('elsewhere', each));
    // ASSERT
    expect(actual).toEqual(expected);
  });
});
