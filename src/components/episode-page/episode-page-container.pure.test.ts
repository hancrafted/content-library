import { describe, expect, it } from 'vitest';
import type { TocSection } from '../../lib/table-of-contents.pure';
import { eyebrowsOf } from './episode-page-container.pure';

/** A table-of-contents Section with page Slides of these ids, each titled after its id. */
function section(id: string, title: string, items: readonly string[]): TocSection {
  return { id, title, minutes: 0, items: items.map((item) => ({ id: item, title: item, minutes: 0 })) };
}

describe('success cases', () => {
  it("names each page Slide's Section and its place among the Section's page Slides", () => {
    // ARRANGE
    const sections = [section('foundations', 'Foundations', ['foundations--a', 'foundations--b'])];
    const expected = { section: 'Foundations', position: 2, count: 2 };
    // ACT
    const eyebrow = eyebrowsOf(sections).get('foundations--b');
    // ASSERT
    expect(eyebrow).toEqual(expected);
  });

  it('counts afresh in every Section', () => {
    // ARRANGE
    const sections = [section('one', 'One', ['one--a', 'one--b', 'one--c']), section('two', 'Two', ['two--a'])];
    const expected = { section: 'Two', position: 1, count: 1 };
    // ACT
    const eyebrow = eyebrowsOf(sections).get('two--a');
    // ASSERT
    expect(eyebrow).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('gives a section slide no Eyebrow', () => {
    // ARRANGE
    const sections = [section('foundations', 'Foundations', ['foundations--a'])];
    // ACT
    const eyebrow = eyebrowsOf(sections).get('foundations');
    // ASSERT
    expect(eyebrow).toBeUndefined();
  });
});

describe('edge cases', () => {
  it('gives an untitled Slide no Eyebrow and leaves it out of the count, so the numbers stay contiguous', () => {
    // ARRANGE
    const base = section('s', 'S', ['s--a', 's--c']);
    const sections = [
      { ...base, items: [{ ...base.items[0], unlisted: [{ id: 's--b', minutes: 0 }] }, base.items[1]] },
    ];
    const expected = { section: 'S', position: 2, count: 2 };
    // ACT
    const eyebrows = eyebrowsOf(sections);
    // ASSERT
    expect(eyebrows.get('s--b')).toBeUndefined();
    expect(eyebrows.get('s--c')).toEqual(expected);
  });
});
