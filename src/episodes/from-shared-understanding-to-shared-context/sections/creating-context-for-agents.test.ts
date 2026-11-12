import { localizeSlide, type LocalizedSlide } from '@/episodes/components/slide-master/localized-slide';
import type { Slide } from '@/episodes/components/slide-master/slide';
import { placeSections } from '@/episodes/lib/episode.pure';
import type { Locale } from '@/shared/lib/locale.pure';
import { load } from 'cheerio';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { creatingContextForAgentsSection } from './creating-context-for-agents';

/*
 * Section 4 of "From shared understanding to shared context", "Creating context for agents", as the approved Spec
 * gives it: Slides 13 to 15 in Spec order, each with the Spec's Voice script, Speaker notes and sources, a Context
 * marker wherever its picked Option's mock shows one, and the Scene facts the Option draws. Read through the one
 * interface the page reads a Slide by: localized on the shared Slide header.
 */

const LI = 'https://arxiv.org/abs/2310.11589';
const REPROMPT = 'https://arxiv.org/abs/2601.16507';
const AMBIG_SWE = 'https://arxiv.org/abs/2502.13069';
const LABAN = 'https://arxiv.org/abs/2505.06120';
const ANTHROPIC = 'https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents';
const POCOCK_SKILLS = 'https://github.com/mattpocock/skills';
const POCOCK_VIDEO = 'https://www.youtube.com/watch?v=M6mYodf0dJM';

const PLACED = placeSections<Slide>([creatingContextForAgentsSection]).flat();

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

/** The page Slides of the Section, the section slide left out. */
const PAGE_SLIDES = ['meta-prompting', 'grill-me', 'brief'];

