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
import { whatItRequiresOfTheOrganisationSection } from './what-it-requires-of-the-organisation';

/*
 * The page Slides of the Section "What it requires of the organisation", as the approved Spec gives them: Slide 10
 * "The org chart trap" (picked 10a), Slide 11 "Designed AI first" (11b), Slide 12 "What to look for in your team"
 * (12a) and Slide 13 "From article to quiz" (13c), each read as the page renders its Scene under the shared Slide
 * header.
 */

const EPISODE = episodeRef(
  'what-agentic-workflows-require',
  '2026-11-16-cyberforum-akademie-hands-on-agentic-workflows',
).id;
const SECTION = whatItRequiresOfTheOrganisationSection as readonly Slide[];
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

/** The words of each match, its Context markers left out. */
const textsOf = ($: ReturnType<typeof sceneOf>, selector: string) =>
  $(selector)
    .toArray()
    .map((node) => {
      const own = $(node).clone();
      own.find('[data-context-ref]').remove();
      return own.text().replace(/\s+/g, ' ').trim();
    });

/** The notes a Scene's Context markers open, in document order. */
const markersOf = ($: ReturnType<typeof sceneOf>) =>
  $('[data-context-ref]')
    .toArray()
    .map((node) => $(node).attr('data-context-ref'));

