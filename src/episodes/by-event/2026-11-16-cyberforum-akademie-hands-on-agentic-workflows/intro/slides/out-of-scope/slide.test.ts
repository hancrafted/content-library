import { localizeSlide } from '@/episodes/components/slide-master/localized-slide';
import { slide, type Slide } from '@/episodes/components/slide-master/slide';
import { episodeRef } from '@/episodes/lib/episode-folders';
import { placeSections } from '@/episodes/lib/episode.pure';
import type { Locale } from '@/shared/lib/locale.pure';
import { load } from 'cheerio';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { outOfScope } from './slide';

const SECTION = slide({
  slug: 'in-scope',
  messages: { en: { title: 'In scope' }, de: { title: 'Im Umfang' } },
  content: () => null,
});

function sceneOf(locale: Locale = 'en') {
  const placed = placeSections<Slide>([[SECTION, outOfScope]]).flat();
  const localized = localizeSlide(placed[1] as never, {
    episode: episodeRef('intro', '2026-11-16-cyberforum-akademie-hands-on-agentic-workflows').id,
    locale,
    placed,
    referenceLabels: { ref: 'opens speaker note', marker: (title) => `Speaker note: ${title}` },
    header: 'shared',
  });
  return load(renderToStaticMarkup(createElement(Fragment, null, localized.content)));
}

const CROSS = '[data-workshop-items] li svg path[d="M6 6l12 12M18 6L6 18"]';

describe('success cases', () => {
  it('draws a cross as an svg path centred in the circle of each of the three set-aside items', () => {
    // ARRANGE
    const expected = { items: 3, crossPaths: 3 };
    // ACT
    const $ = sceneOf();
    const actual = { items: $('[data-workshop-items] li').length, crossPaths: $(CROSS).length };
    // ASSERT
    expect(actual).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('uses no × glyph for the cross, since a glyph sits on the font baseline and never in the circle middle', () => {
    // ARRANGE
    const expected = { glyphs: 0 };
    // ACT
    const actual = { glyphs: sceneOf()('[data-workshop-items]').text().split('×').length - 1 };
    // ASSERT
    expect(actual).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('draws the same three crosses on the German page', () => {
    // ARRANGE
    const expected = { crossPaths: 3 };
    // ACT
    const actual = { crossPaths: sceneOf('de')(CROSS).length };
    // ASSERT
    expect(actual).toEqual(expected);
  });
});
