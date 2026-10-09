import { describe, expect, it } from 'vitest';
import {
  ITEM_SELECTOR,
  itemSelector,
  legacyTargetId,
  NOTE_SELECTOR,
  noteSelector,
  sourceLinkSelector,
  targetSelector,
} from './context-link.pure';

describe('success cases', () => {
  it("finds a Context reference's Speaker note item by its item's id and the note's slug", () => {
    // ARRANGE
    const expected = '[data-slot="context"] [data-context-for="foundations--why"] [data-note="stateless"]';
    // ACT
    const selector = noteSelector({ item: 'foundations--why', note: 'stateless' });
    // ASSERT
    expect(selector).toBe(expected);
  });

  it("finds a note's page element by its short target, to be queried inside the item's element", () => {
    // ARRANGE
    const expected = '[data-target="prose"]';
    // ACT
    const selector = targetSelector('prose');
    // ASSERT
    expect(selector).toBe(expected);
  });

  it("finds a drawer item's entry by its id", () => {
    // ARRANGE
    const expected = '[data-slot="context"] [data-context-for="foundations--why"]';
    // ACT
    const selector = itemSelector('foundations--why');
    // ASSERT
    expect(selector).toBe(expected);
  });

  it('still names the element id a legacy Episode gives a note target, `<item>--<target>`', () => {
    // ARRANGE
    const expected = 'foundations--why--prose';
    // ACT
    const id = legacyTargetId('foundations--why', 'prose');
    // ASSERT
    expect(id).toBe(expected);
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
    const expected = '[data-slot="context"] [data-context-for="a\\"] b\\\\"] [data-note="n"]';
    // ACT
    const selector = noteSelector({ item: 'a"] b\\', note: 'n' });
    // ASSERT
    expect(selector).toBe(expected);
  });
});

describe('edge cases', () => {
  it('selects no note for an empty slug rather than every note of the item', () => {
    // ARRANGE
    const expected = '[data-slot="context"] [data-context-for="top"] [data-note=""]';
    // ACT
    const selector = noteSelector({ item: 'top', note: '' });
    // ASSERT
    expect(selector).toBe(expected);
  });
});
