import { localizeSlide, type LocalizedSlide } from '@/episodes/components/slide-master/localized-slide';
import { slide, type Slide } from '@/episodes/components/slide-master/slide';
import { placeSections } from '@/episodes/lib/episode.pure';
import type { Locale } from '@/shared/lib/locale.pure';
import { load } from 'cheerio';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { aiForgetsTheMiddleToo } from './slide';

/*
 * AI forgets the middle too, read through the one interface the page reads a Slide by:
 * localized into an Episode on the shared Slide header, its text, notes and Voice script as the drawer gets them and
 * its Scene as the page renders it. The section slide is a stand-in, so the test reaches no Episode file.
 */

const SECTION = slide({
  slug: 'managing-the-attention-span',
  messages: { en: { title: 'Managing the attention span' }, de: { title: 'Die Aufmerksamkeitsspanne managen' } },
  content: () => null,
});

function localized(locale: Locale): LocalizedSlide {
  const placed = placeSections<Slide>([[SECTION, aiForgetsTheMiddleToo]]).flat();
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
  it('ends the AI thread on a confident full plan whose total is over the 30,000 budget, in the budget tint', () => {
    // ARRANGE
    const expected = {
      en: {
        reply: 'Here is the full plan: venue 17,000 €, catering 19,300 €, band 6,000 €. Total 42,300 €.',
        tint: '42,300 €',
      },
      de: {
        reply: 'Hier ist der ganze Plan: Ort 17.000 €, Catering 19.300 €, Band 6.000 €. Gesamt 42.300 €.',
        tint: '42.300 €',
      },
    };
    // ACT
    const read = (locale: Locale) => {
      const $ = scene(locale);
      const last = $('[data-side="ai"] [data-who="ai"]').last();
      return { reply: last.text().trim(), tint: last.find('[data-budget]').last().text() };
    };
    const actual = { en: read('en'), de: read('de') };
    // ASSERT
    expect(actual).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('no longer has the AI ask for the budget it was told', () => {
    // ARRANGE
    const asks = /\?\s*$/;
    // ACT
    const replies = (['en', 'de'] as const).map((locale) =>
      scene(locale)('[data-side="ai"] [data-who="ai"]').last().text().trim(),
    );
    // ASSERT
    expect(replies.some((reply) => asks.test(reply))).toBe(false);
  });
});

describe('edge cases', () => {
  it('lets the plan parts add up to its total, which is over the 30,000 budget', () => {
    // ARRANGE
    const budget = 30_000;
    // ACT
    const totals = (['en', 'de'] as const).map((locale) => {
      const text = scene(locale)('[data-side="ai"] [data-who="ai"]').last().text();
      const amounts = [...text.matchAll(/(\d+[.,]\d{3}) €/g)].map((m) => Number(m[1].replace(/[.,]/g, '')));
      return { parts: amounts.slice(0, -1).reduce((a, b) => a + b, 0), total: amounts.at(-1) ?? 0 };
    });
    // ASSERT
    for (const { parts, total } of totals) {
      expect(total).toBe(parts);
      expect(total).toBeGreaterThan(budget);
    }
  });
});
