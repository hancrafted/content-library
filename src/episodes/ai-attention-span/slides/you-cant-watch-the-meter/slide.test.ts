import { localizeSlide, type LocalizedSlide } from '@/episodes/components/slide-master/localized-slide';
import { slide, type Slide } from '@/episodes/components/slide-master/slide';
import { placeSections } from '@/episodes/lib/episode.pure';
import type { Locale } from '@/shared/lib/locale.pure';
import { load } from 'cheerio';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { youCantWatchTheMeter } from './slide';

const SECTION = slide({
  slug: 'section',
  messages: { en: { title: 'Section' }, de: { title: 'Abschnitt' } },
  content: () => null,
});

function localized(locale: Locale): LocalizedSlide {
  const placed = placeSections<Slide>([[SECTION, youCantWatchTheMeter]]).flat();
  return localizeSlide(placed[1] as never, {
    episode: 'ai-attention-span',
    locale,
    placed,
    referenceLabels: { ref: 'opens speaker note', marker: (title) => `Speaker note: ${title}` },
    header: 'shared',
  });
}

const scene = (locale: Locale) => load(renderToStaticMarkup(createElement(Fragment, null, localized(locale).content)));

describe('success cases', () => {
  it('leads to the callout with its new title and caption, in both locales', () => {
    // ARRANGE
    const expected = {
      en: {
        title: "The chat looks the same. The window doesn't.",
        caption:
          'Left, the full window; right, the same chat after auto-compaction. On screen it is still one ongoing chat.',
      },
      de: {
        title: 'Der Chat sieht gleich aus. Das Fenster nicht.',
        caption:
          'Links das volle Fenster, rechts derselbe Chat nach der automatischen Verdichtung. Auf dem Bildschirm ist es weiter ein laufender Chat.',
      },
    };
    // ACT
    const read = (locale: Locale, words: { caption: string }) => ({
      title: localized(locale).title,
      caption: words.caption,
    });
    // ASSERT
    expect({ en: read('en', en), de: read('de', de) }).toEqual(expected);
  });

  it('keeps the callout that most chat apps never show how full the window is', () => {
    // ARRANGE
    const expected = 'Most chat apps never show you how full the window is.';
    // ACT
    const heading = scene('en')('.bg-primary p').first().text();
    // ASSERT
    expect(heading).toBe(expected);
  });
});

describe('failure cases', () => {
  it('shows no context category under the middle conversation', () => {
    // ARRANGE
    const expected = { chat: 1, usageLists: 0 };
    // ACT
    const $ = scene('en');
    const middle = $('[data-cornerstone="slide-9-chat"]');
    // ASSERT
    expect({
      chat: middle.find('section[aria-label="Chat"]').length,
      usageLists: middle.find('[role="group"][aria-label="Usage by category"]').length,
    }).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('keeps the before and after windows around the chat', () => {
    // ARRANGE
    const expected = ['slide-9-before', 'slide-9-chat', 'slide-9-after'];
    // ACT
    const $ = scene('en');
    const presets = $('[data-cornerstone]')
      .map((_, el) => $(el).attr('data-cornerstone'))
      .get();
    // ASSERT
    expect(presets).toEqual(expected);
  });
});