describe('success cases', () => {
  it('places the four page Slides after the section slide, in Spec order, titled by the Spec h3', () => {
    // ARRANGE
    const expected = {
      slugs: [
        'what-it-requires-of-the-organisation',
        'the-org-chart-trap',
        'designed-ai-first',
        'what-to-look-for-in-your-team',
        'from-article-to-quiz',
      ],
      titles: ['The org chart trap', 'Designed AI first', 'What to look for in your team', 'One whole workflow'],
      headings: [undefined, undefined, 'What did you need to do?', undefined],
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
      ["Conway's law", "A team's draft", 'Broadly defined', 'Your sign'],
      ['Start at the outcome', 'Contract on every milestone', 'Cut seams', 'Not more meetings'],
      [
        'The answer',
        'Break down',
        'Write contracts',
        'Review twice',
        'The organisation',
        'Look at your team',
        'Take one process',
      ],
      ['One whole workflow', 'In, on or out per step', 'A contract at every handoff', 'Designed around the goal'],
    ];
    // ACT
    const actual = PAGE_SLIDES.map((slide) =>
      slide.segments.map(({ slug }) => messagesOf(slide).voiceScript.segments[slug]?.title),
    );
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('carries the sign segment of Slide 10 verbatim from the Spec', () => {
    // ARRANGE
    const expected =
      "If a workflow mirrors your org chart, use Conway's law as a prompt: are the team boundaries helping meet the goal? Consider a redesign if they get in the way.";
    // ACT
    const actual = messagesOf(slideOf('the-org-chart-trap')).voiceScript.segments['your-sign']?.script;
    // ASSERT
    expect(actual).toBe(expected);
  });

  it('draws the committee by headcount on Slide 10 and its draft copying it: fourteen venue steps, none from the goal', () => {
    // ARRANGE
    const expected = {
      lead: ['Committee lead'],
      roles: ['Venue scouts', 'Caterer', 'Travel planner'],
      people: [10, 1, 1],
      columns: ['Venue scouting · 14 steps', 'Catering · 1 step', 'Travel · 1 step'],
      steps: [14, 1, 1],
      goal: ['20 June: everyone celebrates together and gets home safely'],
      goalNote: ['No step plans back from here.'],
      quoteAuthor: ['Melvin Conway, 1968'],
    };
    // ACT
    const $ = sceneOf('the-org-chart-trap');
    const actual = {
      lead: textsOf($, '[data-org-lead]'),
      roles: textsOf($, '[data-role] [data-role-label]'),
      people: $('[data-role]')
        .toArray()
        .map((node) => $(node).find('[data-person]').length),
      columns: textsOf($, '[data-column] [data-column-label]'),
      steps: $('[data-column]')
        .toArray()
        .map((node) => $(node).find('[data-step]').length),
      goal: textsOf($, '[data-goal-note] p + p'),
      goalNote: textsOf($, '[data-goal-hint]'),
      quoteAuthor: textsOf($, '[data-quote-author]'),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('fades the draft on Slide 11 and redraws it from the goal: five notes, a contract under each, pins where tips act', () => {
    // ARRANGE
    const expected = {
      before: ['Venue scouting · 14', 'Catering · 1', 'Travel · 1'],
      faded: 1,
      notes: [
        'Travel + guest info, merged',
        'Venue: alpine hut, step-free',
        'Food & drinks for 200',
        'Activities everyone can join',
        'Shuttle back after the open bar',
      ],
      doers: ['ai', 'ai', 'ai', 'human', 'ai'],
      contracts: 5,
      receives: ['31 vegetarian: no meat, fish or eggs'],
      goal: ['20 June: everyone celebrates together and gets home safely'],
      pins: ['3', '2', '1', '1', '2', '3'],
      tips: ['Start at the outcome.', 'Make handoffs checkable', 'Simplify unhelpful handoffs.'],
      payoff: ['In this example, better handoffs—not more meetings—close the gaps.'],
    };
    // ACT
    const $ = sceneOf('designed-ai-first');
    const actual = {
      before: textsOf($, '[data-draft-column]'),
      faded: $('[data-draft-strip].opacity-60').length,
      notes: textsOf($, '[data-lean-note] [data-note-text]'),
      doers: $('[data-lean-note] [data-doer]')
        .toArray()
        .map((node) => $(node).attr('data-doer')),
      contracts: $('[data-lean-note] [data-contract]').length,
      receives: textsOf($, '[data-contract].bg-primary dd').slice(0, 1),
      goal: textsOf($, '[data-goal-note] p + p'),
      pins: $('[data-pin]')
        .toArray()
        .map((node) => $(node).attr('data-pin')),
      tips: textsOf($, '[data-tip] b'),
      payoff: textsOf($, '[data-payoff]'),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('ties each skill on Slide 12 to the failures it fixed, all four marked fixed, beside what the organisation gives', () => {
    // ARRANGE
    const expected = {
      skills: [
        'Break the work down from the goal',
        'Write the contract at the seam',
        'Review against contract and goal',
      ],
      fixedPerSkill: [2, 1, 1],
      was: ['Carpools + open bar', '1,800 m in summer clothes', '“31 vegetarian” got egg dishes', 'Paintball × 200'],
      provisions: [
        'Clear goals',
        'Contracts between teams',
        'An oversight policy per task',
        'Workflows around the goal',
      ],
      pills: ['In the loop', 'On the loop', 'Out of the loop'],
    };
    // ACT
    const $ = sceneOf('what-to-look-for-in-your-team');
    const actual = {
      skills: textsOf($, '[data-skill] [data-skill-text]'),
      fixedPerSkill: $('[data-skill]')
        .toArray()
        .map((node) => $(node).find('[data-mark="fixed"]').length),
      was: textsOf($, '[data-mark="fixed"] [data-note-kicker]'),
      provisions: textsOf($, '[data-provision] [data-provision-title]'),
      pills: textsOf($, '[data-oversight-pill]'),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('runs the Explorable on Slide 13 with a level on each stage, a contract after each stage it hands off from and the four pins', () => {
    // ARRANGE
    const expected = {
      diagram: 1,
      goal: ['Goal: bring 200 people from five offices together next summer, within €60,000'],
      levels: ['On the loop', 'In the loop', 'On the loop', 'In the loop'],
      contracts: ['Plan → Requirements', 'Requirements → Research', 'Research → Page'],
      pins: ['3', '1', '2', '4', '1', '2', '3', '4'],
      steps: [
        'Pick one recurring process.',
        'Write the handoff clearly.',
        'Use Conway’s law as a prompt.',
        'Develop useful capabilities.',
      ],
    };
    // ACT
    const $ = sceneOf('from-article-to-quiz');
    const actual = {
      diagram: $('[data-part="diagram"]').length,
      goal: textsOf($, '[data-quiz-goal]'),
      levels: textsOf($, '[data-part="diagram"] [data-oversight-pill]'),
      contracts: textsOf($, '[data-part="diagram"] [data-stage-after] [data-contract-label]'),
      pins: $('[data-pin]')
        .toArray()
        .map((node) => $(node).attr('data-pin')),
      steps: textsOf($, '[data-step-legend] b'),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('opens each Speaker note the mock marks from its place in the Scene, in reading order', () => {
    // ARRANGE
    const expected = [
      [
        'why-it-happens',
        'components-include-tasks',
        'the-law-as-conway-states-it',
        'a-tendency-not-a-rule',
        'the-first-design-is-not-the-best',
      ],
      ['checkpoints-in-the-path', 'contract-first-decomposition', 'vague-handoffs-duplicate-work'],
      [
        'management-101-skills',
        'effort-moves-to-steering-and-checking',
        'evidence-is-indirect',
        'juniors-may-not-build-them',
      ],
      ['workflow-and-agent-two-levels'],
    ];
    // ACT
    const actual = PAGE_SLIDES.map(({ slug }) => markersOf(sceneOf(slug)));
    // ASSERT
    expect(actual).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('cites a source on every Speaker note of the Section', () => {
    // ARRANGE
    const expected = [5, 3, 4, 1];
    // ACT
    const actual = PAGE_SLIDES.map((slide) => slide.notes.filter((note) => (note.sources ?? []).length > 0).length);
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('fills one part of Slides 10 to 12 with primary, so the eye has one place to land', () => {
    // ARRANGE
    const expected = [1, 1, 1];
    // ACT
    const actual = PAGE_SLIDES.slice(0, 3).map(({ slug }) => sceneOf(slug)('.bg-primary').length);
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('names no company or team in the transformation story of Slide 10', () => {
    // ARRANGE
    const expected = 'I will not name the company or the team.';
    // ACT
    const script = messagesOf(slideOf('the-org-chart-trap')).voiceScript.segments['a-teams-draft']?.script ?? '';
    const actual = script.slice(script.lastIndexOf('I will'));
    // ASSERT
    expect(actual).toBe(expected);
  });
});

describe('edge cases', () => {
  it('titles every German Slide in German and labels the oversight pills as the rest of the Episode does', () => {
    // ARRANGE
    const expected = {
      titles: [
        'Die Organigramm-Falle',
        'KI-first entworfen',
        'Worauf Du in Deinem Team achten solltest',
        'Ein durchgängiger Workflow',
      ],
      pills: ['In der Schleife', 'An der Schleife', 'Außerhalb der Schleife'],
    };
    // ACT
    const actual = {
      titles: PAGE_SLIDES.map((slide) => messagesOf(slide, 'de').title),
      pills: textsOf(sceneOf('what-to-look-for-in-your-team', 'de'), '[data-oversight-pill]'),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('names the Speaker notes in the Spec order, the ones no marker opens included', () => {
    // ARRANGE
    const expected = [
      [
        'The law as Conway states it',
        'Why it happens',
        'A tendency, not a rule',
        'Components include tasks',
        'The first design is not the best',
      ],
      ['Checkpoints in the path', 'Contract-first decomposition', 'Vague handoffs duplicate work'],
      [
        'Management 101 skills',
        'Effort moves to steering and checking',
        'Evidence is indirect',
        'Juniors may not build them',
      ],
      ['Workflow and agent, two levels'],
    ];
    // ACT
    const actual = PAGE_SLIDES.map((slide) => slide.notes.map(({ slug }) => messagesOf(slide).notes[slug]?.header));
    // ASSERT
    expect(actual).toEqual(expected);
  });
});
