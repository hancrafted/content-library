import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Attention } from './attention.client';
import { contextViewData } from './context';
import { createState } from './context-state.pure';
import { stepView } from './context-step.pure';
import type { AttentionLayout } from './context.types';

const noop = () => undefined;

/** The Attention part for the summer party's chat (Slide 7's Preset; Slide 4 has too few rows left to pin) at one layout, as server markup, parsed. */
const render = (layout: AttentionLayout, renderMode: 'simple' | 'technical' = 'simple') => {
  const data = contextViewData({ preset: 'slide-7', locale: 'en' });
  const { chat } = data;
  const view = stepView(data, chat, createState(data.preset));
  const html = renderToStaticMarkup(
    createElement(Attention, {
      words: data.words,
      locale: data.locale,
      story: data.story,
      renderMode,
      lit: null,
      ghost: null,
      pinned: null,
      chat,
      vis: view.vis,
      attention: view.attention,
      gone: view.gone,
      readout: view.readout,
      stepOf: view.stepOf,
      layout,
      onLight: noop,
      onPin: noop,
      onReveal: noop,
    }),
  );
  return load(html);
};

const PINNED = 3;

describe('success cases', () => {
  it('pins the first three and the last three rows in the pinned layout, nothing in the others', () => {
    // ARRANGE
    const expected = { top: PINNED, bottom: PINNED };
    // ACT
    const $ = render('pinned');
    const actual = { top: $('[data-pin="top"]').length, bottom: $('[data-pin="bottom"]').length };
    // ASSERT
    expect(actual).toEqual(expected);
    expect(render('list')('[data-pin]')).toHaveLength(0);
    expect(render('compressed')('[data-pin]')).toHaveLength(0);
  });

  it('names its layout on the list and keys each row to its chat step', () => {
    // ARRANGE
    const layouts: AttentionLayout[] = ['list', 'pinned', 'compressed'];
    // ACT
    const found = layouts.map((layout) => render(layout)('[data-layout]').attr('data-layout'));
    const $ = render('list');
    const firstStep = 'm1';
    // ASSERT
    expect(found).toEqual(layouts);
    expect($('[data-row]').first().attr('data-part')).toBe(firstStep);
  });
});

describe('failure cases', () => {
  it('shows no row percentage at rest in Technical mode, as in Simple: only the hover readout carries it', () => {
    // ARRANGE
    const layouts: AttentionLayout[] = ['list', 'pinned', 'compressed'];
    // ACT
    const resting = layouts.map((layout) => {
      const $ = render(layout, 'technical');
      return $('[data-row] > span:not([data-pct])')
        .map((_, el) => $(el).text())
        .get()
        .join('');
    });
    // ASSERT
    expect(resting).toEqual(['', '', '']);
    expect(render('list', 'technical')('[data-pct]').first().text()).toMatch(/^\d+%$/);
  });

  it('is its own section, not a view of Details: it holds no Explain head', () => {
    // ARRANGE
    const $ = render('list');
    const expected = 'Attention';
    const detailsHead = 'Explain';
    // ACT
    const label = $('section').attr('aria-label');
    // ASSERT
    expect(label).toBe(expected);
    expect($.text()).not.toContain(detailsHead);
  });
});

describe('edge cases', () => {
  it('pins no row twice when the list is shorter than six rows', () => {
    // ARRANGE
    const $ = render('pinned');
    // ACT
    const pinned = $('[data-row][data-pin]').length;
    // ASSERT
    expect(pinned).toBeLessThanOrEqual($('[data-row]').length);
  });
});
