import { localizeSlide } from '@/episodes/components/slide-master/localized-slide';
import type { Slide } from '@/episodes/components/slide-master/slide';
import { placeSections } from '@/episodes/lib/episode.pure';
import type { Locale } from '@/shared/lib/locale.pure';
import { load } from 'cheerio';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { fromSharedUnderstandingToSharedContext } from '../episode';

/*
 * The section slides of "From shared understanding to shared context", as the approved Spec gives them: one per Section,
 * in Spec order, each titled by its Section's h2, carrying its Voice script segments, and each Scene one echo of the
 * dartboard (picked Title-slide Option 0c). The Spec gives these Slides no Speaker notes.
 */

const SECTIONS = fromSharedUnderstandingToSharedContext.sections;
const OPENERS = SECTIONS.map(([opener]) => opener as Slide);
const PLACED = placeSections<Slide>(SECTIONS.map(([opener]) => [opener as Slide])).flat();

/** A section slide's Scene as the page renders it under the shared Slide header. */
function sceneOf(slug: string, locale: Locale = 'en') {
  const own = PLACED.find((entry) => entry.slide.slug === slug);
  if (own === undefined) throw new Error(`No section slide "${slug}".`);
  const localized = localizeSlide(own, {
    episode: 'from-shared-understanding-to-shared-context',
    locale,
    placed: PLACED,
    referenceLabels: { ref: 'opens speaker note', marker: (title) => `Speaker note: ${title}` },
    header: 'shared',
  });
  return load(renderToStaticMarkup(createElement(Fragment, null, localized.content)));
}

/** A section slide's title and Voice script segment titles in one locale. */
function scriptOf(slide: Slide, locale: Locale) {
  const messages = slide.messages[locale] as {
    title: string;
    voiceScript: { segments: Record<string, { title: string }> };
  };
  return {
    title: messages.title,
    segments: slide.segments.map(({ slug }) => messages.voiceScript.segments[slug]?.title),
  };
}

describe('success cases', () => {
  it('opens the four Sections in Spec order, each titled and scripted as the Spec writes it', () => {
    // ARRANGE
    // Han's proofread renames the Section 2 opener's first segment: the pain is old, since the Section is about before AI.
    const expected = [
      { title: 'A thought experiment', segments: ['Imagine your organization as a line', 'Where this is going'] },
      {
        title: 'Why precise and accurate requirements mattered before AI',
        segments: ['An old pain', 'Where the Section goes'],
      },
      { title: 'Context is the requirement', segments: ['The claim', 'The route'] },
      { title: 'Creating context for agents', segments: ['The pain', 'The claim'] },
    ];
    // ACT
    const actual = OPENERS.map((slide) => scriptOf(slide, 'en'));
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('draws one dartboard per section slide, the echo of the Hero motif', () => {
    // ARRANGE
    const expected = {
      'a-thought-experiment': 1,
      'every-product-is-a-translation': 4,
      'context-is-the-requirement': 1,
      'creating-context-for-agents': 1,
    };
    // ACT
    const actual = Object.fromEntries(OPENERS.map(({ slug }) => [slug, sceneOf(slug)('[data-dartboard]').length]));
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('captions Section 2 on the requirement and Section 3 on context engineering, in both locales', () => {
    // ARRANGE
    // Han's proofread rewrites the Section 2 caption: it no longer uses "precise" and "accurate" before the Section defines them.
    const expected = {
      en: {
        'every-product-is-a-translation':
          'Every product translates an intent. How well that translation is written down decides the result.',
        'context-is-the-requirement':
          'Context engineering: deciding what the AI sees, the way requirements decide what a team builds.',
      },
      de: {
        'every-product-is-a-translation':
          'Jedes Produkt übersetzt eine Absicht. Wie gut diese Übersetzung aufgeschrieben ist, entscheidet über das Ergebnis.',
        'context-is-the-requirement':
          'Context Engineering: entscheiden, was die KI sieht, so wie Anforderungen entscheiden, was ein Team baut.',
      },
    };
    const slugs = ['every-product-is-a-translation', 'context-is-the-requirement'] as const;
    // ACT
    const actual = Object.fromEntries(
      (['en', 'de'] as const).map((locale) => [
        locale,
        Object.fromEntries(
          slugs.map((slug) => {
            const slide = OPENERS.find((opener) => opener.slug === slug);
            return [slug, (slide?.messages[locale] as { caption?: string } | undefined)?.caption];
          }),
        ),
      ]),
    );
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('inks the Title slide out, and every later section slide in and out on an inverse surface', () => {
    // ARRANGE
    const ink = 'liquid';
    const expected = {
      hero: { tone: 'inverse', enter: undefined, leave: ink },
      'every-product-is-a-translation': { tone: 'inverse', enter: ink, leave: ink },
      'context-is-the-requirement': { tone: 'inverse', enter: ink, leave: ink },
      'creating-context-for-agents': { tone: 'inverse', enter: ink, leave: ink },
    };
    const slides = [fromSharedUnderstandingToSharedContext.title as Slide, ...OPENERS.slice(1)];
    // ACT
    const actual = Object.fromEntries(
      slides.map(({ slug, presentation }) => [
        slug,
        { tone: presentation?.tone, enter: presentation?.enter?.effect, leave: presentation?.leave?.effect },
      ]),
    );
    // ASSERT
    expect(actual).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('gives the first section slide no ink, so the Title slide inks straight onto its section band', () => {
    // ARRANGE
    const expected = undefined;
    // ACT
    const actual = OPENERS[0].presentation;
    // ASSERT
    expect(actual).toBe(expected);
  });

  it('declares no Speaker note on a section slide, since the picked Option shows no Context marker', () => {
    // ARRANGE
    const expected = OPENERS.map(() => 0);
    // ACT
    const actual = OPENERS.map((slide) => slide.notes.length);
    // ASSERT
    expect(actual).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('scripts every German section slide segment by segment, as English does', () => {
    // ARRANGE
    const expected = OPENERS.map((slide) => slide.segments.length);
    // ACT
    const actual = OPENERS.map((slide) => scriptOf(slide, 'de').segments.filter((title) => Boolean(title)).length);
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('labels the four boards of the translation Section in German', () => {
    // ARRANGE
    const expected = ['Beides', 'Präzise', 'Genau', 'Keins'];
    // ACT
    const $ = sceneOf('every-product-is-a-translation', 'de');
    const labels = $('[data-board-label]')
      .toArray()
      .map((label) => $(label).text());
    // ASSERT
    expect(labels).toEqual(expected);
  });
});