describe('success cases', () => {
  it('lists Slides 13 to 15 after the section slide, in Spec order, titled by their Spec h3', () => {
    // ARRANGE
    const expected = ['Creating context for agents', 'Meta prompting', 'Grill-me', 'BRIEF'];
    // ACT
    const titles = PLACED.map(({ slide }) => localized(slide.slug).title);
    // ASSERT
    expect(titles).toEqual(expected);
  });

  it('carries each Spec Voice script segment by its title, in order', () => {
    // ARRANGE
    const expected = [
      ['Separate session', 'Fresh chat, clean work order', 'Why a separate office'],
      ["Matt Pocock's skill", 'Next 30 minutes', 'Actionable one'],
      ['Callback', 'Map to today', 'Close'],
    ];
    // ACT
    const titles = PAGE_SLIDES.map((slug) => localized(slug).voiceScript.map(({ title }) => title));
    // ASSERT
    expect(titles).toEqual(expected);
  });

  it('speaks both actionables of the Brief word for word', () => {
    // ARRANGE
    const expected = {
      first:
        'So the first thing to take with you: before your next complex task, let the AI interview you in rounds of questions, then turn the result into a spec.',
      office:
        "Why a separate office? Because the planning chat is full of questions, half-ideas and drafts, and in the bench's terms that is rot. The work order is not. So keep the office and the bench apart.",
      close:
        'So the second thing to take with you: move that result into a fresh chat instead of continuing the long one. To sum up: the line only runs as well as what it receives, context is the requirement, the bench has to stay clean, and the interview builds it for you. I cannot promise it fits every task, and it is early days for all of this. If you try it, I would love to hear how it went. Thank you.',
    };
    // ACT
    const actual = {
      first: localized('grill-me').voiceScript[2]?.script,
      office: localized('meta-prompting').voiceScript[2]?.script,
      close: localized('brief').voiceScript[2]?.script,
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('gives every Slide the Speaker notes of the Spec, by header, with their sources', () => {
    // ARRANGE
    const expected = [
      [
        { header: 'Users answer better than they write', urls: [LI] },
        { header: 'Prompts generated from requirements', urls: [REPROMPT] },
      ],
      [
        { header: 'Where grill-me comes from', urls: [POCOCK_SKILLS, POCOCK_VIDEO] },
        { header: 'Asking beats guessing, on unclear tasks', urls: [AMBIG_SWE] },
        { header: 'Rounds are inferred', urls: [LABAN] },
      ],
      [{ header: 'Why a fresh chat', urls: [ANTHROPIC] }],
    ];
    // ACT
    const notes = PAGE_SLIDES.map((slug) =>
      localized(slug).notes.map(({ header, sources }) => ({ header, urls: sources?.map(({ url }) => url) })),
    );
    // ASSERT
    expect(notes).toEqual(expected);
  });

  it('places a Context marker for each note wherever the picked Options show one, in reading order', () => {
    // ARRANGE
    const expected = [
      ['users-answer-better-than-they-write', 'prompts-generated-from-requirements'],
      ['asking-beats-guessing-on-unclear-tasks', 'rounds-are-inferred'],
      ['why-a-fresh-chat'],
    ];
    // ACT
    const markers = PAGE_SLIDES.map((slug) => {
      const $ = sceneOf(slug);
      return $('[data-context-ref]')
        .toArray()
        .map((marker) => $(marker).attr('data-context-ref'));
    });
    // ASSERT
    expect(markers).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('marks every note target on exactly one element of its Slide or its caption', () => {
    // ARRANGE
    const expected = PAGE_SLIDES.map((slug) => localized(slug).notes.map(() => 1));
    // ACT
    const counts = PAGE_SLIDES.map((slug) => {
      const $ = sceneOf(slug);
      // A caption note's marker sits in the shared header, outside the Scene.
      return localized(slug).notes.map(({ target }) =>
        target === 'caption' ? 1 : $(`[data-target="${target}"]`).length,
      );
    });
    // ASSERT
    expect(counts).toEqual(expected);
  });

  it('keeps the drafts in the office: only the work order crosses to the bench', () => {
    // ARRANGE
    const expected = { officeDrafts: 1, benchDrafts: 0, benchOrders: 1, officeOrders: 0 };
    // ACT
    const $ = sceneOf('meta-prompting');
    const actual = {
      officeDrafts: $('[data-room="office"] [data-residue]').length,
      benchDrafts: $('[data-room="bench"] [data-residue]').length,
      benchOrders: $('[data-room="bench"] [data-work-order]').length,
      officeOrders: $('[data-room="office"] [data-work-order]').length,
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('lights the F alone of the five moves', () => {
    // ARRANGE
    const expected = ['fresh'];
    // ACT
    const $ = sceneOf('brief');
    const lit = $('[data-move][data-focus]')
      .toArray()
      .map((move) => $(move).attr('data-move'));
    // ASSERT
    expect(lit).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('asks in three rounds, the last collapsed, then writes a five-row spec', () => {
    // ARRANGE
    // Han's proofread moves the done-when question from round 1 to round 3: the open rounds list 2 and 2 questions, the collapsed one its own line.
    const expected = { rounds: 3, collapsed: 1, questions: 4, specRows: 5, orderRows: 4 };
    // ACT
    const grill = sceneOf('grill-me');
    const actual = {
      rounds: grill('[data-round]').length,
      collapsed: grill('[data-round][data-collapsed]').length,
      questions: grill('[data-round] li').length,
      specRows: grill('[data-spec-card] dt').length,
      orderRows: sceneOf('meta-prompting')('[data-work-order] dt').length,
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('asks the done-when question in round 3, not in round 1', () => {
    // ARRANGE
    // Han's proofread: round 1 drops "What would make the week a success?" and round 3, the "done when" round, asks how we will know.
    const expected = {
      en: { round3: 'How will we know it’s done?', round1: 2 },
      de: { round3: 'Woran erkennen wir, dass es fertig ist?', round1: 2 },
    };
    // ACT
    const read = (locale: Locale) => {
      const grill = sceneOf('grill-me', locale);
      return {
        round3: grill('[data-round="done"] [data-collapsed-question]').text(),
        round1: grill('[data-round="goal"] li').length,
      };
    };
    const actual = { en: read('en'), de: read('de') };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('shows three of the five BRIEF moves today (R, I and F); B and E read "not today"', () => {
    // ARRANGE
    // Han's proofread: "today's session runs all five" overclaimed, so only R, I and F carry the Today column.
    const expected = {
      en: { shown: ['R', 'I', 'F'], notToday: ['B', 'E'], label: 'Not today' },
      de: { shown: ['R', 'I', 'F'], notToday: ['B', 'E'], label: 'Nicht heute' },
    };
    // ACT
    const read = (locale: Locale) => {
      const $ = sceneOf('brief', locale);
      const letters = (state: string) =>
        $(`[data-move]:has([data-today="${state}"]) [data-move-letter]`)
          .toArray()
          .map((letter) => $(letter).text());
      return {
        shown: letters('shown'),
        notToday: letters('not-today'),
        label: $('[data-today="not-today"]').first().text(),
      };
    };
    const actual = { en: read('en'), de: read('de') };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('names the five moves after the Brief, B to F, in both locales', () => {
    // ARRANGE
    const expected = {
      en: ['Break it down', 'Requirements first', 'Interview with AI', 'Evaluate each step', 'Fresh chat'],
      letters: ['B', 'R', 'I', 'E', 'F'],
    };
    // ACT
    const moves = (locale: Locale) => {
      const $ = sceneOf('brief', locale);
      return $('[data-move] [data-move-name]')
        .toArray()
        .map((move) => $(move).text());
    };
    const letters = (locale: Locale) => {
      const $ = sceneOf('brief', locale);
      return $('[data-move] [data-move-letter]')
        .toArray()
        .map((letter) => $(letter).text());
    };
    const actual = { en: moves('en'), letters: letters('de') };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('writes every German Slide with notes and Voice script of the same shape, the names Grill-me and BRIEF kept', () => {
    // ARRANGE
    const expected = PAGE_SLIDES.map((slug) => ({
      notes: localized(slug).notes.length,
      segments: localized(slug).voiceScript.length,
      differs: slug === 'meta-prompting',
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
});
