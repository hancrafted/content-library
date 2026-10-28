import { localizeSlide } from '@/episodes/components/slide-master/localized-slide';
import type { Slide } from '@/episodes/components/slide-master/slide';
import { episodeRef } from '@/episodes/lib/episode-folders';
import { placeSections } from '@/episodes/lib/episode.pure';
import type { Locale } from '@/shared/lib/locale.pure';
import { load } from 'cheerio';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { theThoughtExperimentSection } from './the-thought-experiment';

/*
 * The Section "The thought experiment" as the CyberForum webinar presents it, read through the page's own interface:
 * each Slide localized into this Episode and its Scene rendered. German keeps the English acronym, so the chips
 * spell PRICE in both locales.
 */

const PLACED = placeSections<Slide>([theThoughtExperimentSection]).flat();

/** A Slide's Scene as the page renders it, with the shared Slide header. */
function sceneOf(slug: string, locale: Locale) {
  const own = PLACED.find((entry) => entry.slide.slug === slug);
  if (own === undefined) throw new Error(`No Slide "${slug}" in the Section.`);
  const localized = localizeSlide(own, {
    episode: episodeRef('onboard-ai-every-time', '2026-10-28-cyberforum-akademie-intro-agentic-workflow').id,
    locale,
    placed: PLACED,
    referenceLabels: { ref: 'opens speaker note', marker: (title) => `Speaker note: ${title}` },
    header: 'shared',
  });
  return load(renderToStaticMarkup(localized.content));
}

describe('success cases', () => {
  it('spells PRICE on the trait chips of "Pay the price" in German', () => {
    // ARRANGE
    const expected = 'PRICE';
    // ACT
    const $ = sceneOf('pay-the-price', 'de');
    const letters = $('[data-trait-initial]')
      .map((_, chip) => $(chip).text())
      .get()
      .join('');
    // ASSERT
    expect(letters).toBe(expected);
  });

  it('spells PRICE on the trait letters of "One prompt" in German', () => {
    // ARRANGE
    const expected = 'PRICE';
    // ACT
    const $ = sceneOf('one-prompt', 'de');
    const letters = $('[data-trait-initial]')
      .map((_, chip) => $(chip).text())
      .get()
      .join('');
    // ASSERT
    expect(letters).toBe(expected);
  });
});

describe('failure cases', () => {
  it('sets no gloss under an English trait name, since the name already is the viewer’s word', () => {
    // ARRANGE
    const expected = { 'pay-the-price': 0, 'one-prompt': 0 };
    // ACT
    const glosses = {
      'pay-the-price': sceneOf('pay-the-price', 'en')('[data-trait-gloss]').length,
      'one-prompt': sceneOf('one-prompt', 'en')('[data-trait-gloss]').length,
    };
    // ASSERT
    expect(glosses).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('glosses every English trait name in German, so the acronym stays readable', () => {
    // ARRANGE
    const expected = ['probabilistisch', 'unermüdlich', 'informiert', 'selbstsicher', 'jedes Wort berechnet'];
    // ACT
    const $ = sceneOf('pay-the-price', 'de');
    const glosses = $('[data-trait-gloss]')
      .map((_, gloss) => $(gloss).text())
      .get();
    // ASSERT
    expect(glosses).toEqual(expected);
  });
});
