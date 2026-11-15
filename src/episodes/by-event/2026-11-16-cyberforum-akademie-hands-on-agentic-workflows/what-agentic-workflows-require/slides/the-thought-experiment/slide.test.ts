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
 * "The thought experiment", picked Option 1c: the party board as a sum. Four cards, each ticked against its own goal,
 * add up plus by plus to the failed party; each card carries its seam failure, the card it met and the half of the
 * goal it breaks. Read as the page renders the Scene under the shared Slide header.
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
  it('adds the four cards, each ticked for its own goal by a person, plus by plus to the party', () => {
    // ARRANGE
    const expected = {
      cards: ['Activities', 'Travel', 'Venue', 'Food & drinks'],
      goals: [
        'Own goal: Team event for 200, booked',
        'Own goal: Everyone there, no extra cost',
        'Own goal: Scenic, within budget',
        'Own goal: Dinner for 200, ordered',
      ],
      people: 4,
      plus: 3,
      result: ['Party, 20 June'],
    };
    // ACT
    const $ = sceneOf();
    const actual = {
      cards: textsOf($, '[data-sum-card] [data-card-label]'),
      goals: textsOf($, '[data-sum-card] [data-own-goal]'),
      people: $('[data-sum-card] [data-done-by="person"]').length,
      plus: $('[data-plus]').length,
      result: textsOf($, '[data-sum-result] [data-result-title]'),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('marks each card failed at its seam, naming the card it met, the result and the half it breaks', () => {
    // ARRANGE
    const expected = {
      facts: ['Paintball × 200', 'Everyone carpools', 'Alpine hut, 1,800 m', '31 vegetarian'],
      seams: [
        'Travel: Accessible bus, 10 wheelchair users',
        'Food & drinks: Open bar until 01:00',
        'Travel: Guest info: route and times only',
        'Venue: Hut kitchen reads it as eggs allowed',
      ],
      results: [
        'The 10 sit it out',
        'The drivers have been drinking',
        'Summer clothes, 6 °C at night',
        "Indian colleagues can't eat",
      ],
      breaks: ['breaks “together”', 'breaks “safely”', 'breaks “safely”', 'breaks “together”'],
      goal: ['Goal: everyone celebrates together and gets home safely'],
      broken: ['✗ together Activities, Food & drinks', '✗ safely Travel, Venue'],
    };
    // ACT
    const $ = sceneOf();
    const actual = {
      facts: textsOf($, '[data-sum-card] [data-fact]'),
      seams: textsOf($, '[data-sum-card] [data-seam]'),
      results: textsOf($, '[data-sum-card] [data-failure-result]'),
      breaks: textsOf($, '[data-sum-card] [data-breaks]'),
      goal: textsOf($, '[data-sum-result] [data-result-goal]'),
      broken: textsOf($, '[data-sum-result] [data-broken]'),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('asks the manager’s question in the one banner, and opens the board’s Speaker note beside its label', () => {
    // ARRANGE
    const expected = {
      question: ['The question What do you, as the manager, need to do so the result still comes out great?'],
      markers: ['Speaker note: A real version of the board'],
    };
    // ACT
    const $ = sceneOf();
    const actual = {
      question: textsOf($, '[data-question]'),
      markers: $('[data-sum-label] button')
        .toArray()
        .map((node) => $(node).attr('aria-label')),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('carries the Spec’s Voice script, segment by segment, verbatim', () => {
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
      'your-question': {
        title: 'Your question',
        script:
          'So here is the question, and I want you to keep it in your head for the whole Episode. What do you, as the manager, need to do so the result still comes out great? One tempting answer is to get the four talking, to hold more meetings. I will leave the question open for now, and we will answer it step by step, from different angles, until we collect the answers at the end.',
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
});

describe('edge cases', () => {
  it('names the cards and the broken halves in German on the German page', () => {
    // ARRANGE
    const expected = {
      cards: ['Programm', 'Anreise', 'Location', 'Essen & Getränke'],
      broken: ['✗ zusammen Programm, Essen & Getränke', '✗ sicher Anreise, Location'],
    };
    // ACT
    const $ = sceneOf('de');
    const actual = {
      cards: textsOf($, '[data-sum-card] [data-card-label]'),
      broken: textsOf($, '[data-sum-result] [data-broken]'),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });
});
