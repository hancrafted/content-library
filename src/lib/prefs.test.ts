import { describe, expect, it } from 'vitest';
import { mergePrefs, parsePrefs } from './prefs.pure';

describe('success cases', () => {
  it('parses a stored theme and locale', () => {
    // ARRANGE
    const raw = '{"theme":"dark","locale":"de"}';
    // ACT
    const prefs = parsePrefs(raw);
    // ASSERT
    expect(prefs).toEqual({ theme: 'dark', locale: 'de' });
  });

  it('merges a patch over existing prefs without dropping the other field', () => {
    // ARRANGE
    const raw = '{"theme":"dark"}';
    // ACT
    const merged = mergePrefs(raw, { locale: 'de' });
    // ASSERT
    expect(JSON.parse(merged)).toEqual({ theme: 'dark', locale: 'de' });
  });
});

describe('failure cases', () => {
  it('yields empty prefs for malformed JSON', () => {
    // ARRANGE
    const raw = '{not json';
    // ACT
    const prefs = parsePrefs(raw);
    // ASSERT
    expect(prefs).toEqual({});
  });

  it('drops fields with unsupported values', () => {
    // ARRANGE
    const raw = '{"theme":"sepia","locale":"fr"}';
    // ACT
    const prefs = parsePrefs(raw);
    // ASSERT
    expect(prefs).toEqual({});
  });

  it('yields empty prefs when the stored value is not an object', () => {
    // ARRANGE
    const raws = ['[]', '"dark"', 'null'];
    // ACT
    const parsed = raws.map(parsePrefs);
    // ASSERT
    expect(parsed).toEqual([{}, {}, {}]);
  });
});

describe('edge cases', () => {
  it('treats a missing key as empty prefs', () => {
    // ARRANGE
    const raw = null;
    // ACT
    const prefs = parsePrefs(raw);
    // ASSERT
    expect(prefs).toEqual({});
  });

  it('starts fresh when merging into a corrupt value', () => {
    // ARRANGE
    const raw = '{oops';
    // ACT
    const merged = mergePrefs(raw, { theme: 'light' });
    // ASSERT
    expect(merged).toBe('{"theme":"light"}');
  });
});
