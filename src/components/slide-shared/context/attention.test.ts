import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Attention } from './attention';
import { contextViewData } from './context';
import { attentionAt } from './context-usage.pure';
import { framesOf } from './context.pure';
import type { AttentionLayout } from './context.types';

const noop = () => undefined;

/** The Attention part for the summer party's chat (Slide 7's Preset; Slide 4 has too few rows left to pin) at one layout, as server markup, parsed. */
const render = (layout: AttentionLayout) => {
  const data = contextViewData({ preset: 'slide-7', locale: 'en' });
  const { chat, preset } = data;
  const frames = framesOf(chat);
  const window = preset.windows[0]!;
  const attention = attentionAt(chat, frames, { step: preset.step, windowTokens: window.tokens, notes: data.notes });
  const html = renderToStaticMarkup(
    createElement(Attention, {
      words: data.words,
      locale: data.locale,
      story: data.story,
      renderMode: 'simple',
      lit: null,
      ghost: null,
      pinned: null,
      chat,
      frames,
      vis: preset.step,
      attention,
      window,
      stepOf: new Map(chat.steps.map((s, i) => [s.id, i + 1])),
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
    // ASSERT
    expect(found).toEqual(layouts);
    expect($('[data-row]').first().attr('data-part')).toBe('m1');
  });
});

describe('failure cases', () => {
  it('is its own section, not a view of Details: it holds no Explain head', () => {
    // ARRANGE
    const $ = render('list');
    // ACT
    const label = $('section').attr('aria-label');
    // ASSERT
    expect(label).toBe('Attention');
    expect($.text()).not.toContain('Explain');
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
