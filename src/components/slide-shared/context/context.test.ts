import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Context, ContextMiniBars, contextViewData } from './context';
import { CONTEXT_PRESETS, type ContextPresetId, type MiniPresetId } from './context-data';

/** The server markup a Slide ships for a Preset, parsed. */
const render = (preset: ContextPresetId, locale = 'en') =>
  load(renderToStaticMarkup(createElement(Context, { preset, locale })));
const renderMini = (preset: MiniPresetId) =>
  load(renderToStaticMarkup(createElement(ContextMiniBars, { preset, locale: 'en' })));
const sections = ($: ReturnType<typeof render>) =>
  $('section')
    .map((_, el) => $(el).attr('aria-label'))
    .get();

describe('success cases', () => {
  it('renders every Preset in both locales, each under its own id', () => {
    // ARRANGE
    const expected = [...CONTEXT_PRESETS, ...CONTEXT_PRESETS];
    // ACT
    const ids = ['en', 'de'].flatMap((locale) =>
      CONTEXT_PRESETS.map((id) => render(id, locale)('[data-cornerstone]').attr('data-cornerstone')),
    );
    // ASSERT
    expect(ids).toEqual(expected);
  });

  it('shows only the parts a Preset names: Slide 8 has no chat, Slide 9 after only the context', () => {
    // ARRANGE
    const expected = { 'slide-8': ['Context window', 'Details'], 'slide-9-after': ['Context window'] };
    // ACT
    const shown = { 'slide-8': sections(render('slide-8')), 'slide-9-after': sections(render('slide-9-after')) };
    // ASSERT
    expect(shown).toEqual(expected);
  });

  it('draws Technical as /context: 100 boxes, and the German words in German', () => {
    // ARRANGE
    const expected = { boxes: 100, label: 'Kontextfenster' };
    // ACT
    const $ = render('slide-6', 'de');
    // ASSERT
    expect($('[data-roving] > *')).toHaveLength(expected.boxes);
    expect(sections($)).toEqual([expected.label]);
  });

  it('lets a Slide say a word differently', () => {
    // ARRANGE
    const expected = 'The window';
    // ACT
    const data = contextViewData({ preset: 'slide-6', locale: 'en', words: { contextWindow: expected } });
    // ASSERT
    expect(data.words.contextWindow).toBe(expected);
  });
});

describe('failure cases', () => {
  it('refuses a Preset id the config does not hold', () => {
    // ARRANGE
    const expected = 'context window: unknown Preset "slide-99"';
    // ACT
    const unknown = () => contextViewData({ preset: 'slide-99' as ContextPresetId, locale: 'en' });
    // ASSERT
    expect(unknown).toThrow(expected);
  });

  it('shows no toolbar and no timeline for a locked Preset', () => {
    // ARRANGE
    const $ = render('slide-6');
    // ACT
    const toolbar = $('[role="toolbar"]').length;
    const range = $('input[type="range"]').length;
    // ASSERT
    expect(toolbar).toBe(0);
    expect(range).toBe(0);
  });
});

describe('edge cases', () => {
  it('draws no window switch on a Preset without the flag, two window sizes or one', () => {
    // ARRANGE
    const $ = render('slide-4');
    // ACT
    const switches = $('[role="group"][aria-label="Window size"]').length;
    // ASSERT
    expect(switches).toBe(0);
  });

  it('lets the words prop override every word the part owns', () => {
    // ARRANGE
    const own = contextViewData({ preset: 'slide-4', locale: 'en' }).words;
    const words = Object.fromEntries(Object.keys(own).map((key) => [key, `slide:${key}`])) as never;
    // ACT
    const data = contextViewData({ preset: 'slide-4', locale: 'en', words });
    // ASSERT
    expect(data.words).toStrictEqual(words);
  });

  it('keeps the 200K | 1M switch on Slide 5, whose controls are hidden', () => {
    // ARRANGE
    const expected = ['200K', '1M'];
    // ACT
    const $ = render('slide-5');
    const switches = $('[role="group"][aria-label="Window size"] button')
      .map((_, el) => $(el).text())
      .get();
    // ASSERT
    expect($('[role="toolbar"]')).toHaveLength(0);
    expect(switches).toEqual(expected);
  });

  it('hides the meter on Slide 9 and greys a thrown-away worker on Slide 11', () => {
    // ARRANGE
    const expected = { meter: 'hidden', discarded: 1 };
    // ACT
    const meter = render('slide-9-before')('[data-cornerstone]').attr('data-meter');
    const discarded = renderMini('slide-11-after')('figure[data-discarded]').length;
    // ASSERT
    expect({ meter, discarded }).toEqual(expected);
  });
});
