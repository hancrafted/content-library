import { localizeSlide } from '@/episodes/components/slide-master/localized-slide';
import type { Slide } from '@/episodes/components/slide-master/slide';
import { episodeRef } from '@/episodes/lib/episode-folders';
import { placeSections } from '@/episodes/lib/episode.pure';
import type { Locale } from '@/shared/lib/locale.pure';
import { load } from 'cheerio';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { theThoughtExperimentSection } from './the-thought-experiment';

const PLACED = placeSections<Slide>([theThoughtExperimentSection]).flat();

function sceneOf(slug: string, locale: Locale) {
  const own = PLACED.find((entry) => entry.slide.slug === slug);
  if (own === undefined) throw new Error(`No Slide "${slug}" in the Section.`);
  const localized = localizeSlide(own, {
    episode: episodeRef('onboard-ai-every-time', '2026-11-18-cyberforum-exi-digital-agentic-workflows').id,
    locale,
    placed: PLACED,
    referenceLabels: { ref: 'opens speaker note', marker: (title) => `Speaker note: ${title}` },
    header: 'shared',
  });
  return load(renderToStaticMarkup(localized.content));
}

const mounted = ($: ReturnType<typeof sceneOf>) => ({
  explorable: $('[data-explorable]').attr('data-explorable'),
  level: $('[data-explorable]').attr('data-level'),
});

describe('success cases', () => {
  it('mounts the Explorable on the PRICE definition in "Pay the price"', () => {
    // ARRANGE
    const expected = { explorable: 'brief-or-pay-the-price', level: 'define' };
    // ACT
    const $ = sceneOf('pay-the-price', 'de');
    // ASSERT
    expect(mounted($)).toEqual(expected);
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
  it('sets no gloss under an English trait name of "One prompt", since the name already is the viewer’s word', () => {
    // ARRANGE
    const expected = 0;
    // ACT
    const glosses = sceneOf('one-prompt', 'en')('[data-trait-gloss]').length;
    // ASSERT
    expect(glosses).toBe(expected);
  });
});

describe('edge cases', () => {
  it('mounts the same Explorable in English as in German', () => {
    // ARRANGE
    const expected = mounted(sceneOf('pay-the-price', 'de'));
    // ACT
    const found = mounted(sceneOf('pay-the-price', 'en'));
    // ASSERT
    expect(found).toEqual(expected);
  });
});
