import { describe, expect, it } from 'vitest';
import { focusOf } from './focus.pure';

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
  it('dims every card when the lit slug names none of them', () => {
    // ARRANGE
    const expected = ['dimmed', 'dimmed', 'dimmed', 'dimmed'];
    // ACT
    const actual = SLUGS.map((each) => focusOf('elsewhere', each));
    // ASSERT
    expect(actual).toEqual(expected);
  });
});
