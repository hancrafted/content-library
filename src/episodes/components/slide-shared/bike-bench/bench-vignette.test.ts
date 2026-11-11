import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { BenchVignette, CLEAN_IDS, MESS_IDS, type VignetteId } from './bench-vignette';

/*
 * The bench vignettes: small scenes cropped from the bike bench, one per mess and one per cleaned-up state, read
 * through their rendered SVG.
 */

const render = (id: VignetteId) =>
  load(renderToStaticMarkup(createElement(BenchVignette, { id, label: `Vignette ${id}` })));

/** How many marks of a vignette are drawn in `warning`, the colour of trouble. */
const warningMarks = (id: VignetteId) => render(id)('[class*="warning"]').length;

describe('success cases', () => {
  it('draws the eight messes of the rot grid, static row then dynamic row', () => {
    // ARRANGE
    const expected = [
      'wrong-screw',
      'binder',
      'wrenches',
      'two-sheets',
      'mislabelled-box',
      'colleagues',
      'crates',
      'rush-vs-check',
    ];
    // ACT
    const ids = [...MESS_IDS];
    // ASSERT
    expect(ids).toEqual(expected);
  });

  it('marks every mess in warning, so the trouble reads at a glance', () => {
    // ARRANGE
    const expected = MESS_IDS.map(() => true);
    // ACT
    const marked = MESS_IDS.map((id) => warningMarks(id) > 0);
    // ASSERT
    expect(marked).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('draws no warning in a cleaned-up state', () => {
    // ARRANGE
    const expected = CLEAN_IDS.map(() => 0);
    // ACT
    const marks = CLEAN_IDS.map(warningMarks);
    // ASSERT
    expect(marks).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('names each vignette by its label and tags it by its id', () => {
    // ARRANGE
    const expected = { role: 'img', label: 'Vignette one-page', id: 'one-page' };
    // ACT
    const svg = render('one-page')('svg');
    // ASSERT
    expect({ role: svg.attr('role'), label: svg.attr('aria-label'), id: svg.attr('data-vignette') }).toEqual(expected);
  });
});
