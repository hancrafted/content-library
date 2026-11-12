import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { wordsFor } from './software-ecology-data';
import { TourBox } from './tour-box.client';

/* Eval hooks of the tour box (design-ADR 0024 §14): close, back and next each name themselves `tour.<field>`. */

const INTERACTIVE =
  'button, input, select, textarea, summary, [role="button"], [role="switch"], [role="menuitemradio"]';
const noop = () => undefined;

const controlsOf = (html: string) =>
  load(`<body>${html}</body>`)(INTERACTIVE)
    .toArray()
    .map((el) => ({ tag: el.tagName, control: el.attribs['data-control'], label: el.attribs['aria-label'] ?? '' }));
const ref = { current: null };

const tourBox = () =>
  renderToStaticMarkup(
    createElement(TourBox, {
      words: wordsFor('en').tour,
      name: 'Tour',
      head: '',
      running: null,
      caption: '',
      checks: [],
      floor: ref,
      wrap: ref,
      canBack: true,
      last: false,
      onClose: noop,
      onBack: noop,
      onNext: noop,
    }),
  );

describe('success cases', () => {
  it('names the tour controls tour.close, tour.back and tour.next', () => {
    // ARRANGE
    const expected = ['tour.back', 'tour.close', 'tour.next'];
    // ACT
    const found = controlsOf(tourBox()).map((c) => c.control);
    // ASSERT
    expect([...found].sort()).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('leaves no control of the tour box without a data-control', () => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const missing = controlsOf(tourBox())
      .filter((c) => !c.control)
      .map((c) => `${c.tag} ${c.label}`);
    // ASSERT
    expect(missing).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('has no two controls with the same data-control', () => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const names = controlsOf(tourBox()).map((c) => c.control);
    // ASSERT
    expect(names.filter((n, i) => names.indexOf(n) !== i)).toEqual(expected);
  });
});
