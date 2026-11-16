import { localizeSlide } from '@/episodes/components/slide-master/localized-slide';
import { slide, type Slide } from '@/episodes/components/slide-master/slide';
import { episodeRef } from '@/episodes/lib/episode-folders';
import { placeSections } from '@/episodes/lib/episode.pure';
import type { Locale } from '@/shared/lib/locale.pure';
import { load } from 'cheerio';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { theThoughtExperiment } from './slide';

/*
 * "The thought experiment", picked Option A (cards plus the cause on hover): four ticked cards add up to the failed
 * party. At rest each card shows one fact, one result line and the half of the goal it breaks; the cause from the card
 * it met is in the DOM for the lit card. Read as the page renders the Scene under the shared Slide header.
 */

const SECTION = slide({
  slug: 'a-thought-experiment',
  messages: { en: { title: 'A thought experiment' }, de: { title: 'Ein Gedankenexperiment' } },
  content: () => null,
});

/** The Scene as the page renders it; the section slide is a stand-in, so the test reaches no Episode file. */
function sceneOf(locale: Locale = 'en') {
  const placed = placeSections<Slide>([[SECTION, theThoughtExperiment]]).flat();
  const localized = localizeSlide(placed[1] as never, {
    episode: episodeRef('what-agentic-workflows-require', '2026-11-16-cyberforum-akademie-hands-on-agentic-workflows')
      .id,
    locale,
    placed,
    referenceLabels: { ref: 'opens speaker note', marker: (title) => `Speaker note: ${title}` },
    header: 'shared',
  });
  return load(renderToStaticMarkup(createElement(Fragment, null, localized.content)));
}

const textsOf = ($: ReturnType<typeof sceneOf>, selector: string) =>
  $(selector)
    .toArray()
    .map((node) => $(node).text().replace(/\s+/g, ' ').trim());

interface SlideText {
  notes: Record<string, { header: string; description: string; sources: Record<string, { title: string }> }>;
  voiceScript: { segments: Record<string, { title: string; script: string }> };
}

const textOf = (locale: Locale) => theThoughtExperiment.messages[locale] as unknown as SlideText;

