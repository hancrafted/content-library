import { TAG_IDS } from '@/content-store/schemas/fields';
import { describe, expect, it } from 'vitest';
import de from './i18n/de.json';
import en from './i18n/en.json';

/*
 * The Tags' words, `tags.<id>.name` and `.tooltip`, which page assembly owns because the Episode and Event cards
 * both draw them (FE-003 §4): one pair per Tag in the closed vocabulary, in both locales, and none for any other.
 */

const FILES = { en, de } as const;
type Words = Record<string, { name?: string; tooltip?: string } | undefined>;

describe('success cases', () => {
  it.each(['en', 'de'] as const)('names and explains every Tag in the vocabulary in %s', (locale) => {
    // ARRANGE
    const tags: Words = FILES[locale].tags;
    const expected: string[] = [];
    // ACT
    const missing = TAG_IDS.filter((id) => !(tags[id]?.name && tags[id]?.tooltip));
    // ASSERT
    expect(missing).toEqual(expected);
  });
});

describe('failure cases', () => {
  it.each(['en', 'de'] as const)('keeps no words in %s for a Tag outside the vocabulary', (locale) => {
    // ARRANGE
    const vocabulary: readonly string[] = TAG_IDS;
    const expected: string[] = [];
    // ACT
    const stray = Object.keys(FILES[locale].tags).filter((id) => !vocabulary.includes(id));
    // ASSERT
    expect(stray).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('leaves no German Tag name or tooltip blank', () => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const blank = TAG_IDS.filter((id) => de.tags[id].name.trim() === '' || de.tags[id].tooltip.trim() === '');
    // ASSERT
    expect(blank).toEqual(expected);
  });
});
