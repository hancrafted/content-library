import { episodeRef } from '@/episodes/lib/episode-folders';
import { placeSections } from '@/episodes/lib/episode.pure';
import type { Locale } from '@/shared/lib/locale.pure';
import { load } from 'cheerio';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { localizeSlide, type LocalizedSlide } from './localized-slide';
import { slide, type Slide } from './slide';

const STAND_IN_EPISODE = episodeRef('ai-attention-span').id;

const STAND_IN_SECTION = slide({
  slug: 'section',
  messages: { en: { title: 'Section' }, de: { title: 'Abschnitt' } },
  content: () => null,
});

export function localizedInHarness(under: Slide, locale: Locale = 'en'): LocalizedSlide {
  const placed = placeSections<Slide>([[STAND_IN_SECTION, under]]).flat();
  return localizeSlide(placed[1] as never, {
    episode: STAND_IN_EPISODE,
    locale,
    placed,
    referenceLabels: {
      ref: 'opens speaker note',
      marker: (title) => `Speaker note: ${title}`,
    },
    header: 'shared',
  });
}

export function renderedInHarness(under: Slide, locale: Locale = 'en') {
  return load(renderToStaticMarkup(createElement(Fragment, null, localizedInHarness(under, locale).content)));
}
