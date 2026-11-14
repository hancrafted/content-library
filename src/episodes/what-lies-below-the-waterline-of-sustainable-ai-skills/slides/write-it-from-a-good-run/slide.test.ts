import { localizeSlide } from '@/episodes/components/slide-master/localized-slide';
import { slide, type Slide } from '@/episodes/components/slide-master/slide';
import { placeSections } from '@/episodes/lib/episode.pure';
import type { Locale } from '@/shared/lib/locale.pure';
import { load } from 'cheerio';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { writeItFromAGoodRun } from './slide';

/*
 * "Write it from a good run", picked Option 10b: the interview path as one day in four panels, the notes lane joining
 * at the skill card, the first step under them. The robot dives in the Sunlit ZoneScene; the crew and the console
 * are the shared cast (design-ADR-0025).
 */

const slideUnderTest = writeItFromAGoodRun as unknown as Slide;
/** A hand-written stand-in for the Section's section slide, so the Slide is placed as a page Slide. */
const opener = slide({
  slug: 'when-to-write-one',
  messages: { en: { title: 'When to write one' }, de: { title: 'Wann Du einen schreibst' } },
  content: () => null,
}) as unknown as Slide;
const PLACED = placeSections<Slide>([[opener, slideUnderTest]]).flat();
const PLACED_SLIDE = PLACED[1]!;

const sceneOf = (locale: Locale = 'en') =>
  load(
    renderToStaticMarkup(
      createElement(
        Fragment,
        null,
        localizeSlide(PLACED_SLIDE, {
          episode: 'what-lies-below-the-waterline-of-sustainable-ai-skills',
          locale,
          placed: PLACED,
          referenceLabels: { ref: 'opens speaker note', marker: (title) => `Speaker note: ${title}` },
          header: 'shared',
        }).content,
      ),
    ),
  );

const scriptOf = (locale: Locale) => {
  const messages = slideUnderTest.messages[locale] as {
    voiceScript: { segments: Record<string, { title: string }> };
  };
  return slideUnderTest.segments.map(({ slug }) => messages.voiceScript.segments[slug]?.title);
};

describe('success cases', () => {
  it('tells the day in four numbered panels, the third in focus, the first two marked', () => {
    // ARRANGE
    const expected = {
      panels: ['1', '2', '3', '4'],
      focal: '3',
      // The first two steps carry their Context marker, rendered as its bracketed icon.
      steps: [
        'A run that worked ()',
        'The AI interviews you ()',
        'The AI writes the skill',
        'The next conversation starts fresh',
      ],
    };
    // ACT
    const $ = sceneOf();
    const seen = {
      panels: $('[data-day-panel]')
        .toArray()
        .map((panel) => $(panel).attr('data-day-panel')),
      focal: $('[data-day-panel][data-focal]').attr('data-day-panel'),
      steps: $('[data-step]')
        .toArray()
        .map((step) => $(step).text().replace(/\s/g, ' ')),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('dives in the Sunlit zone and sets the rest of the day in the control room, by its hour', () => {
    // ARRANGE
    const expected = { zone: 'sunlit', robots: 1, rooms: ['interview', 'writing', 'next-morning'] };
    // ACT
    const $ = sceneOf();
    const seen = {
      zone: $('[data-day-panel="1"] [data-scene]').attr('data-depth-zone'),
      robots: $('[data-day-panel="1"] [data-robot]').length,
      rooms: $('[data-room-panel]')
        .toArray()
        .map((room) => $(room).attr('data-room-panel')),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('closes on the first step of the Brief', () => {
    // ARRANGE
    const expected = "1First step: pick one task you've explained three times, and turn a good run of it into a skill.";
    // ACT
    const step = sceneOf()('[data-first-step]').text();
    // ASSERT
    expect(step).toBe(expected);
  });
});

describe('failure cases', () => {
  it('lets the context window run full in the evening and empty the next morning', () => {
    // ARRANGE
    const expected = [
      ['3', 'full'],
      ['4', 'empty'],
    ];
    // ACT
    const $ = sceneOf();
    const gauges = $('[data-gauge]')
      .toArray()
      .map((gauge) => [$(gauge).closest('[data-day-panel]').attr('data-day-panel'), $(gauge).attr('data-gauge')]);
    // ASSERT
    expect(gauges).toEqual(expected);
  });

  it('keeps the why on the skill card and what counts as failure', () => {
    // ARRANGE
    const expected = 'Failed if: core under 30 cm, or no depth logged.';
    // ACT
    const failedIf = sceneOf()('[data-skill-card] [data-failed-if]').text();
    // ASSERT
    expect(failedIf).toBe(expected);
  });
});

describe('edge cases', () => {
  it('asks the agent in one copy-pastable sentence in the coding view', () => {
    // ARRANGE
    const expected = '> Turn this conversation into a skill.';
    // ACT
    const request = sceneOf()('[data-request]').text();
    // ASSERT
    expect(request).toBe(expected);
  });

  it('opens each of its notes from a Context marker on the Slide', () => {
    // ARRANGE
    const expected = ['googles-route', 'the-agent-can-interview-you', 'write-the-skill-from-a-real-run'];
    // ACT
    const $ = sceneOf();
    const notes = [
      ...new Set(
        $('[data-context-ref]')
          .toArray()
          .map((marker) => $(marker).attr('data-context-ref')),
      ),
    ].sort();
    // ASSERT
    expect(notes).toEqual(expected);
  });

  it('scripts the German Slide segment by segment, as English does', () => {
    // ARRANGE
    const expected = {
      en: ['Two starting points', 'Capture the why', 'While he still knows'],
      de: ['Zwei Ausgangspunkte', 'Das Warum festhalten', 'Solange er es noch weiß'],
    };
    // ACT
    const titles = { en: scriptOf('en'), de: scriptOf('de') };
    // ASSERT
    expect(titles).toEqual(expected);
  });
});
