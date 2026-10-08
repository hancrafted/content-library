import { describe, expect, it } from 'vitest';
import { ITEM_SELECTOR, NOTE_SELECTOR, noteSelector, sourceLinkSelector } from './context-link.pure';

describe('success cases', () => {
  it("finds a Context reference's Speaker note item inside the drawer by the reference's id, which is the note's target", () => {
    // ARRANGE
    const expected = '[data-slot="context"] [data-note-target][data-note-target="foundations--why--prose"]';
    // ACT
    const selector = noteSelector('foundations--why--prose');
    // ASSERT
    expect(selector).toBe(expected);
  });

  it('matches any Speaker note item in the drawer, and the drawer item holding one', () => {
    // ARRANGE
    const expected = ['[data-slot="context"] [data-note-target]', '[data-context-for]'];
    // ACT
    const selectors = [NOTE_SELECTOR, ITEM_SELECTOR];
    // ASSERT
    expect(selectors).toEqual(expected);
  });

  it("finds source n's link in a note's sources", () => {
    // ARRANGE
    const expected = '[data-source="2"] a';
    // ACT
    const selector = sourceLinkSelector('2');
    // ASSERT
    expect(selector).toBe(expected);
  });
});

describe('failure cases', () => {
  it('quotes an id that would end the attribute value, so it can never select another note', () => {
    // ARRANGE
    const expected = '[data-slot="context"] [data-note-target][data-note-target="a\\"] b\\\\"]';
    // ACT
    const selector = noteSelector('a"] b\\');
    // ASSERT
    expect(selector).toBe(expected);
  });
});

describe('edge cases', () => {
  it('selects no note for an empty id rather than every note', () => {
    // ARRANGE
    const expected = '[data-slot="context"] [data-note-target][data-note-target=""]';
    // ACT
    const selector = noteSelector('');
    // ASSERT
    expect(selector).toBe(expected);
  });
});
