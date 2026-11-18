import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { explorableData } from './brief-or-pay-the-price-data';
import type { ViewId } from './brief-or-pay-the-price.types';
import { start, step } from './explorable-state.pure';
import { Toolbar } from './toolbar.client';

const none = () => undefined;

const toolbar = (locale: 'en' | 'de', view: ViewId) => {
  const data = explorableData(locale);
  const state = step(start({ price: 5, brief: 5, brace: 5, 'stages:drive': 5 }, 'drive'), { type: 'view', view });
  return load(
    renderToStaticMarkup(
      createElement(Toolbar, {
        words: data.words,
        tabs: { ...data.definitions, stages: data.stages.drive as never },
        state,
        scenarios: [],
        controls: {},
        titles: { agent: 'a', workflow: 'w' },
        onView: none,
        onScenario: none,
        onZoom: none,
        onLayer: none,
        onShowAll: none,
        onReset: none,
      }),
    ),
  );
};

const resetLabel = (locale: 'en' | 'de', view: ViewId) => toolbar(locale, view)('[data-reset]').attr('aria-label');

describe('success cases', () => {
  it('names the reset icon "Reset to day one" on PRICE, in en and de', () => {
    // ARRANGE
    const seen = { en: resetLabel('en', 'price'), de: resetLabel('de', 'price') };
    // ACT
    // ASSERT
    expect(seen).toEqual({ en: 'Reset to day one', de: 'Auf Tag eins zurücksetzen' });
  });

  it('names the play icon "Show all and play", in en and de', () => {
    // ARRANGE
    const seen = ['en', 'de'].map((locale) =>
      toolbar(locale as 'en' | 'de', 'price')('[data-show-all]').attr('aria-label'),
    );
    // ACT
    // ASSERT
    expect(seen).toEqual(['Show all and play', 'Alle zeigen und abspielen']);
  });
});

describe('failure cases', () => {
  it.each(['brief', 'stages', 'brace'] as const)(
    'names the reset icon only "Reset" on %s, "Zurücksetzen" in de',
    (view) => {
      // ARRANGE
      const seen = [resetLabel('en', view), resetLabel('de', view)];
      // ACT
      // ASSERT
      expect(seen).toEqual(['Reset', 'Zurücksetzen']);
    },
  );
});

describe('edge cases', () => {
  it('draws no footer line: no hint text, and the icons sit in the toolbar', () => {
    // ARRANGE
    const $ = toolbar('en', 'price');
    const icons = ['[data-show-all]', '[data-reset]'];
    // ACT
    const inside = icons.map((icon) => $(`[role="toolbar"] ${icon}`).length);
    // ASSERT
    expect(inside).toEqual([1, 1]);
    expect($.text()).not.toContain('Hover a letter');
  });
});
