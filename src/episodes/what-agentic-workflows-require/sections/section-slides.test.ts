import { localizeSlide } from '@/episodes/components/slide-master/localized-slide';
import type { Slide } from '@/episodes/components/slide-master/slide';
import { placeSections } from '@/episodes/lib/episode.pure';
import type { Locale } from '@/shared/lib/locale.pure';
import { load } from 'cheerio';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { whatAgenticWorkflowsRequire } from '../episode';

/*
 * The section slides of "What agentic workflows require of people and organisations", as the approved Spec gives
 * them: one per Section, in Spec order, each titled by its Section's h2, carrying its Voice script segment, and each
 * Scene one echo of picked Title-slide Option 0b, the seam from Food & drinks to the venue's kitchen at its Section's
 * state.
 */

const EPISODE = 'what-agentic-workflows-require';
const SECTIONS = whatAgenticWorkflowsRequire.sections;
const OPENERS = SECTIONS.map(([opener]) => opener as Slide);
const PLACED = placeSections<Slide>(SECTIONS.map(([opener]) => [opener as Slide])).flat();

/** A section slide's Scene as the page renders it under the shared Slide header. */
function sceneOf(slug: string, locale: Locale = 'en') {
  const own = PLACED.find((entry) => entry.slide.slug === slug);
  if (own === undefined) throw new Error(`No section slide "${slug}".`);
  const localized = localizeSlide(own, {
    episode: EPISODE,
    locale,
    placed: PLACED,
    referenceLabels: { ref: 'opens speaker note', marker: (title) => `Speaker note: ${title}` },
    header: 'shared',
  });
  return load(renderToStaticMarkup(createElement(Fragment, null, localized.content)));
}

interface ScriptMessages {
  title: string;
  caption: string;
  voiceScript: { segments: Record<string, { title: string; script: string }> };
}

/** A section slide's title, caption and Voice script segment titles in one locale. */
function scriptOf(slide: Slide, locale: Locale) {
  const messages = slide.messages[locale] as unknown as ScriptMessages;
  return {
    title: messages.title,
    caption: messages.caption,
    segments: slide.segments.map(({ slug }) => messages.voiceScript.segments[slug]?.title),
  };
}

const textsOf = ($: ReturnType<typeof sceneOf>, selector: string) =>
  $(selector)
    .toArray()
    .map((node) => $(node).text().trim());

