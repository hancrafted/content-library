import { localizeSlide } from '@/episodes/components/slide-master/localized-slide';
import type { Slide } from '@/episodes/components/slide-master/slide';
import { episodeRef } from '@/episodes/lib/episode-folders';
import { placeSections } from '@/episodes/lib/episode.pure';
import type { Locale } from '@/shared/lib/locale.pure';
import { load } from 'cheerio';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { whatAgenticWorkflowsRequire } from '../episode';

/*
 * The section slides of "What agentic workflows require of people and organisations": one per Section, in Spec order,
 * each titled by its Section, carrying its Voice script, and each Scene its own picture of its Section's state. The
 * first is the manager setup, the others echo the contract seam of the Spec's picked Option 0b.
 */

const EPISODE = episodeRef(
  'what-agentic-workflows-require',
  '2026-11-16-cyberforum-akademie-hands-on-agentic-workflows',
).id;
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
        caption: 'You hired four excellent freelancers for one party. You are the only link between them.',
        segments: ["Now you're the manager", 'Four PRICE freelancers', 'Your job'],
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

  it('opens the Episode with the manager setup: the party, the four freelancers and the closing question', () => {
    // ARRANGE
    const expected = {
      'now-you-are-the-manager':
        "Now you're the manager. Same summer party, 200 colleagues from five offices, on the 20th of June. This time you don't plan it yourself: you have four freelancers, one each for Activities, Travel, Venue and Food and drinks.",
      'four-price-freelancers':
        'They are excellent, and they are the PRICE freelancers: probabilistic, relentless, informed, confident, and every word billed. And there is one rule: they talk to no one unless you tell them to. You are the only link between them.',
      'your-job':
        'The goal is that everyone celebrates together and gets home safely. Your job: a plan so all four reach the goal. What do you do? (pause) Keep this question in mind for the whole Episode; we collect the answers at the end.',
    };
    // ACT
    const opener = OPENERS[0] as Slide;
    const messages = opener.messages.en as unknown as ScriptMessages;
    const actual = Object.fromEntries(
      opener.segments.map(({ slug }) => [slug, messages.voiceScript.segments[slug]?.script]),
    );
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('sets the manager scene on A thought experiment: four PRICE freelancers, the rule, the goal and the question', () => {
    // ARRANGE
    const expected = {
      freelancers: ['Activities', 'Travel', 'Venue', 'Food & drinks'],
      chips: [5, 5, 5, 5],
      doneBy: 0,
      rule: ['✗They talk to no one unless you tell them to.'],
      question: ['Your job: a plan so all four reach the goal. What do you do?'],
    };
    // ACT
    const $ = sceneOf('a-thought-experiment');
    const actual = {
      freelancers: textsOf($, '[data-freelancer] [data-card-label]'),
      chips: $('[data-freelancer]')
        .toArray()
        .map((card) => $(card).find('[data-price-chip]').length),
      doneBy: $('[data-freelancer] [data-done-by]').length,
      rule: textsOf($, '[data-rule]'),
      question: textsOf($, '[data-question]'),
    };
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

  it('opens each placement marker with its own section slide, never a page Slide', () => {
    // ARRANGE
    const expected = [
      'a-thought-experiment',
      'what-an-agentic-workflow-is',
      'how-far-you-step-out',
      'what-it-requires-of-each-person',
      'what-it-requires-of-the-organisation',
    ];
    // ACT
    const actual = SECTIONS.map(([opener]) => opener.slug);
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('marks no seam as failed on any section slide', () => {
    // ARRANGE
    const expected = [0, 0, 0, 0, 0];
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
      {
        title: 'Ein Gedankenexperiment',
        segments: ['Jetzt bist Du die Führungskraft', 'Vier PRICE-Freelancer', 'Dein Auftrag'],
      },
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

  it('titles the setup Slide with its Section for the table of contents and heads it "You\'re the manager" on screen', () => {
    // ARRANGE
    const expected = {
      en: { toc: 'A thought experiment', heading: "You're the manager" },
      de: { toc: 'Ein Gedankenexperiment', heading: 'Du bist die Führungskraft' },
    };
    // ACT
    const opener = OPENERS[0] as Slide;
    const read = (locale: Locale) => {
      const { title, heading } = opener.messages[locale] as unknown as { title: string; heading: string };
      return { toc: title, heading };
    };
    const actual = { en: read('en'), de: read('de') };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('names the PRICE traits in the setup legend as the pay-the-price slide does: the English name, then the German gloss', () => {
    // ARRANGE
    const expected = [
      'P Probabilistic probabilistisch',
      'R Relentless unermüdlich',
      'I Informed informiert',
      'C Confident selbstsicher',
      'E Every word billed jedes Wort berechnet',
    ];
    // ACT
    const $ = sceneOf('a-thought-experiment', 'de');
    const actual = textsOf($, '[data-price-legend] li').map((text) => text.replace(/\s+/g, ' '));
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
