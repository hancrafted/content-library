import { describe, expect, it } from 'vitest';
import { needsInput, shownValue, type Entry } from './context-entries.pure';

const sample = '# Venue request\n\nTwo rooms.';
const withSample: Entry = { key: 'venue', label: 'Venue', sample };
const bare: Entry = { key: 'note', label: 'Note' };

describe('success cases', () => {
  it('shows the sample as the value while nothing is pasted, and the pasted text once it is', () => {
    // ARRANGE
    const pasted = '# My own venue';
    // ACT
    const shown = [shownValue(withSample, {}), shownValue(withSample, { venue: pasted })];
    // ASSERT
    expect(shown).toEqual([sample, pasted]);
  });

  it('needs nothing from the viewer while every field has a value or a sample', () => {
    // ARRANGE
    const entries = [withSample, bare];
    // ACT
    const needed = needsInput(entries, { note: 'mine' });
    // ASSERT
    expect(needed).toBe(false);
  });
});

describe('failure cases', () => {
  it('needs input while a field has neither a value nor a sample', () => {
    // ARRANGE
    const entries = [withSample, bare];
    // ACT
    const needed = needsInput(entries, { note: '  ' });
    // ASSERT
    expect(needed).toBe(true);
  });
});

describe('edge cases', () => {
  it('keeps a field the viewer emptied empty, and shows nothing for a field without a sample', () => {
    // ARRANGE
    const emptied = { venue: '' };
    // ACT
    const shown = [shownValue(withSample, emptied), shownValue(bare, {})];
    // ASSERT
    expect(shown).toEqual(['', '']);
  });
});
