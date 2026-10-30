import { localizeSlide, type LocalizedSlide } from '@/episodes/components/slide-master/localized-slide';
import { slide, type Slide } from '@/episodes/components/slide-master/slide';
import { placeSections } from '@/episodes/lib/episode.pure';
import type { Locale } from '@/shared/lib/locale.pure';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { hero } from './slide';

/*
 * The Slide in Title-slide Option 0b's terminal theme, read through the interface the page reads a Slide by.
 */

const SECTION = slide({
  slug: 'your-terminal',
  messages: { en: { title: 'Your terminal' }, de: { title: 'Dein Terminal' } },
  content: () => null,
});

function localized(locale: Locale): LocalizedSlide {
  const placed = placeSections<Slide>([[SECTION, hero]]).flat();
  return localizeSlide(placed[1] as never, {
    episode: 'setup-ai-agent-and-starter-folder',
    locale,
    placed,
    referenceLabels: { ref: 'opens speaker note', marker: (title) => `Speaker note: ${title}` },
    header: 'shared',
  });
}

function textOf(locale: Locale): string {
  return renderToStaticMarkup(createElement(Fragment, null, localized(locale).content))
    .replace(/<[^>]+>/g, ' ')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ');
}

describe('success cases', () => {
  it('names its place in the four steps in English', () => {
    // ARRANGE
    const expected = 'Guide · 4 steps · about 20 minutes';
    // ACT
    const text = textOf('en');
    // ASSERT
    expect(text).toContain(expected);
  });

  it('names its place in the four steps in German', () => {
    // ARRANGE
    const expected = 'Anleitung · 4 Schritte';
    // ACT
    const text = textOf('de');
    // ASSERT
    expect(text).toContain(expected);
  });

  it('shows "hancrafted-check-setup" in the terminal', () => {
    // ARRANGE
    const expected = 'hancrafted-check-setup';
    // ACT
    const text = textOf('en');
    // ASSERT
    expect(text).toContain(expected);
  });

  it('shows "claude" in the terminal', () => {
    // ARRANGE
    const expected = 'claude';
    // ACT
    const text = textOf('en');
    // ASSERT
    expect(text).toContain(expected);
  });
});

describe('failure cases', () => {
  it('never speaks of eight steps', () => {
    // ARRANGE
    const forbidden = /eight|8 steps|8 Schritte|acht Schritte/i;
    // ACT
    const texts = [textOf('en'), textOf('de')];
    // ASSERT
    for (const text of texts) expect(text).not.toMatch(forbidden);
  });
});

describe('edge cases', () => {
  it('drops the chain of pieces, which the terminal replaced', () => {
    // ARRANGE
    const forbidden = 'The chain';
    // ACT
    const text = textOf('en');
    // ASSERT
    expect(text).not.toContain(forbidden);
  });
});
