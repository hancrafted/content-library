import { localizeSlide } from '@/episodes/components/slide-master/localized-slide';
import { slide, type Slide } from '@/episodes/components/slide-master/slide';
import { placeSections } from '@/episodes/lib/episode.pure';
import type { Locale } from '@/shared/lib/locale.pure';
import { load } from 'cheerio';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { notEveryRepeatDeservesASkill } from './slide';

/*
 * "Not every repeat deserves a skill", picked Option 9a: the pilot at his console beside a stuffed binder, the skill
 * index running off the stage with stamped entries and the needed one buried seventh, and the three-question check.
 */

const slideUnderTest = notEveryRepeatDeservesASkill as unknown as Slide;
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
  it('buries the one entry you need seventh in the index, among seventeen', () => {
    // ARRANGE
    const expected = { entries: 17, neededAt: 6, needed: 'collect-sediment-sample' };
    // ACT
    const $ = sceneOf();
    const names = $('[data-entry]')
      .toArray()
      .map((entry) => $(entry).attr('data-entry'));
    const seen = {
      entries: names.length,
      neededAt: $('[data-entry]').index($('[data-needed]')),
      needed: $('[data-needed]').attr('data-entry'),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('asks the three questions of the check, in the order the Voice script asks them', () => {
    // ARRANGE
    const expected = ['Does the task repeat?', 'Does it have rules?', 'Does a mistake cost something?'];
    // ACT
    const $ = sceneOf();
    const questions = $('[data-question]')
      .toArray()
      .map((question) => $(question).text());
    // ASSERT
    expect(questions).toEqual(expected);
  });

  it('seats the shared pilot at the shared console beside the binder', () => {
    // ARRANGE
    const expected = { characters: 1, consoles: 1, binders: 1 };
    // ACT
    const $ = sceneOf();
    const seen = {
      characters: $('[data-character]').length,
      consoles: $('[data-console]').length,
      binders: $('[data-binder]').length,
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('stamps the never-tested entries, never the one you need', () => {
    // ARRANGE
    const expected = 6;
    // ACT
    const $ = sceneOf();
    const seen = { stamps: $('[data-stamp]').length, onNeeded: $('[data-needed] [data-stamp]').length };
    // ASSERT
    expect(seen).toEqual({ stamps: expected, onNeeded: 0 });
  });

  it('gives the check no Context marker, since the three questions are a filter of my own', () => {
    // ARRANGE
    const expected = 0;
    // ACT
    const markers = sceneOf()('[data-check] ol [data-context-ref]').length;
    // ASSERT
    expect(markers).toBe(expected);
  });
});

describe('edge cases', () => {
  it('names the folders in the coding view, the needed one as Slide 3 names the skill', () => {
    // ARRANGE
    const expected = { first: 'rinse-camera-dome', needed: 'collect-sediment-sample' };
    // ACT
    const $ = sceneOf();
    const seen = {
      first: $('[data-entry] [data-view="coding"]').first().text(),
      needed: $('[data-needed] [data-view="coding"]').text(),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('opens each of its notes from a Context marker beside the words it backs', () => {
    // ARRANGE
    const expected = ['a-crowded-skill-index', 'skills-nobody-needs-yet', 'skills-written-too-early'];
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
      en: ['Too early', 'A thin card has a price', 'Three questions'],
      de: ['Zu früh', 'Eine dünne Karte hat ihren Preis', 'Drei Fragen'],
    };
    // ACT
    const titles = { en: scriptOf('en'), de: scriptOf('de') };
    // ASSERT
    expect(titles).toEqual(expected);
  });
});
