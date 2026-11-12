import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CustomerStill } from './customer-still';
import { factoryStillState } from './factory-still-state';
import { formatsOf } from './still-parts';

/*
 * The Customer card of the still, read as rendered text. Its lead time must read as the Explorable's Customer card
 * reads it (one decimal below ten days, whole days above), so a viewer comparing the two sees one number.
 */
const readouts = (leadDays: number | null) => {
  const state = factoryStillState('en');
  const html = renderToStaticMarkup(
    createElement(
      'svg',
      null,
      createElement(CustomerStill, {
        state: { ...state, customer: { ...state.customer, leadDays } },
        f: formatsOf('en'),
      }),
    ),
  );
  return load(html)('text')
    .toArray()
    .map((t) => load(t).text());
};

describe('success cases', () => {
  it('shows a lead time under ten days to one decimal, as the Explorable does', () => {
    // ARRANGE
    const expected = '4.5 days';
    // ACT
    const texts = readouts(4.46);
    // ASSERT
    expect(texts).toContain(expected);
  });

  it('shows a lead time of ten days or more in whole days', () => {
    // ARRANGE
    const expected = '39 days';
    // ACT
    const texts = readouts(38.6);
    // ASSERT
    expect(texts).toContain(expected);
  });
});

describe('failure cases', () => {
  it('shows a dash for a Customer with no release yet, as the Explorable does', () => {
    // ARRANGE
    const expected = '–';
    // ACT
    const texts = readouts(null);
    // ASSERT
    expect(texts).toContain(expected);
  });
});

describe('edge cases', () => {
  it('shows exactly ten days in whole days', () => {
    // ARRANGE
    const expected = '10 days';
    // ACT
    const texts = readouts(10);
    // ASSERT
    expect(texts).toContain(expected);
  });
});
