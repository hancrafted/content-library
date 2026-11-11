import { localizeSlide, type LocalizedSlide } from '@/episodes/components/slide-master/localized-slide';
import type { Slide } from '@/episodes/components/slide-master/slide';
import { placeSections } from '@/episodes/lib/episode.pure';
import type { Locale } from '@/shared/lib/locale.pure';
import { load } from 'cheerio';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { contextIsTheRequirementSection } from './context-is-the-requirement';

/*
 * Section 3 of "From shared understanding to shared context", "Context is the requirement", as the approved Spec
 * gives it: Slides 7 to 12 in Spec order, each with the Spec's Voice script, Speaker notes and sources, a Context
 * marker wherever its picked Option's mock shows one, and the Scene facts the Option draws. Read through the one
 * interface the page reads a Slide by: localized on the shared Slide header.
 */

const ANTHROPIC = 'https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents';
const IBM = 'https://www.youtube.com/watch?v=BwXremQ-i6I';
const BREUNIG_FAIL = 'https://www.dbreunig.com/2025/06/22/how-contexts-fail-and-how-to-fix-them.html';

const PLACED = placeSections<Slide>([contextIsTheRequirementSection]).flat();

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

/** The notes a Slide's Context markers open, in document order; a note may carry several markers. */
function markersOf(slug: string) {
  const $ = sceneOf(slug);
  return $('[data-context-ref]')
    .toArray()
    .map((marker) => $(marker).attr('data-context-ref'));
}

/** The page Slides of the Section, the section slide left out. */
const PAGE_SLIDES = [
  'what-the-ai-actually-sees',
  'context-engineering-is-requirements-engineering-for-agents',
  'static-and-dynamic-context',
  'you-run-the-bench',
  'context-rot',
  'keeping-the-bench-clean',
];

