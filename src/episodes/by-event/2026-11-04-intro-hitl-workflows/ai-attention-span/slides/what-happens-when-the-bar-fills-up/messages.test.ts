import { describe, expect, it } from 'vitest';
import de from './i18n/de.json';
import en from './i18n/en.json';

/* Slide 4 folds "answers get worse: context rot" into its caption, so no row of its own is left. */

describe('success cases', () => {
  it.each([
    ['en', en, /<b>context rot<\/b>/],
    ['de', de, /<b>Context Rot<\/b>/],
  ])('names context rot in the %s caption', (_locale, messages, expected) => {
    // ARRANGE
    const { caption } = messages;
    // ACT
    const matches = expected.test(caption);
    // ASSERT
    expect(matches).toBe(true);
  });

  it.each([
    ['en', en, 'What happens when the context fills up'],
    ['de', de, 'Was passiert, wenn der Kontext voll wird'],
  ])('titles the %s Slide on the context filling up', (_locale, messages, expected) => {
    // ARRANGE
    const { title } = messages;
    // ACT
    const same = title === expected;
    // ASSERT
    expect(same).toBe(true);
  });

  it.each([
    ['en', en],
    ['de', de],
  ])('explains context rot in the %s note with its four linked sources', (_locale, messages) => {
    // ARRANGE
    const expected = [
      'hsieh-ruler',
      'du-context-length-alone-hurts',
      'hong-context-rot',
      'anthropic-effective-context-engineering',
    ];
    // ACT
    const sources = Object.keys(messages.notes['what-is-context-rot'].sources);
    // ASSERT
    expect(sources).toEqual(expected);
  });
});

describe('failure cases', () => {
  it.each([
    ['en', en, 'rot'],
    ['de', de, 'rot'],
  ])('has no leftover %s message key for the removed row', (_locale, messages, key) => {
    // ARRANGE
    const expected = false;
    // ACT
    const has = key in messages;
    // ASSERT
    expect(has).toBe(expected);
  });
});

describe('edge cases', () => {
  it.each([
    ['en', en],
    ['de', de],
  ])('keeps the %s caption to one marked run', (_locale, messages) => {
    // ARRANGE
    const expected = 1;
    // ACT
    const runs = messages.caption.match(/<b>/g)?.length;
    // ASSERT
    expect(runs).toBe(expected);
  });
});
