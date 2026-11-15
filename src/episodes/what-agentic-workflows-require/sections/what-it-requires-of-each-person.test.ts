import { localizeSlide } from '@/episodes/components/slide-master/localized-slide';
import type { Slide } from '@/episodes/components/slide-master/slide';
import { placeSections } from '@/episodes/lib/episode.pure';
import type { Locale } from '@/shared/lib/locale.pure';
import { load } from 'cheerio';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { whatAgenticWorkflowsRequire } from '../episode';
import { whatItRequiresOfEachPersonSection } from './what-it-requires-of-each-person';

/*
 * The page Slides of the Section "What it requires of each person", as the approved Spec gives them: Slide 7 "Plan back
 * from the goal" (picked 7b), Slide 8 "Contracts at the seams" (8a) and Slide 9 "Reviewing the result" (9a), each read
 * as the page renders its Scene under the shared Slide header.
 */

const EPISODE = 'what-agentic-workflows-require';
const SECTION = whatItRequiresOfEachPersonSection as readonly Slide[];
const PAGE_SLIDES = SECTION.slice(1);
const PLACED = placeSections<Slide>(whatAgenticWorkflowsRequire.sections).flat();

function slideOf(slug: string): Slide {
  const own = SECTION.find((entry) => entry.slug === slug);
  if (own === undefined) throw new Error(`No Slide "${slug}" in the Section.`);
  return own;
}

/** A Slide's Scene as the page renders it under the shared Slide header. */
function sceneOf(slug: string, locale: Locale = 'en') {
  const own = PLACED.find((entry) => entry.slide.slug === slug);
  if (own === undefined) throw new Error(`No placed Slide "${slug}".`);
  const localized = localizeSlide(own, {
    episode: EPISODE,
    locale,
    placed: PLACED,
    referenceLabels: { ref: 'opens speaker note', marker: (title) => `Speaker note: ${title}` },
    header: 'shared',
  });
  return load(renderToStaticMarkup(createElement(Fragment, null, localized.content)));
}

interface OwnMessages {
  title: string;
  heading?: string;
  voiceScript: { segments: Record<string, { title: string; script: string }> };
  notes: Record<string, { header: string }>;
}

const messagesOf = (slide: Slide, locale: Locale = 'en') => slide.messages[locale] as unknown as OwnMessages;

const textsOf = ($: ReturnType<typeof sceneOf>, selector: string) =>
  $(selector)
    .toArray()
    .map((node) => $(node).text().replace(/\s+/g, ' ').trim());

/** The notes a Scene's Context markers open, in document order. */
const markersOf = ($: ReturnType<typeof sceneOf>) =>
  $('[data-context-ref]')
    .toArray()
    .map((node) => $(node).attr('data-context-ref'));

