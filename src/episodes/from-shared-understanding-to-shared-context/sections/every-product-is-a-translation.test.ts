import { localizeSlide, type LocalizedSlide } from '@/episodes/components/slide-master/localized-slide';
import type { Slide } from '@/episodes/components/slide-master/slide';
import { placeSections } from '@/episodes/lib/episode.pure';
import type { Locale } from '@/shared/lib/locale.pure';
import { load } from 'cheerio';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { everyProductIsATranslationSection } from './every-product-is-a-translation';

/*
 * Section 2 of "From shared understanding to shared context", "Every product is a translation", as the approved Spec
 * gives it: Slides 4 to 6 built to the picked Options 4b, 5b and 6a, each with the Spec's Voice script, Speaker notes
 * and sources, a Context marker wherever the picked mock shows one, and the Scene facts the Option draws. Read through
 * the one interface the page reads a Slide by: localized on the shared Slide header.
 */

const BROOKS = 'https://www.cgl.ucsf.edu/Outreach/pc204/NoSilverBullet.html';
const REWORK =
  'https://github.com/hancrafted/content-library/blob/main/docs/llm-wiki/research/SWE/SWE-0002__unclear-requirements-cause-rework/research.md';
const PROKOP =
  'https://ntrs.nasa.gov/api/citations/20230012909/downloads/Historical%20Aerospace%20Software%20Errors.pdf';
const MUND = 'https://arxiv.org/abs/1702.07656';

const PLACED = placeSections<Slide>([everyProductIsATranslationSection]).flat();

function localized(slug: string, locale: Locale = 'en'): LocalizedSlide {
  const own = PLACED.find((entry) => entry.slide.slug === slug);
  if (own === undefined) throw new Error(`No Slide "${slug}" in the Section.`);
  return localizeSlide(own, {
    episode: 'from-shared-understanding-to-shared-context',
    locale,
    placed: PLACED,
    referenceLabels: { ref: 'opens speaker note', marker: (title) => `Speaker note: ${title}` },
    header: 'shared',
  });
}

const sceneOf = (slug: string, locale: Locale = 'en') =>
  load(renderToStaticMarkup(createElement(Fragment, null, localized(slug, locale).content)));

/** The notes a Slide's Context markers open: the caption's marker first, then the Scene's in document order. */
function markersOf(slug: string) {
  const $ = sceneOf(slug);
  const scene = $('[data-context-ref]')
    .toArray()
    .map((marker) => $(marker).attr('data-context-ref'));
  const caption = localized(slug).header?.captionNote?.note;
  return caption === undefined ? scene : [caption, ...scene];
}

/** The page Slides of the Section, the section slide left out. */
const PAGE_SLIDES = ['value-was-always-translation', 'defining-and-building', 'precision-and-accuracy'];

