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
 * Section 1, "A thought experiment", as the approved Spec gives it: its section slide, then Slides 1 and 2 built to
 * the picked Options 1a and 2a, each titled, scripted and noted as the Spec writes it. Slide 1 is the comic of three
 * identical mornings in the control room ending on the empty procedure card; Slide 2 the cutaway of the research ship
 * with its three numbered callouts and tiles (design-ADR 0025: ZoneScene, Ship, Console, Robot and the cast).
 */

const EPISODE = 'what-lies-below-the-waterline-of-sustainable-ai-skills';
const SLIDES = aThoughtExperimentSection as readonly Slide[];
const PLACED = placeSections<Slide>([aThoughtExperimentSection]).flat();
const FORGETS = 'an-ai-model-that-forgets-every-morning';
const HANDS = 'a-skill-hands-the-ai-your-procedure';

interface Messages {
  title: string;
  heading?: string;
  voiceScript: { segments: Record<string, { title: string; script: string }> };
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
    episode: EPISODE,
    locale,
    placed: PLACED,
    referenceLabels: { ref: 'opens speaker note', marker: (title) => `Speaker note: ${title}` },
    header: 'shared',
  });
  return load(renderToStaticMarkup(createElement(Fragment, null, localized.content)));
}

const MARKER = '[data-context-ref]';

describe('success cases', () => {
  it('places the two page Slides after the section slide, in Spec order, under their Spec titles', () => {
    // ARRANGE
    const expected = [
      'A thought experiment',
      'An AI model that forgets every morning',
      'A skill hands the AI your procedure',
    ];
    // ACT
    const actual = SLIDES.map((slide) => messagesOf(slide).title);
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('scripts each page Slide in the Spec’s Voice script segments', () => {
    // ARRANGE
    const expected = {
      [FORGETS]: ['Three mornings', 'The hook', 'What would you do'],
      [HANDS]: ['The answer', 'Three things to remember', 'The card slides out'],
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

  it('keeps the Spec’s hook line verbatim in Slide 1’s Voice script', () => {
    // ARRANGE
    const expected =
      "That is what working with AI feels like today, because every conversation starts from zero on how you work. You've explained this to the AI a hundred times. It has heard it once.";
    // ACT
    const actual = messagesOf(slideOf(FORGETS)).voiceScript.segments['the-hook']?.script;
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('notes each page Slide with the Spec’s Speaker notes and their sources', () => {
    // ARRANGE
    const expected = {
      [FORGETS]: [
        {
          header: "Each AI conversation starts fresh: Mollick's forgetful coworker",
          sources: [
            'https://www.oneusefulthing.org/p/getting-started-with-ai-good-enough',
            'https://code.claude.com/docs/en/memory',
          ],
        },
      ],
      [HANDS]: [
        {
          header: 'A skill spares you the repeat',
          sources: ['https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview'],
        },
      ],
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

  it('draws Slide 1 as five panels: the photo, three mornings piling up mugs, and the empty card', () => {
    // ARRANGE
    const expected = { panels: 5, mornings: [1, 2, 3], greetings: 3, card: 1, aiTag: ['AI model'] };
    // ACT
    const $ = sceneOf(FORGETS);
    const actual = {
      panels: $('[data-panel]').length,
      mornings: $('[data-morning]')
        .toArray()
        .map((panel) => $(panel).find('[data-console] [data-mug]').length),
      greetings: $('[data-says]')
        .toArray()
        .filter((bubble) => $(bubble).text() === 'Nice to meet you.').length,
      card: $('[data-empty-card]').length,
      aiTag: $('[data-ai-tag]')
        .toArray()
        .map((tag) => $(tag).text()),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('draws Slide 2 as the cutaway with three numbered callouts and three tiles in both views', () => {
    // ARRANGE
    const expected = {
      callouts: ['1 · Skill', '2 · Description', '3 · Project instructions'],
      tiles: 3,
      chat: 3,
      coding: 3,
      card: 1,
      markers: ['a-skill-spares-you-the-repeat', 'a-skill-spares-you-the-repeat'],
    };
    // ACT
    const $ = sceneOf(HANDS);
    const actual = {
      callouts: $('[data-callout] [data-term]')
        .toArray()
        .map((term) => $(term).text()),
      tiles: $('[data-tile]').length,
      chat: $('[data-tile] [data-view="chat"]').length,
      coding: $('[data-tile] [data-view="coding"]').length,
      card: $('[data-travel] [data-procedure-card]').length,
      markers: $(MARKER)
        .toArray()
        .map((marker) => $(marker).attr('data-context-ref')),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('shows the Spec h3 on screen, with no separate heading, since neither picked Option retitles its Slide', () => {
    // ARRANGE
    const expected = [undefined, undefined];
    // ACT
    const actual = [FORGETS, HANDS].map((slug) => messagesOf(slideOf(slug)).heading);
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('leaves the procedure card on Slide 1 blank and untagged, so the question stays open', () => {
    // ARRANGE
    const expected = { tags: 0, filled: ['', '', '', ''] };
    // ACT
    const $ = sceneOf(FORGETS);
    const card = $('[data-empty-card]');
    const actual = {
      tags: card.find('[data-ai-tag]').length,
      filled: card
        .find('[data-step]')
        .toArray()
        .map((step) => $(step).find('[data-step-text]').text()),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('titles and scripts the German Slides segment by segment, as English does', () => {
    // ARRANGE
    const expected = [
      {
        title: 'Ein KI-Modell, das jeden Morgen vergisst',
        segments: ['Drei Morgen', 'Der Haken', 'Was würdest Du tun'],
      },
      {
        title: 'Ein Skill gibt der KI Dein Vorgehen',
        segments: ['Die Antwort', 'Drei Dinge zum Merken', 'Die Karte gleitet heraus'],
      },
    ];
    // ACT
    const actual = [FORGETS, HANDS].map((slug) => {
      const slide = slideOf(slug);
      const messages = messagesOf(slide, 'de');
      return {
        title: messages.title,
        segments: slide.segments.map((segment) => messages.voiceScript.segments[segment.slug]?.title),
      };
    });
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('turns Slide 1’s mornings into sessions in the Coding agent view', () => {
    // ARRANGE
    const expected = [
      'Session 1 · fresh context window',
      'Session 2 · fresh context window',
      'Session 3 · fresh context window',
    ];
    // ACT
    const $ = sceneOf(FORGETS);
    const actual = $('[data-morning] [data-view="coding"]')
      .toArray()
      .map((label) => $(label).text());
    // ASSERT
    expect(actual).toEqual(expected);
  });
});