describe('success cases', () => {
  it('places the three page Slides after the section slide, in Spec order, titled by the Spec h3', () => {
    // ARRANGE
    const expected = {
      slugs: [
        'what-it-requires-of-each-person',
        'plan-back-from-the-goal',
        'contracts-at-the-seams',
        'reviewing-the-result',
      ],
      titles: ['Plan back from the goal', 'Contracts at the seams', 'Reviewing the result'],
      headings: [undefined, undefined, undefined],
    };
    // ACT
    const actual = {
      slugs: SECTION.map(({ slug }) => slug),
      titles: PAGE_SLIDES.map((slide) => messagesOf(slide).title),
      headings: PAGE_SLIDES.map((slide) => messagesOf(slide).heading),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('carries every Voice script segment of the Spec, titled as the Spec writes it', () => {
    // ARRANGE
    const expected = [
      [
        'Start at the goal',
        'State the outcome',
        'Outside your control',
        'The tasks nobody owned',
        'Well known, and agents like it',
      ],
      ['Design by contract', 'Receives, delivers, checked by', 'Leave the how open', 'The egg dishes'],
      ['Two checks', 'Paintball passes', 'The goal check', 'Your verdict'],
    ];
    // ACT
    const actual = PAGE_SLIDES.map((slide) =>
      slide.segments.map(({ slug }) => messagesOf(slide).voiceScript.segments[slug]?.title),
    );
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('carries the contract segment of Slide 8 verbatim from the Spec', () => {
    // ARRANGE
    const expected =
      'For a handoff that matters, try writing three lines: what the next task receives, what it delivers and how the result can be checked. Keep the contract as specific as the goal requires.';
    // ACT
    const actual = messagesOf(slideOf('contracts-at-the-seams')).voiceScript.segments['receives-delivers-checked-by']
      ?.script;
    // ASSERT
    expect(actual).toBe(expected);
  });

  it('breaks the goal into two subgoals and finds the two tasks nobody owned under gets home safely', () => {
    // ARRANGE
    const expected = {
      goal: ['20 June: everyone celebrates together and gets home safely'],
      subgoals: ['Everyone celebrates together', 'Everyone gets home safely'],
      together: ['Alpine hut, 1,800 m', 'The hut’s kitchen'],
      home: ['Shuttle back after the open bar', 'Bring warm clothes, 6 °C at night'],
      fixed: ['Shuttle back after the open bar', 'Bring warm clothes, 6 °C at night'],
      external: ['The hut’s kitchen'],
    };
    // ACT
    const $ = sceneOf('plan-back-from-the-goal');
    const actual = {
      goal: textsOf($, '[data-goal-note] [data-note-text]'),
      subgoals: textsOf($, '[data-subgoal] [data-note-text]'),
      together: textsOf($, '[data-branch="together"] [data-leaf] [data-note-text]'),
      home: textsOf($, '[data-branch="home"] [data-leaf] [data-note-text]'),
      fixed: textsOf($, '[data-mark="fixed"] [data-note-text]'),
      external: textsOf($, '[data-external] [data-note-text]'),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('pins the contract card to the seam of Slide 8, the definition set off and the how left to the kitchen', () => {
    // ARRANGE
    const expected = {
      heading: ['Contract · Food & drinks → the venue’s kitchen'],
      terms: ['Receives', 'Delivers', 'Checked by'],
      values: [
        '200 guests, 31 vegetarian, defined as no meat, fish or eggs',
        'Dinner for 200 at 19:00',
        'The menu against the definition',
      ],
      definition: ['defined as no meat, fish or eggs'],
      how: ['How: the kitchen’s choice'],
      fixed: ['31 vegetarian plates, no eggs'],
      external: ['The venue’s, at the alpine hut'],
      doers: ['ai', 'human'],
    };
    // ACT
    const $ = sceneOf('contracts-at-the-seams');
    const actual = {
      heading: textsOf($, '[data-contract-label]'),
      terms: textsOf($, '[data-contract-term]'),
      values: textsOf($, '[data-contract] dd'),
      definition: textsOf($, '[data-contract] dd b'),
      how: textsOf($, '[data-contract-how]'),
      fixed: textsOf($, '[data-mark="fixed"] [data-note-text]'),
      external: textsOf($, '[data-external] [data-note-text]'),
      doers: $('[data-doer]')
        .toArray()
        .map((node) => $(node).attr('data-doer')),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('checks the paintball note twice on Slide 9: three ticks against its contract, a cross against the goal', () => {
    // ARRANGE
    const expected = {
      checks: ['Activity for 200', 'Within budget', 'On 20 June'],
      passed: ['true', 'true', 'true'],
      goal: ['Against the goal: everyone celebrates together'],
      finding: ['Ten colleagues use wheelchairs'],
      seenOn: ['Travel’s accessible bus for ten'],
      fix: ['Checked by: everyone can join, wheelchair access'],
      verdicts: ['Passes: 3 of 3', 'Fails the goal'],
    };
    // ACT
    const $ = sceneOf('reviewing-the-result');
    const actual = {
      checks: textsOf($, '[data-contract-check] [data-check-label]'),
      passed: $('[data-contract-check]')
        .toArray()
        .map((node) => $(node).attr('data-passed')),
      goal: textsOf($, '[data-goal-check] [data-goal-strip]'),
      finding: textsOf($, '[data-goal-check] [data-finding]'),
      seenOn: textsOf($, '[data-goal-check] [data-seen-on]'),
      fix: textsOf($, '[data-goal-check] [data-fix]'),
      verdicts: textsOf($, '[data-verdict]'),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('opens each Speaker note the mock marks from its place in the Scene, in reading order', () => {
    // ARRANGE
    const expected = [
      [
        'regression-in-planning',
        'project-management-does-it-too',
        'vendors-say-clear-goals',
        'missing-detail-costs-accuracy',
      ],
      ['pre-and-postcondition', 'no-defensive-duplication'],
      ['his-two-questions', 'where-the-fix-lands'],
    ];
    // ACT
    const actual = PAGE_SLIDES.map(({ slug }) => markersOf(sceneOf(slug)));
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('ends each caption on the Context marker of the note that defines its term', () => {
    // ARRANGE
    const expected = ['pappus-and-polya', 'a-contract-has-two-sides', 'two-definitions'];
    // ACT
    const actual = PAGE_SLIDES.map(({ captionNote }) => captionNote);
    // ASSERT
    expect(actual).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('fills one part of each Scene with primary, so the eye has one place to land', () => {
    // ARRANGE
    const expected = [1, 1, 1];
    // ACT
    const actual = PAGE_SLIDES.map(({ slug }) => sceneOf(slug)('.bg-primary').length);
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('keeps success and destructive for the fixed and failed marks on Slide 9, ticking the contract in foreground', () => {
    // ARRANGE
    const expected = { success: 1, destructive: 1, foreground: 3 };
    // ACT
    const $ = sceneOf('reviewing-the-result');
    const actual = {
      success: $('path[class~="stroke-(--success)"]').length,
      destructive: $('path.stroke-destructive').length,
      foreground: $('[data-contract-check] path.stroke-foreground').length,
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('cites a source on every Speaker note of the Section', () => {
    // ARRANGE
    const expected = [10, 4, 4];
    // ACT
    const actual = PAGE_SLIDES.map((slide) => slide.notes.filter((note) => (note.sources ?? []).length > 0).length);
    // ASSERT
    expect(actual).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('titles every German Slide and its Voice script segments in German', () => {
    // ARRANGE
    const expected = [
      {
        title: 'Vom Ziel aus rückwärts planen',
        segments: [
          'Beim Ziel anfangen',
          'Das Ergebnis benennen',
          'Außerhalb Deiner Kontrolle',
          'Die Aufgaben, die niemandem gehörten',
          'Bekannt, und Agenten mögen es',
        ],
      },
      {
        title: 'Verträge an den Nahtstellen',
        segments: ['Design by Contract', 'Erhält, liefert, geprüft durch', 'Das Wie offenlassen', 'Die Eiergerichte'],
      },
      {
        title: 'Das Ergebnis prüfen',
        segments: ['Zwei Prüfungen', 'Paintball besteht', 'Die Prüfung des Ziels', 'Dein Urteil'],
      },
    ];
    // ACT
    const actual = PAGE_SLIDES.map((slide) => {
      const messages = messagesOf(slide, 'de');
      return {
        title: messages.title,
        segments: slide.segments.map(({ slug }) => messages.voiceScript.segments[slug]?.title),
      };
    });
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('names the Speaker notes in the Spec order, the ones no marker opens included', () => {
    // ARRANGE
    const expected = [
      [
        'Pappus and Pólya',
        'Regression in planning',
        'Fewer actions to consider',
        'It feels wrong',
        'Project management does it too',
        'What the backward run gives',
        'Scope starts at the end product',
        'Vendors say: clear goals',
        'Missing detail costs accuracy',
        'Asking recovers it, and the limit',
      ],
      ['A contract has two sides', 'Pre- and postcondition', 'No defensive duplication', 'Same split in Eiffel'],
      ['Two definitions', 'His two questions', 'Where the fix lands', 'Software practice, not agents'],
    ];
    // ACT
    const actual = PAGE_SLIDES.map((slide) => slide.notes.map(({ slug }) => messagesOf(slide).notes[slug]?.header));
    // ASSERT
    expect(actual).toEqual(expected);
  });
});
