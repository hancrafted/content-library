import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { contextViewData } from './context';
import { ContextCategory } from './context-category';
import { columns } from './context-columns.pure';
import { createState, reduce } from './context-state.pure';
import { stepView } from './context-step.pure';
import type { RenderMode } from './context.types';

/* The context category part: a bold title, the Messages group a collapsible in Technical only, and its place in the grid. */

const noop = () => undefined;

const render = (renderMode: RenderMode, locale = 'en') => {
  const data = contextViewData({ preset: 'slide-7', locale });
  const view = stepView(data, data.chat, createState(data.preset));
  const html = renderToStaticMarkup(
    createElement(ContextCategory, {
      words: data.words,
      locale: data.locale,
      story: data.story,
      renderMode,
      lit: null,
      ghost: null,
      pinned: null,
      onLight: noop,
      onPin: noop,
      frame: view.frame,
      window: view.window,
      present: view.present,
      toggles: [],
    }),
  );
  return load(html);
};

const setup = () => {
  const data = contextViewData({ preset: 'slide-7', locale: 'en' });
  const { preset } = data;
  return { preset, context: { preset, steps: data.chat.steps.length } };
};

describe('success cases', () => {
  it('titles the part in bold with its own name', () => {
    // ARRANGE
    const expected = 'Context category';
    // ACT
    const title = render('simple')('[role="group"] > div b').first().text();
    // ASSERT
    expect(title).toBe(expected);
  });

  it('closes the Messages group by default in Technical, holding the message categories', () => {
    // ARRANGE
    const expected = { open: false, rows: 5, group: 'group:messages' };
    // ACT
    const $ = render('technical');
    const details = $('details');
    // ASSERT
    expect({
      open: details.attr('open') !== undefined,
      rows: details.find('button[data-part]').length,
      group: details.find('summary').attr('data-part'),
    }).toEqual(expected);
  });

  it('keeps the category beside the context window in Technical as in Simple', () => {
    // ARRANGE
    const { preset } = setup();
    const simple = createState({ ...preset, depth: 'simple', show: { ...preset.show, category: true } });
    const technical = reduce(simple, { type: 'SET_PART_MODE', part: 'category', value: 'technical' }, setup().context);
    const grid = (state: typeof simple) => columns(state.parts, state, preset.height);
    // ACT
    const found = [grid(simple), grid(technical)];
    // ASSERT
    expect(found[0]?.['--areas']).toContain('ctx cat');
    expect(found[1]?.['--areas']).toBe(found[0]?.['--areas']);
    expect(found[1]?.['--rows']).toBe('none');
  });
});

describe('failure cases', () => {
  it('draws no collapsible in Simple, so the rows stay open', () => {
    // ARRANGE
    const expected = 0;
    // ACT
    const found = render('simple')('details').length;
    // ASSERT
    expect(found).toBe(expected);
  });
});

describe('edge cases', () => {
  it('keeps the context window single-row when the category is hidden', () => {
    // ARRANGE
    const { preset } = setup();
    const state = createState({ ...preset, show: { ...preset.show, category: false } });
    // ACT
    const found = columns(state.parts, state, preset.height);
    // ASSERT
    expect(found['--rows']).toBe('none');
  });
});