describe('success cases', () => {
  it('opens the five Sections in Spec order, each titled, captioned and scripted as the Spec writes it', () => {
    // ARRANGE
    const expected = [
      {
        title: 'A thought experiment',
        caption: 'Four perfect cards on one board, and the party still fails between them.',
        segments: ['Imagine the board'],
      },
      {
        title: 'What an agentic workflow is',
        caption: 'Two terms to stand on: an agent, then an agentic workflow.',
        segments: ['Name the thing'],
      },
      {
        title: 'How far you step out',
        caption: 'How much of a person stays in is a choice you make per task.',
        segments: ['Open question'],
      },
      {
        title: 'What it requires of each person',
        caption: 'Four failures, three missing skills, and each skill has a name.',
        segments: ['Skills behind the failures'],
      },
      {
        title: 'What it requires of the organisation',
        caption: 'The workflow people draw takes the shape of the organisation.',
        segments: ['From people to the company'],
      },
    ];
    // ACT
    const actual = OPENERS.map((slide) => scriptOf(slide, 'en'));
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('carries the opening Voice script segment verbatim from the Spec', () => {
    // ARRANGE
    const expected =
      'Imagine you are the manager of a summer party for 200 colleagues from five offices, and you have hired four excellent freelancers to plan it, one each for Activities, Travel, Venue and Food and drinks. They never meet and they never call each other, because the only thing they share is a board where everyone leaves notes.';
    // ACT
    const messages = OPENERS[0]?.messages.en as unknown as ScriptMessages;
    const actual = messages.voiceScript.segments['imagine-the-board']?.script;
    // ASSERT
    expect(actual).toBe(expected);
  });

  it('breaks the seam on A thought experiment: 31 vegetarian across, egg dishes back, breaking together', () => {
    // ARRANGE
    const expected = { failed: ['Egg dishes'], breaks: ['breaks: together'] };
    // ACT
    const $ = sceneOf('a-thought-experiment');
    const actual = { failed: textsOf($, '[data-mark="fail"] [data-note-text]'), breaks: textsOf($, '[data-breaks]') };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('lets the reader design the seam on What an agentic workflow is, from the four cards of the board', () => {
    // ARRANGE
    const expected = { cards: ['Activities', 'Travel', 'Food & drinks', 'Venue'], label: ['You design the seam'] };
    // ACT
    const $ = sceneOf('what-an-agentic-workflow-is');
    const actual = { cards: textsOf($, '[data-board-card] [data-note-text]'), label: textsOf($, '[data-seam-label]') };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('puts a person on the loop over the seam on How far you step out, with on selected', () => {
    // ARRANGE
    const expected = { pills: ['in', 'on', 'out'], selected: ['on'], people: 1 };
    // ACT
    const $ = sceneOf('how-far-you-step-out');
    const actual = {
      pills: textsOf($, '[data-pill]'),
      selected: textsOf($, '[data-pill][data-selected]'),
      people: $('[data-person]').length,
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('fills the contract card with the definition on What it requires of each person, and ticks it', () => {
    // ARRANGE
    const expected = {
      terms: ['Receives', 'Delivers', 'Checked by'],
      definition: ['= no meat, fish or eggs'],
      ticked: 1,
    };
    // ACT
    const $ = sceneOf('what-it-requires-of-each-person');
    const actual = {
      terms: textsOf($, '[data-contract-term]'),
      definition: textsOf($, '[data-definition]'),
      ticked: $('[data-tick="success"]').length,
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('chains the four cards to the goal under the team boxes on What it requires of the organisation', () => {
    // ARRANGE
    const expected = {
      teams: ['Venue team ×10', 'Food & drinks ×1'],
      chain: ['Activities', 'Travel', 'Venue', 'Food & drinks', 'Goal'],
    };
    // ACT
    const $ = sceneOf('what-it-requires-of-the-organisation');
    const actual = { teams: textsOf($, '[data-team]'), chain: textsOf($, '[data-chain-card] [data-note-text]') };
    // ASSERT
    expect(actual).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('declares no Speaker note on a section slide, since the picked Option shows no Context marker', () => {
    // ARRANGE
    const expected = [0, 0, 0, 0, 0];
    // ACT
    const actual = OPENERS.map((slide) => slide.notes.length);
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('marks no seam as failed outside A thought experiment', () => {
    // ARRANGE
    const expected = [1, 0, 0, 0, 0];
    // ACT
    const actual = OPENERS.map(({ slug }) => sceneOf(slug)('[data-mark="fail"]').length);
    // ASSERT
    expect(actual).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('titles and scripts every German section slide, segment by segment, as English does', () => {
    // ARRANGE
    const expected = [
      { title: 'Ein Gedankenexperiment', segments: ['Stell Dir das Board vor'] },
      { title: 'Was ein agentischer Workflow ist', segments: ['Die Sache benennen'] },
      { title: 'Wie weit Du Dich herausnimmst', segments: ['Offene Frage'] },
      { title: 'Was es von jeder Person verlangt', segments: ['Fähigkeiten hinter den Fehlern'] },
      { title: 'Was es von der Organisation verlangt', segments: ['Von den Menschen zum Unternehmen'] },
    ];
    // ACT
    const actual = OPENERS.map((slide) => {
      const { title, segments } = scriptOf(slide, 'de');
      return { title, segments };
    });
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('labels the oversight pills in German on the German page', () => {
    // ARRANGE
    const expected = ['in', 'an', 'außen'];
    // ACT
    const actual = textsOf(sceneOf('how-far-you-step-out', 'de'), '[data-pill]');
    // ASSERT
    expect(actual).toEqual(expected);
  });
});
