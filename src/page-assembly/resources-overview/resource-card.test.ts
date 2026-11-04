import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ResourceCardView, type ResourceCard } from './resource-card';
import type { ResourceKind } from './resource-index.pure';

const CARD: ResourceCard = {
  slug: 'episode:reading',
  route: '/episodes/reading',
  kind: 'episode',
  kindLabel: 'Episode',
  title: 'Read the context',
  description: 'See what the model reads.',
  leadTag: 'context-engineering',
  tags: [
    { id: 'context-engineering', label: 'Context engineering', tooltip: 'Context' },
    { id: 'workflow', label: 'Workflow', tooltip: 'Steps' },
  ],
};

function render(card = CARD, locale: 'en' | 'de' = 'en', open = 'Open') {
  return load(renderToStaticMarkup(createElement(ResourceCardView, { card, locale, open })));
}

describe('success cases', () => {
  it('gives an Episode its lead Tag graphic on the left and an explicit Open cue', () => {
    // ARRANGE
    const position = 'left';
    const selectedConnector =
      'M170 64v19m-8-9 8 9 8-9M170 129v19m-8-9 8 9 8-9M147 106H83m11-8-11 8 11 8M193 106h64m-11-8 11 8-11 8';
    const accent = '--card-accent:var(--tag-context-engineering)';
    const open = 'Open';
    // ACT
    const $ = render();
    // ASSERT
    expect($('[data-resource-card]').attr('data-card-visual-position')).toBe(position);
    expect(
      $('[data-card-visual] path')
        .map((_, path) => $(path).attr('d'))
        .get(),
    ).toContain(selectedConnector);
    expect($('[data-resource-card]').attr('style')).toContain(accent);
    expect($('[data-ink-primary]').text()).toBe(open);
    expect($('[data-card-body]').text()).toContain(CARD.description);
    expect($('[data-card-body]').text()).toContain(CARD.tags[0].label);
    expect($('[data-resource-tags]').text()).toContain(CARD.tags[1].label);
  });
  it.each(['context-engineering', 'agentic-ai', 'markdown', 'cost', 'sales', 'workflow'] as const)(
    'shares selected %s artwork between Episode and Event Resource cards',
    (tag) => {
      // ARRANGE
      const card: ResourceCard = { ...CARD, leadTag: tag, tags: [{ id: tag, label: tag, tooltip: tag }] };
      const position = 'left';
      // ACT
      const episode = render(card);
      const event = render({ ...card, kind: 'event' });
      // ASSERT
      expect(event('[data-resource-card]').attr('data-card-visual-position')).toBe(position);
      expect(event('[data-card-visual] svg').toString()).toBe(episode('[data-card-visual] svg').toString());
      expect(event('[data-resource-card]').attr('style')).toBe(episode('[data-resource-card]').attr('style'));
    },
  );
});

describe('failure cases', () => {
  it.each(['guide', 'episode-template', 'master-slide'] as ResourceKind[])(
    'draws %s without a panel, empty rail or corner art even if a story is supplied',
    (kind) => {
      // ARRANGE
      const card = { ...CARD, kind, story: 'context-window' as const };
      const position = 'none';
      // ACT
      const $ = render(card);
      // ASSERT
      expect($('[data-resource-card]').attr('data-card-visual-position')).toBe(position);
      expect($('[data-card-visual], [data-card-media], [data-card-artwork], [data-drift-still]').length).toBe(0);
      expect($('[data-card-body] h2').text()).toBe(CARD.title);
    },
  );
});

describe('edge cases', () => {
  it('keeps Explorable story identity at the top and localized native whole-card navigation', () => {
    // ARRANGE
    const card: ResourceCard = {
      ...CARD,
      kind: 'explorable-page',
      route: '/explorables/context-window',
      story: 'context-window',
    };
    const position = 'top';
    const story = 'context-window';
    const href = '/de/explorables/context-window';
    const open = 'Öffnen';
    // ACT
    const $ = render(card, 'de', open);
    // ASSERT
    expect($('[data-resource-card]').attr('data-card-visual-position')).toBe(position);
    expect($('[data-card-visual] [data-drift-still]').attr('data-drift-still')).toBe(story);
    expect($('[data-card-link]').attr('href')).toBe(href);
    expect($('a').length).toBe(1);
    expect($('[data-ink-primary]').text()).toBe(open);
  });
});