describe('success cases', () => {
  it('shows the four cards, each ticked and done by a person, and the failed party they add up to', () => {
    // ARRANGE
    const expected = {
      cards: ['Activities', 'Travel', 'Venue', 'Food & drinks'],
      people: 4,
      result: ['Party, 20 June'],
      goal: ['Goal: everyone celebrates together and gets home safely'],
      broken: ['✗ together Activities, Food & drinks', '✗ safely Travel, Venue'],
    };
    // ACT
    const $ = sceneOf();
    const actual = {
      cards: textsOf($, '[data-failure-card] [data-card-label]'),
      people: $('[data-failure-card] [data-done-by="person"]').length,
      result: textsOf($, '[data-sum-result] [data-result-title]'),
      goal: textsOf($, '[data-sum-result] [data-result-goal]'),
      broken: textsOf($, '[data-sum-result] [data-broken]'),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('keeps one fact, one result line and one broken half per card readable at rest', () => {
    // ARRANGE
    const expected = {
      facts: ['Paintball × 200', 'Everyone carpools', 'Alpine hut, 1,800 m', '31 vegetarian'],
      results: [
        'The 10 wheelchair users sit it out',
        'The drivers have been drinking',
        'Summer clothes, 6 °C at night',
        "Indian colleagues can't eat",
      ],
      breaks: ['breaks “together”', 'breaks “safely”', 'breaks “safely”', 'breaks “together”'],
    };
    // ACT
    const $ = sceneOf();
    const actual = {
      facts: textsOf($, '[data-failure-card] [data-fact]'),
      results: textsOf($, '[data-failure-card] [data-failure-result]'),
      breaks: textsOf($, '[data-failure-card] [data-breaks]'),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('adds the cause from the card each one met, ready for the lit card', () => {
    // ARRANGE
    const expected = [
      'Travel had set: Accessible bus, 10 wheelchair users',
      'Food & drinks had set: Open bar until 01:00',
      'Travel had set: Guest info: route and times only',
      'Venue had set: Hut kitchen reads it as eggs allowed',
    ];
    // ACT
    const actual = textsOf(sceneOf(), '[data-failure-card] [data-cause]');
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('opens the board’s Speaker note beside its label', () => {
    // ARRANGE
    const expected = ['Speaker note: A real version of the board'];
    // ACT
    const $ = sceneOf();
    const actual = $('[data-sum-label] button')
      .toArray()
      .map((node) => $(node).attr('aria-label'));
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('carries the reveal’s two Voice script segments verbatim', () => {
    // ARRANGE
    const expected = {
      'everyone-delivered': {
        title: 'Everyone delivered',
        script:
          'Now the day arrives, and every one of the four has done exactly what was asked. Activities booked a team-building event, Travel arranged how everyone gets there, Venue found a place, and Food and drinks ordered dinner. Each card is ticked, and each freelancer met their own goal perfectly.',
      },
      'none-of-it-adds-up': {
        title: 'None of it adds up',
        script:
          "And still the party fails, because the failures sit between the cards. Activities booked paintball, while Travel had booked an accessible bus for ten colleagues in wheelchairs, who now sit it out. Travel had everyone carpool, while Food and drinks booked an open bar until one in the morning, so the drivers have been drinking. Venue found a scenic alpine hut, while the guest info from Travel gives only route and times, so people arrive in summer clothes for six degrees at night. And dinner was ordered with 31 vegetarian, which the hut's kitchen reads the Western way, so egg dishes land in front of colleagues who cannot eat them. Every step was perfect, and perfect steps do not add up on their own.",
      },
    };
    // ACT
    const { segments } = textOf('en').voiceScript;
    const actual = Object.fromEntries(
      theThoughtExperiment.segments.map(({ slug }) => [
        slug,
        { title: segments[slug]?.title, script: segments[slug]?.script },
      ]),
    );
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('carries the Spec’s Speaker note with its source', () => {
    // ARRANGE
    const expected = [
      {
        header: 'A real version of the board',
        description:
          "Anthropic's lead agent gave its subagents vague task descriptions, and they duplicated each other's searches and left gaps until each task carried an objective, an output format, tool guidance and boundaries; one team's account of its own system, not a controlled comparison [1].",
        sources: [
          {
            title: 'Anthropic, How we built our multi-agent research system',
            url: 'https://www.anthropic.com/engineering/multi-agent-research-system',
          },
        ],
      },
    ];
    // ACT
    const { notes } = textOf('en');
    const actual = theThoughtExperiment.notes.map(({ slug, sources = [] }) => ({
      header: notes[slug]?.header,
      description: notes[slug]?.description,
      sources: sources.map((source) => ({ title: notes[slug]?.sources[source.slug]?.title, url: source.url })),
    }));
    // ASSERT
    expect(actual).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('shows no agent on the board: the four freelancers are people', () => {
    // ARRANGE
    const expected = 0;
    // ACT
    const actual = sceneOf()('[data-done-by="agent"]').length;
    // ASSERT
    expect(actual).toBe(expected);
  });

  it('asks no question: the setup slide before it carries it, and the Voice script has no question segment', () => {
    // ARRANGE
    const expected = { banners: 0, segments: ['everyone-delivered', 'none-of-it-adds-up'] };
    // ACT
    const actual = {
      banners: sceneOf()('[data-question]').length,
      segments: theThoughtExperiment.segments.map(({ slug }) => slug),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('lights and dims nothing at rest: every card is fully shown', () => {
    // ARRANGE
    const expected = { lit: 0, dimmed: 0, focusable: 4 };
    // ACT
    const $ = sceneOf();
    const actual = {
      lit: $('[data-lit]').length,
      dimmed: $('[data-dimmed]').length,
      focusable: $('[data-failure-card][tabindex="0"]').length,
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('names the cards, the broken halves and the cause in German on the German page', () => {
    // ARRANGE
    const expected = {
      cards: ['Programm', 'Anreise', 'Location', 'Essen & Getränke'],
      broken: ['✗ zusammen Programm, Essen & Getränke', '✗ sicher Anreise, Location'],
      cause: 'Anreise hatte festgelegt: Barrierefreier Bus, 10 Rollstuhlnutzende',
    };
    // ACT
    const $ = sceneOf('de');
    const actual = {
      cards: textsOf($, '[data-failure-card] [data-card-label]'),
      broken: textsOf($, '[data-sum-result] [data-broken]'),
      cause: textsOf($, '[data-failure-card] [data-cause]')[0],
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });
});
