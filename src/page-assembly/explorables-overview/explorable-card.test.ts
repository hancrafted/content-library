import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ExplorableCardView, type ExplorableCard } from './explorable-card';

const CARD: ExplorableCard = {
  slug: 'context-window',
  route: '/explorables/context-window',
  typeLabel: 'Explorable',
  artwork: 'intention-capacity',
  title: 'Read the context',
  description: 'See what the model reads.',
  leadTag: 'context-engineering',
  tags: [
    { id: 'context-engineering', label: 'Context engineering', tooltip: 'Context' },
    { id: 'workflow', label: 'Workflow', tooltip: 'Steps' },
  ],
};

function render(locale: 'en' | 'de' = 'en', open = 'Open') {
  return load(renderToStaticMarkup(createElement(ExplorableCardView, { card: CARD, locale, open })));
}

describe('success cases', () => {
  it('places the selected intention and capacity artwork above the reading surface and explicit cue', () => {
    // ARRANGE
    const position = 'top';
    const artwork = 'intention-capacity';
    const open = 'Open';
    // ACT
    const $ = render();
    // ASSERT
    expect($('[data-explorable-card]').attr('data-card-visual-position')).toBe(position);
    expect($('[data-card-visual] [data-card-artwork]').attr('data-card-artwork')).toBe(artwork);
    expect($('[data-card-body] h2').text()).toBe(CARD.title);
    expect($('[data-card-body]').text()).toContain(CARD.description);
    expect($('[data-card-body]').text()).toContain(CARD.typeLabel);
    expect($('[data-card-body]').text()).toContain(CARD.tags[0].label);
    expect($('[data-explorable-tags]').text()).toContain(CARD.tags[1].label);
    expect($('[data-ink-primary]').text()).toBe(open);
  });
});

describe('failure cases', () => {
  it('keeps decorative artwork out of the reading surface and creates no competing link', () => {
    // ARRANGE
    const artworkSelector = '[data-drift-still], [data-card-artwork], canvas';
    // ACT
    const $ = render();
    // ASSERT
    expect($('[data-card-body]').find(artworkSelector).length).toBe(0);
    expect($('[data-card-media]').length).toBe(0);
    expect($('a').length).toBe(1);
    expect($('[data-card-visual]').attr('aria-hidden')).toBeDefined();
  });
});

describe('edge cases', () => {
  it('keeps the German canonical card link and owner-provided Open label', () => {
    // ARRANGE
    const href = '/de/explorables/context-window';
    const open = 'Öffnen';
    // ACT
    const $ = render('de', open);
    // ASSERT
    expect($('[data-card-link]').attr('href')).toBe(href);
    expect($('[data-ink-primary]').text()).toBe(open);
  });
});