describe('success cases', () => {
  it('lists Slides 7 to 12 after the section slide, in Spec order, titled by their Spec h3', () => {
    // ARRANGE
    const expected = [
      'Context is the requirement',
      'What the AI actually sees',
      'Context engineering is requirements engineering for agents',
      'Static and dynamic context',
      'You run the bench',
      'Context rot',
      'Keeping the bench clean',
    ];
    // ACT
    const titles = PLACED.map(({ slide }) => localized(slide.slug).title);
    // ASSERT
    expect(titles).toEqual(expected);
  });

  it('carries each Spec Voice script segment by its title, in order', () => {
    // ARRANGE
    const expected = [
      ['Callback', 'Not your mind'],
      ['The definition', 'Same four outcomes'],
      ['Before the shift', 'During the shift', 'Why it matters'],
      ['Human manages the context', 'Not how the AI works inside'],
      ['Junk drawer, meeting, two bosses', 'Static row', 'Dynamic row', 'More context, worse result'],
      ['Four cleanups', 'Fresh chat'],
    ];
    // ACT
    const titles = PAGE_SLIDES.map((slug) => localized(slug).voiceScript.map(({ title }) => title));
    // ASSERT
    expect(titles).toEqual(expected);
  });

  it('speaks the Spec Voice script word for word', () => {
    // ARRANGE
    const expected = {
      callback:
        'If you saw the context window Episode, you have met the context window before. Everything the AI works from is what sits in the window, nothing more and nothing less, and that window is a bar that fills up with every turn.',
      freshChat:
        'Sometimes the cleanest fix is a clean bench. Start a fresh chat and bring only the result, not the whole history. That is the second actionable, and I come back to it in the last Section.',
    };
    // ACT
    const actual = {
      callback: localized('what-the-ai-actually-sees').voiceScript[0]?.script,
      freshChat: localized('keeping-the-bench-clean').voiceScript[1]?.script,
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('gives every Slide the Speaker notes of the Spec, by header', () => {
    // ARRANGE
    const expected = [
      ['The window has an attention budget'],
      [
        'The definition',
        'Input quality tracks output quality',
        'A proposal, not a finding',
        'Where the parallel stops',
      ],
      ['Dynamic means loaded at run time'],
      ['More is not safer'],
      ['Length alone does part of the damage', 'The four names', 'Credit and limit', 'Numbers for confusion and clash'],
      ["The video's framing", 'Breunig lists other fixes', 'One fix per mode is a simplification'],
    ];
    // ACT
    const headers = PAGE_SLIDES.map((slug) => localized(slug).notes.map(({ header }) => header));
    // ASSERT
    expect(headers).toEqual(expected);
  });

  it('cites the sources the Spec names for the rot names and the framing', () => {
    // ARRANGE
    const expected = { fourNames: [BREUNIG_FAIL], credit: [IBM], definition: [ANTHROPIC] };
    // ACT
    const urls = (slug: string, header: string) =>
      localized(slug)
        .notes.find((note) => note.header === header)
        ?.sources?.map(({ url }) => url);
    const actual = {
      fourNames: urls('context-rot', 'The four names'),
      credit: urls('context-rot', 'Credit and limit'),
      definition: urls('context-engineering-is-requirements-engineering-for-agents', 'The definition'),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('places a Context marker for each note wherever the picked Options show one, in reading order', () => {
    // ARRANGE
    const expected = [
      ['the-window-has-an-attention-budget'],
      ['input-quality-tracks-output-quality', 'the-definition', 'a-proposal-not-a-finding', 'where-the-parallel-stops'],
      ['dynamic-means-loaded-at-run-time'],
      ['more-is-not-safer'],
      ['the-four-names', 'credit-and-limit', 'length-alone-does-part-of-the-damage', 'numbers-for-confusion-and-clash'],
      ['the-videos-framing', 'breunig-lists-other-fixes', 'one-fix-per-mode-is-a-simplification'],
    ];
    // ACT
    const markers = PAGE_SLIDES.map((slug) => [...new Set(markersOf(slug))]);
    // ASSERT
    expect(markers).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('marks every note target on exactly one element of its Slide', () => {
    // ARRANGE
    const expected = PAGE_SLIDES.map((slug) => localized(slug).notes.map(() => 1));
    // ACT
    const counts = PAGE_SLIDES.map((slug) => {
      const $ = sceneOf(slug);
      return localized(slug).notes.map(({ target }) => $(`[data-target="${target}"]`).length);
    });
    // ASSERT
    expect(counts).toEqual(expected);
  });

  it('draws no warning on the board whose darts land on the bull', () => {
    // ARRANGE
    const expected = { warningDarts: 0, primaryDarts: 4 };
    // ACT
    const $ = sceneOf('context-engineering-is-requirements-engineering-for-agents');
    const board = $('[data-outcome="both"]');
    const actual = {
      warningDarts: board.find('[data-dart][class*="warning"]').length,
      primaryDarts: board.find('[data-dart][class*="primary"]').length,
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('shows "Context rot at the bench" on screen while the table of contents keeps "Context rot"', () => {
    // ARRANGE
    const expected = { onScreen: 'Context rot at the bench', contents: 'Context rot' };
    // ACT
    const slide = localized('context-rot');
    const actual = { onScreen: slide.header?.title, contents: slide.title };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('draws the four outcomes as Slide 6 does: one board each, a loose cluster dulled, a vague window dashed', () => {
    // ARRANGE
    const expected = {
      boards: ['precise-accurate', 'precise-off', 'accurate-scattered', 'neither'],
      looseDarts: ['fill-muted-foreground stroke-card'],
      windows: ['crisp', 'crisp', 'vague', 'vague'],
    };
    // ACT
    const $ = sceneOf('context-engineering-is-requirements-engineering-for-agents');
    const actual = {
      boards: $('[data-outcome-board]')
        .toArray()
        .map((board) => $(board).attr('data-outcome-board')),
      looseDarts: [
        ...new Set(
          $('[data-outcome-board="accurate-scattered"] [data-dart]')
            .toArray()
            .map((dart) => $(dart).attr('class')),
        ),
      ],
      windows: $('[data-window]')
        .toArray()
        .map((window) => $(window).attr('data-window')),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('draws four outcome boards, eight messes and four fixes, the bench on Slides 9 and 10', () => {
    // ARRANGE
    const expected = { boards: 4, messes: 8, fixes: 4, benches: 2, workers: 2 };
    // ACT
    const outcomes = sceneOf('context-engineering-is-requirements-engineering-for-agents');
    const rot = sceneOf('context-rot');
    const fixes = sceneOf('keeping-the-bench-clean');
    const actual = {
      boards: outcomes('[data-dartboard]').length,
      messes: rot('[data-cell] [data-vignette]').length,
      fixes: fixes('[data-fix]').length,
      benches: sceneOf('static-and-dynamic-context')('[data-bench-item="bench"]').length,
      workers: sceneOf('you-run-the-bench')('[data-bench-worker]').length,
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('writes every German Slide with a German title, notes and Voice script of the same shape', () => {
    // ARRANGE
    const expected = PAGE_SLIDES.map((slug) => ({
      notes: localized(slug).notes.length,
      segments: localized(slug).voiceScript.length,
      differs: true,
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
