import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Context, ContextBarsPreset, contextViewData, SessionBarPreset } from './context';
import { CONTEXT_PRESETS, type ContextPresetId, type MiniPresetId } from './context-data';

/** The server markup a Slide ships for a Preset, parsed. */
const render = (preset: ContextPresetId, locale = 'en') =>
  load(renderToStaticMarkup(createElement(Context, { preset, locale })));
const renderMini = (preset: MiniPresetId, locale = 'en') =>
  load(renderToStaticMarkup(createElement(ContextBarsPreset, { preset, locale })));
const renderSession = (at: string | null, locale = 'en') =>
  load(renderToStaticMarkup(createElement(SessionBarPreset, { at, locale })));
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

  it('draws Attention as a part of its own on Slide 4, in the layout its Preset names', () => {
    // ARRANGE
    const expected = { section: 'Attention', layout: 'compressed' };
    // ACT
    const $ = render('slide-4');
    // ASSERT
    expect(sections($)).toContain(expected.section);
    expect($('[data-layout]').attr('data-layout')).toBe(expected.layout);
    expect($('[data-row]').length).toBeGreaterThan(0);
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

  it('hides the smart-zone column on Slide 9 and greys a thrown-away worker on Slide 11', () => {
    // ARRANGE
    const expected = { zone: 'off', labels: 0, discarded: 1 };
    // ACT
    const $ = render('slide-9-before');
    const zone = $('section[aria-label="Context window"]').attr('data-zone');
    const discarded = renderMini('slide-11-after')('figure[data-discarded]').length;
    // ASSERT
    expect({ zone, labels: $('[class*="labelLimit"]').length, discarded }).toEqual(expected);
  });

  it('draws the session as one segment per Section, filled up to and including the current one', () => {
    // ARRANGE
    const expected = {
      shares: [20, 40, 20, 20],
      states: ['done', 'done', 'current', 'upcoming'],
      label: 'Your attention',
      total: 0,
      now: 'Filling up',
    };
    // ACT
    const $ = renderSession('what-fills-the-window');
    // ASSERT
    expect({
      shares: $('[data-share]')
        .map((_, el) => Number($(el).attr('data-share')))
        .get(),
      states: $('[data-state]')
        .map((_, el) => $(el).attr('data-state'))
        .get(),
      label: $('[data-session-label]').text().trim(),
      total: $('[data-session-total]').length,
      now: $('[data-state="current"]').text().trim(),
    }).toEqual(expected);
  });

  it('shows the session empty on the hero and says so in words', () => {
    // ARRANGE
    const expected = { states: ['upcoming', 'upcoming', 'upcoming', 'upcoming'], current: 0 };
    // ACT
    const $ = renderSession(null);
    // ASSERT
    expect({
      states: $('[data-state]')
        .map((_, el) => $(el).attr('data-state'))
        .get(),
      current: $('[data-state="current"]').length,
    }).toEqual(expected);
    expect($('[role="img"]').attr('aria-label')).toBe('Your attention: Fresh and ready to receive.');
    expect($('[data-session-note]').text().trim()).toBe('Fresh and ready to receive.');
  });

  it('says the session in German', () => {
    // ARRANGE
    const expected = { label: 'Deine Aufmerksamkeit', now: 'Aufwärmen' };
    // ACT
    const $ = renderSession('thought-experiment', 'de');
    // ASSERT
    expect({ label: $('[data-session-label]').text().trim(), now: $('[data-state="current"]').text().trim() }).toEqual(
      expected,
    );
  });

  it('fills the whole session at its end and says so', () => {
    // ARRANGE
    const expected = { states: ['done', 'done', 'done', 'done'], current: 0, note: 'Full to the brim. Well done.' };
    // ACT
    const $ = renderSession('end');
    // ASSERT
    expect({
      states: $('[data-state]')
        .map((_, el) => $(el).attr('data-state'))
        .get(),
      current: $('[data-state="current"]').length,
      note: $('[data-session-note]').text().trim(),
    }).toEqual(expected);
  });
});
