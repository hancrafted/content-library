import { localizeSlide, type LocalizedSlide } from '@/components/slide-master/localized-slide';
import { slide, type Slide } from '@/components/slide-master/slide';
import { placeSections } from '@/lib/episode.pure';
import type { Locale } from '@/lib/locale.pure';
import { load } from 'cheerio';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { whatsReallyInTheWindow } from './slide';

const SECTION = slide({
  slug: 'section',
  messages: { en: { title: 'Section' }, de: { title: 'Abschnitt' } },
  content: () => null,
});

function localized(locale: Locale): LocalizedSlide {
  const placed = placeSections<Slide>([[SECTION, whatsReallyInTheWindow]]).flat();
  return localizeSlide(placed[1] as never, {
    episode: '2026-10-23-axel-agentic-workflow__ai-attention-span',
    locale,
    placed,
    referenceLabels: { ref: 'opens speaker note', marker: (title) => `Speaker note: ${title}` },
    header: 'shared',
  });
}

const scene = (locale: Locale) => load(renderToStaticMarkup(createElement(Fragment, null, localized(locale).content)));

describe('success cases', () => {
  it('says "context window" in its title, in both locales', () => {
    // ARRANGE
    const expected = { en: "What's really in the context window", de: 'Was wirklich im Kontextfenster steckt' };
    // ACT
    const titles = { en: localized('en').title, de: localized('de').title };
    // ASSERT
    expect(titles).toEqual(expected);
  });

  it('shows the context window and the details, without chat or timeline', () => {
    // ARRANGE
    const expected = { preset: 'slide-7-parts', parts: ['Context window', 'Details'] };
    // ACT
    const $ = scene('en');
    const parts = $('[data-cornerstone] section')
      .map((_, el) => $(el).attr('aria-label'))
      .get();
    // ASSERT
    expect({ preset: $('[data-cornerstone]').attr('data-cornerstone'), parts }).toEqual(expected);
  });

  it('gives the window and the category each their own Technical toggle', () => {
    // ARRANGE
    const expected = ['Technical window', 'Technical context category'];
    // ACT
    const $ = scene('en');
    const toggles = $('[data-cornerstone] button[data-control]')
      .map((_, el) => $(el).attr('aria-label'))
      .get();
    // ASSERT
    expect(toggles).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('opens in the Simple view', () => {
    // ARRANGE
    const expected = 'false';
    // ACT
    const pressed = scene('en')('[data-cornerstone] button[data-control="windowTechnical"]').attr('aria-pressed');
    // ASSERT
    expect(pressed).toBe(expected);
  });
});

describe('failure cases', () => {
  it('shows neither the conversation nor the timeline', () => {
    // ARRANGE
    const expected = { chat: 0, timeline: 0 };
    // ACT
    const $ = scene('en');
    const found = {
      chat: $('[data-cornerstone] section[aria-label="Chat"]').length,
      timeline: $('[data-cornerstone] input[type="range"]').length,
    };
    // ASSERT
    expect(found).toEqual(expected);
  });
});
