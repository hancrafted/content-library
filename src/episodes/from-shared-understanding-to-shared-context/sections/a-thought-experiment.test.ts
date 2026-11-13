import { localizeSlide } from '@/episodes/components/slide-master/localized-slide';
import type { Slide } from '@/episodes/components/slide-master/slide';
import { placeSections } from '@/episodes/lib/episode.pure';
import type { Locale } from '@/shared/lib/locale.pure';
import { load } from 'cheerio';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { aThoughtExperimentSection } from './a-thought-experiment';

/*
 * Section 1, "A thought experiment", as the approved Spec gives it: its section slide, then Slides 1 to 3 built to the
 * picked Options 1c, 2c and 3b, each titled, scripted and noted as the Spec writes it, and each Scene drawing the
 * factory line its Option shows.
 */

const SLIDES = aThoughtExperimentSection as readonly Slide[];
const PLACED = placeSections<Slide>([aThoughtExperimentSection]).flat();

interface Messages {
  title: string;
  heading?: string;
  voiceScript: { segments: Record<string, { title: string }> };
  notes?: Record<string, { header: string }>;
}

const messagesOf = (slide: Slide, locale: Locale = 'en') => slide.messages[locale] as unknown as Messages;

const slideOf = (slug: string) => {
  const own = SLIDES.find((slide) => slide.slug === slug);
  if (own === undefined) throw new Error(`No Slide "${slug}" in the Section.`);
  return own;
};

/** A Slide's Scene as the page renders it under the shared Slide header. */
function sceneOf(slug: string, locale: Locale = 'en') {
  const own = PLACED.find((entry) => entry.slide.slug === slug);
  if (own === undefined) throw new Error(`No Slide "${slug}" placed.`);
  const localized = localizeSlide(own, {
    episode: 'from-shared-understanding-to-shared-context',
    locale,
    placed: PLACED,
    referenceLabels: { ref: 'opens speaker note', marker: (title) => `Speaker note: ${title}` },
    header: 'shared',
  });
  return load(renderToStaticMarkup(createElement(Fragment, null, localized.content)));
}

const MARKER = '[data-context-ref]';

