import { localizeSlide } from '@/episodes/components/slide-master/localized-slide';
import { slide, type Slide } from '@/episodes/components/slide-master/slide';
import { placeSections } from '@/episodes/lib/episode.pure';
import type { Locale } from '@/shared/lib/locale.pure';
import { load } from 'cheerio';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { theThirdTimeIsTheSignal } from './slide';

/*
 * "The third time is the signal", picked Option 8a: three mornings in the control room, the empty card, the draft and
 * the written card with its good result; in the Coding agent view two sessions that start fresh and the new SKILL.md.
 * The people and the console are the shared cast (design-ADR-0025); the room is the Slide's own.
 */

const slideUnderTest = theThirdTimeIsTheSignal as unknown as Slide;
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
  it('heads the three panels with what happens with the AI, in order', () => {
    // ARRANGE
    const expected = ["1st time: you learn what's needed", '2nd time: you refine it', '3rd time: you write the skill'];
    // ACT
    const $ = sceneOf();
    const heads = $('[data-panel] > p:first-child')
      .toArray()
      .map((head) => $(head).text());
    // ASSERT
    expect(heads).toEqual(expected);
  });

  it('fills the card from empty to draft to written, the written one ending on its good result', () => {
    // ARRANGE
    const expected = {
      cards: ['empty', 'draft', 'written'],
      steps: 6,
      goodResult: '✓Good result: an intact core, sealed and labelled.',
    };
    // ACT
    const $ = sceneOf();
    const seen = {
      cards: $('[data-card]')
        .toArray()
        .map((card) => $(card).attr('data-card')),
      steps: $('[data-card="written"] ol li').length,
      goodResult: $('[data-card="written"] [data-good-result]').text(),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('draws each morning with the shared captain and pilot at the shared console, one more mug each day', () => {
    // ARRANGE
    const expected = { mornings: ['1', '2', '3'], characters: 4, consoles: 2, chatPictures: 3 };
    // ACT
    const $ = sceneOf();
    const chat = $('[data-panel] [data-view="chat"] [data-morning]');
    const seen = {
      mornings: chat.toArray().map((svg) => $(svg).attr('data-morning')),
      characters: $('[data-panel]').first().find('[data-character]').length,
      consoles: $('[data-panel]').first().find('[data-console]').length,
      chatPictures: chat.length,
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('carries the three Voice script segments as the Spec writes them', () => {
    // ARRANGE
    const expected = ['Three tries', 'Not only repetition', 'Did you know'];
    // ACT
    const titles = scriptOf('en');
    // ASSERT
    expect(titles).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('lets only the chat view speak: the coding pictures carry a session chip, no speech', () => {
    // ARRANGE
    const expected = {
      chatSpeech: 6,
      codingSpeech: 0,
      chips: ['Session 1 · starts fresh', 'Session 2 · starts fresh', 'Session 3 · starts fresh'],
    };
    // ACT
    const $ = sceneOf();
    const seen = {
      chatSpeech: $('[data-panel] [data-view="chat"] [data-says]').length,
      codingSpeech: $('[data-panel] [data-view="coding"] [data-says]').length,
      chips: $('[data-session-chip]')
        .toArray()
        .map((chip) => $(chip).text()),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('strikes the one wrong step on the draft and no other', () => {
    // ARRANGE
    const expected = ['2. Grab the mud.'];
    // ACT
    const $ = sceneOf();
    const struck = $('[data-card="draft"] [data-struck]')
      .toArray()
      .map((step) => $(step).text());
    // ASSERT
    expect(struck).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('writes the new SKILL.md in the coding view, named as Slide 3 names it', () => {
    // ARRANGE
    const expected = { files: 1, terminals: 2, path: 'collect-sediment-sample/SKILL.mdnew file' };
    // ACT
    const $ = sceneOf();
    const seen = {
      files: $('[data-skill-file]').length,
      terminals: $('[data-terminal]').length,
      path: $('[data-skill-file] > p').first().text(),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('opens every one of its notes from a Context marker on the Slide', () => {
    // ARRANGE
    const expected = ['when-to-write-a-skill', 'where-the-model-is-not-like-a-person'];
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
    const expected = ['Drei Versuche', 'Nicht nur Wiederholung', 'Schon gewusst'];
    // ACT
    const titles = scriptOf('de');
    // ASSERT
    expect(titles).toEqual(expected);
  });
});