describe('success cases', () => {
  it('lists Slides 4 to 6 after the section slide, in Spec order, titled by their Spec h3', () => {
    // ARRANGE
    const expected = [
      'Every product is a translation',
      'Value was always translation',
      'Defining and building',
      'Precision and accuracy',
    ];
    // ACT
    const titles = PLACED.map(({ slide }) => localized(slide.slug).title);
    // ASSERT
    expect(titles).toEqual(expected);
  });

  it('carries each Spec Voice script segment by its title, in order', () => {
    // ARRANGE
    const expected = [
      ['Every effort is a translation', 'A translation layer'],
      ['Two halves', 'Foreshadow'],
      ['Precision', 'Accuracy', 'Art, not a science'],
    ];
    // ACT
    const titles = PAGE_SLIDES.map((slug) => localized(slug).voiceScript.map(({ title }) => title));
    // ASSERT
    expect(titles).toEqual(expected);
  });

  it('speaks the Spec Voice script word for word', () => {
    // ARRANGE
    const expected = {
      layer:
        'Think of a restaurant guest who had to walk into the kitchen and cook from the raw ingredients. The menu and the waiter are the translation. Software works the same way: if your customer had to give orders straight to the storeroom where the data lives, in the language of that storeroom, they would not need the screens you built for them. The translation is the work. And this is my hypothesis, not a measured result: the translation is the hard part, not the typing.',
      foreshadow:
        'Remember that last thought, because it comes back. Defining is exactly where the AI can help, by asking you questions the way a good interviewer would. That has a name, meta prompting, and we get to it in the last Section.',
      art: 'Now, honesty about the craft. Writing a good requirement is an art, not a science. You only know whether it was precise and accurate after you have tried it, and that is why this Section sits where it does.',
    };
    // ACT
    const actual = {
      layer: localized('value-was-always-translation').voiceScript[1]?.script,
      foreshadow: localized('defining-and-building').voiceScript[1]?.script,
      art: localized('precision-and-accuracy').voiceScript[2]?.script,
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('gives every Slide the Speaker notes of the Spec, by header, with their sources', () => {
    // ARRANGE
    const expected = [
      [
        { header: 'The hard part is the concept', sources: [BROOKS] },
        { header: 'How strong the evidence is', sources: [BROOKS] },
      ],
      [
        { header: 'Clients cannot state it up front', sources: [BROOKS] },
        { header: 'Practitioners name it too', sources: [REWORK] },
      ],
      [
        { header: 'Missing requirements show up as wrong output', sources: [PROKOP] },
        { header: 'Limits', sources: [PROKOP, MUND] },
      ],
    ];
    // ACT
    const notes = PAGE_SLIDES.map((slug) =>
      localized(slug).notes.map(({ header, sources }) => ({ header, sources: sources?.map(({ url }) => url) })),
    );
    // ASSERT
    expect(notes).toEqual(expected);
  });

  it('places a Context marker for each note wherever the picked Options show one, in reading order', () => {
    // ARRANGE
    const expected = [
      ['how-strong-the-evidence-is', 'the-hard-part-is-the-concept'],
      ['clients-cannot-state-it-up-front', 'practitioners-name-it-too'],
      ['missing-requirements-show-up-as-wrong-output', 'missing-requirements-show-up-as-wrong-output', 'limits'],
    ];
    // ACT
    const markers = PAGE_SLIDES.map(markersOf);
    // ASSERT
    expect(markers).toEqual(expected);
  });

  it('draws Slide 4 as one intent facing its three translations across the arrow on the hairline', () => {
    // ARRANGE
    const expected = { intents: 1, results: ['Product', 'Service', 'Lecture'], arrows: 1, hoverGroups: 1 };
    // ACT
    const $ = sceneOf('value-was-always-translation');
    const actual = {
      intents: $('[data-intent]').length,
      results: $('[data-result] [data-result-kind]')
        .toArray()
        .map((kind) => $(kind).text()),
      arrows: $('[data-translation-arrow]').length,
      hoverGroups: $('.focus-group--dim-others:has([data-result])').length,
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('draws Slide 5 as the defining half asking the rider and the building half with three loaded AI stations', () => {
    // ARRANGE
    const expected = { exchange: ['ai', 'ai', 'human'], stations: [6, 7, 6], facts: 2 };
    // ACT
    const $ = sceneOf('defining-and-building');
    const actual = {
      exchange: $('[data-exchange]')
        .toArray()
        .map((line) => $(line).attr('data-exchange')),
      stations: $('[data-ai-station]')
        .toArray()
        .map((station) => $(station).find('[data-queued-document]').length),
      facts: $('[data-fact]').length,
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('draws Slide 6 as four boards, each beside the work order that lands at the bench', () => {
    // ARRANGE
    const expected = {
      cells: ['precise-off', 'precise-accurate', 'neither', 'accurate-scattered'],
      boards: 4,
      darts: 16,
      crisp: 2,
      vague: 2,
    };
    // ACT
    const $ = sceneOf('precision-and-accuracy');
    const actual = {
      cells: $('[data-outcome]')
        .toArray()
        .map((cell) => $(cell).attr('data-outcome')),
      boards: $('[data-dartboard]').length,
      darts: $('[data-dart]').length,
      crisp: $('[data-work-order="crisp"]').length,
      vague: $('[data-work-order="vague"]').length,
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('marks every note target on exactly one element of its Slide or its caption', () => {
    // ARRANGE
    const expected = PAGE_SLIDES.map((slug) => localized(slug).notes.map(() => 1));
    // ACT
    const counts = PAGE_SLIDES.map((slug) => {
      const $ = sceneOf(slug);
      return localized(slug).notes.map(({ target }) =>
        target === 'caption' ? 1 : $(`[data-target="${target}"]`).length,
      );
    });
    // ASSERT
    expect(counts).toEqual(expected);
  });

  it('outlines only the precise and accurate cell in primary, draws its darts in primary and the loose cluster dulled', () => {
    // ARRANGE
    const expected = {
      outlined: ['precise-accurate'],
      primaryDarts: 4,
      warningCells: ['precise-off', 'neither'],
      looseDarts: ['fill-muted-foreground stroke-card'],
    };
    // ACT
    const $ = sceneOf('precision-and-accuracy');
    const actual = {
      outlined: $('[data-outcome][class*="border-primary"]')
        .toArray()
        .map((cell) => $(cell).attr('data-outcome')),
      primaryDarts: $('[data-outcome="precise-accurate"] [data-dart][class*="fill-primary"]').length,
      warningCells: $('[data-outcome]:has([data-dart][class*="warning"])')
        .toArray()
        .map((cell) => $(cell).attr('data-outcome')),
      looseDarts: [
        ...new Set(
          $('[data-outcome-board="accurate-scattered"] [data-dart]')
            .toArray()
            .map((dart) => $(dart).attr('class')),
        ),
      ],
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('writes every German Slide with a German title, notes and Voice script of the same shape', () => {
    // ARRANGE
    const expected = PAGE_SLIDES.map((slug) => ({
      notes: localized(slug).notes.length,
      segments: localized(slug).voiceScript.length,
      differs: true,
    }));
    // ACT
    const actual = PAGE_SLIDES.map((slug) => ({
      notes: localized(slug, 'de').notes.filter(({ description }) => description.length > 0).length,
      segments: localized(slug, 'de').voiceScript.filter(({ script }) => script.length > 0).length,
      differs: localized(slug, 'de').title !== localized(slug).title,
    }));
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('shows the Spec h3 on screen, since no picked Option gives another heading', () => {
    // ARRANGE
    const expected = PAGE_SLIDES.map((slug) => localized(slug).title);
    // ACT
    const actual = PAGE_SLIDES.map((slug) => localized(slug).header?.title);
    // ASSERT
    expect(actual).toEqual(expected);
  });
});