describe('success cases', () => {
  it('places the three Slides after the section slide, in Spec order, under their Spec titles', () => {
    // ARRANGE
    const expected = [
      'A thought experiment',
      'What the customer really wanted',
      'What happens with AI',
      'Speed the whole line can carry',
    ];
    // ACT
    const actual = SLIDES.map((slide) => messagesOf(slide).title);
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('scripts each Slide in the Spec’s Voice script segments', () => {
    // ARRANGE
    const expected = {
      'what-the-customer-really-wanted': ['The Hook', 'Cartoon to balanced line', 'Reality'],
      'what-happens-with-ai': ['Every station faster', 'Moving bottleneck'],
      'speed-the-whole-line-can-carry': ['One fast station is not the goal', 'Bridge'],
    };
    // ACT
    const actual = Object.fromEntries(
      Object.keys(expected).map((slug) => {
        const slide = slideOf(slug);
        return [slug, slide.segments.map((segment) => messagesOf(slide).voiceScript.segments[segment.slug]?.title)];
      }),
    );
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('notes each Slide with the Spec’s Speaker notes and their sources', () => {
    // ARRANGE
    const dora = 'https://dora.dev/research/2025/dora-report/';
    const faros = 'https://www.faros.ai/blog/ai-software-engineering';
    const expected = {
      'what-the-customer-really-wanted': [{ header: 'Why the line gets out of balance', sources: [dora] }],
      'what-happens-with-ai': [
        { header: 'Measured: the load moves to review', sources: [faros] },
        { header: 'Engineers say the same', sources: ['https://dora.dev/insights/balancing-ai-tensions/'] },
        { header: 'What is measured and what is inferred', sources: [faros] },
      ],
      'speed-the-whole-line-can-carry': [{ header: 'Returns come from the system', sources: [dora] }],
    };
    // ACT
    const actual = Object.fromEntries(
      Object.keys(expected).map((slug) => {
        const slide = slideOf(slug);
        return [
          slug,
          slide.notes.map((note) => ({
            header: messagesOf(slide).notes?.[note.slug]?.header,
            sources: (note.sources ?? []).map((source) => source.url),
          })),
        ];
      }),
    );
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('shows Slide 2 under the on-screen title its picked Option gives', () => {
    // ARRANGE
    const expected = 'What happens when every station gets AI';
    // ACT
    const actual = messagesOf(slideOf('what-happens-with-ai')).heading;
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('draws Slide 1 as the cartoon poster answered by the balanced line and the real one with its dials', () => {
    // ARRANGE
    const expected = { cartoon: 4, lines: 2, dials: 3, queued: 9, markers: ['why-the-line-gets-out-of-balance'] };
    // ACT
    const $ = sceneOf('what-the-customer-really-wanted');
    const actual = {
      cartoon: $('[data-cartoon-card]').length,
      lines: $('ol:has([data-station])').length,
      dials: $('[data-dial]').length,
      queued: $('[data-queued]').length,
      markers: $(MARKER)
        .toArray()
        .map((marker) => $(marker).attr('data-context-ref')),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('zooms Slide 2 in on the review station behind a pile of 28 documents', () => {
    // ARRANGE
    const expected = {
      pile: 28,
      markers: ['measured-the-load-moves-to-review', 'engineers-say-the-same', 'what-is-measured-and-what-is-inferred'],
    };
    // ACT
    const $ = sceneOf('what-happens-with-ai');
    const actual = {
      pile: $('[data-target="review-queue"] [data-queued]').length,
      markers: $(MARKER)
        .toArray()
        .map((marker) => $(marker).attr('data-context-ref')),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('draws Slide 3 as five equal bars over the balanced line, the customer at both ends', () => {
    // ARRANGE
    const expected = { bars: 5, stations: 5, ends: 2, markers: ['returns-come-from-the-system'] };
    // ACT
    const $ = sceneOf('speed-the-whole-line-can-carry');
    const actual = {
      bars: $('[data-pace-bar]').length,
      stations: $('[data-station]').length,
      ends: $('[data-customer]').length,
      markers: $(MARKER)
        .toArray()
        .map((marker) => $(marker).attr('data-context-ref')),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('closes Slide 3 on one station up close, the bike bench, and says it will return', () => {
    // ARRANGE
    const expected = {
      en: { label: 'One station up close: the bike bench', benches: 1 },
      de: { label: 'Eine Station aus der Nähe: die Fahrradwerkbank', benches: 1 },
      line: 'Keep an eye on this one station; we come back to it.',
    };
    const slug = 'speed-the-whole-line-can-carry';
    // ACT
    const zoom = (locale: Locale) => {
      const $ = sceneOf(slug, locale);
      return { label: $('[data-bench-zoom] figcaption').text(), benches: $('[data-bench-zoom] svg').length };
    };
    const own = aThoughtExperimentSection.find((slide) => slide.slug === slug)?.messages.en as
      { voiceScript: { segments: Record<string, { script: string }> } } | undefined;
    const actual = {
      en: zoom('en'),
      de: zoom('de'),
      script: own?.voiceScript.segments['one-fast-station-is-not-the-goal'].script,
    };
    // ASSERT
    expect({ en: actual.en, de: actual.de }).toEqual({ en: expected.en, de: expected.de });
    expect(actual.script).toContain(expected.line);
  });
});

describe('failure cases', () => {
  it('gives Slide 1 no flow trigger, since its picked Option overrules the motion to none', () => {
    // ARRANGE
    const expected = 0;
    // ACT
    const triggers = sceneOf('what-the-customer-really-wanted')('[data-play], [role="group"][tabindex]').length;
    // ASSERT
    expect(triggers).toBe(expected);
  });
});

describe('edge cases', () => {
  it('scripts and notes every German Slide as English does', () => {
    // ARRANGE
    const pages = SLIDES.slice(1);
    const expected = pages.map((slide) => [slide.segments.length, slide.notes.length]);
    // ACT
    const actual = pages.map((slide) => {
      const de = messagesOf(slide, 'de');
      return [
        slide.segments.filter((segment) => Boolean(de.voiceScript.segments[segment.slug]?.title)).length,
        slide.notes.filter((note) => Boolean(de.notes?.[note.slug]?.header)).length,
      ];
    });
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('labels the German stations in German', () => {
    // ARRANGE
    const expected = ['Vertrieb', 'Entwurf', 'Bau', 'Prüfung', 'Versand'];
    // ACT
    const $ = sceneOf('speed-the-whole-line-can-carry', 'de');
    const labels = $('[data-station]')
      .toArray()
      .map((station) => $(station).find('span').last().text());
    // ASSERT
    expect(labels).toEqual(expected);
  });
});
