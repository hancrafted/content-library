import { describe, expect, it } from 'vitest';
import { mapTexts, textFileNames } from './use-case-texts.pure.ts';

describe('success cases', () => {
  it('names a use case’s data file and its words file per locale', () => {
    // ARRANGE
    const expected = { data: 'tire.yml', en: 'tire.words.yml', de: 'tire.words.de.yml' };
    // ACT
    const names = textFileNames('tire');
    // ASSERT
    expect(names).toEqual(expected);
  });

  it('maps every text of a use case through one function', () => {
    // ARRANGE
    const texts = { data: 'd', en: 'e', de: 'g' };
    const expected = { data: 'D', en: 'E', de: 'G' };
    // ACT
    const mapped = mapTexts((t) => t.toUpperCase(), texts);
    // ASSERT
    expect(mapped).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('names the files of an unknown id all the same, leaving the read to fail', () => {
    // ARRANGE
    const expected = 'nope.yml';
    // ACT
    const names = textFileNames('nope');
    // ASSERT
    expect(names.data).toBe(expected);
  });
});

describe('edge cases', () => {
  it('keeps a dashed id whole in every file name', () => {
    // ARRANGE
    const expected = ['a-b.yml', 'a-b.words.yml', 'a-b.words.de.yml'];
    // ACT
    const names = textFileNames('a-b');
    // ASSERT
    expect([names.data, names.en, names.de]).toEqual(expected);
  });
});
