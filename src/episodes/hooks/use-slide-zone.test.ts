import { createZoneStore } from '@/episodes/lib/slide-zone.pure';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { SlideIdContext, useSlideEntry, ZoneStoreContext } from './use-slide-zone';

/** A Scene part that prints the entrance it reads. */
function EntryProbe() {
  return createElement('output', null, useSlideEntry());
}

/** The probe inside Slide `id` of a page whose zone store is `store`. */
function inSlide(store: ReturnType<typeof createZoneStore>, id: string) {
  return createElement(
    ZoneStoreContext,
    { value: store },
    createElement(SlideIdContext, { value: id }, createElement(EntryProbe)),
  );
}

describe('success cases', () => {
  it('reads pending in the static HTML, so an emphasis motion waits for the first entry', () => {
    // ARRANGE
    const store = createZoneStore();
    const expected = '<output>pending</output>';
    // ACT
    const html = renderToStaticMarkup(inSlide(store, 'a--b'));
    // ASSERT
    expect(html).toBe(expected);
  });
});

describe('failure cases', () => {
  it('only reads the entrance: rendering a reader leaves an entering Slide entering', () => {
    // ARRANGE
    const store = createZoneStore();
    store.setActive('a--b');
    const before = store.getEntry('a--b');
    // ACT
    renderToStaticMarkup(inSlide(store, 'a--b'));
    const after = store.getEntry('a--b');
    // ASSERT
    expect(after).toBe(before);
  });
});

describe('edge cases', () => {
  it('renders outside any Episode page without a store', () => {
    // ARRANGE
    const expected = '<output>pending</output>';
    // ACT
    const html = renderToStaticMarkup(createElement(EntryProbe));
    // ASSERT
    expect(html).toBe(expected);
  });
});
