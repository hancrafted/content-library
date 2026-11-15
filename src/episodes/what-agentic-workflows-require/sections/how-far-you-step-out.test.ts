import { localizeSlide } from '@/episodes/components/slide-master/localized-slide';
import type { Slide } from '@/episodes/components/slide-master/slide';
import { placeSections } from '@/episodes/lib/episode.pure';
import type { Locale } from '@/shared/lib/locale.pure';
import { load } from 'cheerio';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { howFarYouStepOutSection } from './how-far-you-step-out';

/*
 * Section 3, "How far you step out", as the approved Spec gives it: its section slide, then Slide 5 built to picked
 * Option 5b (three level cards over one venue booking at each level) and Slide 6 to picked Option 6b (the party board
 * in workflow order, each task as far out as its risk and its check allow), each titled, scripted and noted as the
 * Spec writes it.
 */

const SLIDES = howFarYouStepOutSection as readonly Slide[];
const PLACED = placeSections<Slide>([howFarYouStepOutSection]).flat();
const LEVELS = 'in-on-or-out-of-the-loop';
const DISTANCE = 'reviewability-sets-the-distance';
const MARKER = '[data-context-ref]';

interface Messages {
  title: string;
  heading?: string;
  caption: string;
  voiceScript: { segments: Record<string, { title: string; script: string }> };
  notes?: Record<string, { header: string; description: string }>;
}

const messagesOf = (slide: Slide, locale: Locale = 'en') => slide.messages[locale] as unknown as Messages;

const slideOf = (slug: string) => {
  const own = SLIDES.find((slide) => slide.slug === slug);
  if (own === undefined) throw new Error(`No Slide "${slug}" in the Section.`);
  return own;
};

/** A Slide's Scene as the page renders it under the shared Slide header. */
function sceneOf(slug: string, locale: Locale = 'en') {
  const own = PLACED.find((entry) => entry.slide.slug === slug);
  if (own === undefined) throw new Error(`No Slide "${slug}" placed.`);
  const localized = localizeSlide(own, {
    episode: 'what-agentic-workflows-require',
    locale,
    placed: PLACED,
    referenceLabels: { ref: 'opens speaker note', marker: (title) => `Speaker note: ${title}` },
    header: 'shared',
  });
  return load(renderToStaticMarkup(createElement(Fragment, null, localized.content)));
}

const textsOf = ($: ReturnType<typeof sceneOf>, selector: string) =>
  $(selector)
    .toArray()
    .map((node) => $(node).text().replace(/\s+/g, ' ').trim());

const markersOf = ($: ReturnType<typeof sceneOf>) =>
  $(MARKER)
    .toArray()
    .map((marker) => $(marker).attr('data-context-ref'));

/** Each Slide's Voice script, segment by segment: `title — script`. */
const scriptOf = (slide: Slide, locale: Locale = 'en') =>
  slide.segments.map((segment) => {
    const own = messagesOf(slide, locale).voiceScript.segments[segment.slug];
    return `${own?.title} — ${own?.script}`;
  });

/** Each Slide's Speaker notes: header and source URLs. */
const notesOf = (slide: Slide) =>
  slide.notes.map((note) => ({
    header: messagesOf(slide).notes?.[note.slug]?.header,
    sources: (note.sources ?? []).map((source) => source.url),
  }));

describe('success cases', () => {
  it('places Slides 5 and 6 after the section slide, in Spec order, under their Spec titles', () => {
    // ARRANGE
    const expected = ['How far you step out', 'In, on or out of the loop', 'Reviewability sets the distance'];
    // ACT
    const actual = SLIDES.map((slide) => messagesOf(slide).title);
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('scripts Slide 5 in the Spec’s Voice script, verbatim', () => {
    // ARRANGE
    const expected = [
      'In — Human in the loop means the agent acts only after a person has approved. Take booking the venue for the party: the agent proposes a venue, and nothing is booked until you say yes.',
      'On — Human on the loop means the agent acts on its own while a person watches and can step in. Now the agent books the venue itself, you read its reports, and you step in when something looks wrong.',
      'Out — Human out of the loop means the agent acts without any person, who sees only the result. The agent books the venue, and all you get is the confirmation.',
      'Borrowed terms — These three terms were borrowed from automation outside AI, from fields where an automated action often cannot be undone, so what role the person plays was decided on purpose and not left to chance. The detail is in the Speaker notes. We borrow them because the question is the same for your agents.',
      'Per task — So you choose per task, not per company. Minimal intervention stops being a vague promise and becomes a setting that you choose, task by task.',
    ];
    // ACT
    const actual = scriptOf(slideOf(LEVELS));
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('notes Slide 5 with the Spec’s Speaker notes and their sources', () => {
    // ARRANGE
    const anthropic = 'https://www.anthropic.com/research/measuring-agent-autonomy';
    const expected = [
      {
        header: 'Origin of the three terms',
        sources: ['https://www.hrw.org/report/2012/11/19/losing-humanity/case-against-killer-robots'],
      },
      { header: 'Two senses of "on"', sources: ['https://ec.europa.eu/newsroom/dae/document.cfm?doc_id=60419'] },
      { header: 'Approving to monitoring', sources: [anthropic] },
      { header: 'Out is a per-step property', sources: ['https://simonwillison.net/2026/Feb/7/software-factory/'] },
      { header: 'Regulation limits out', sources: ['https://artificialintelligenceact.eu/article/14/'] },
      {
        header: 'Aviation supplied the concept, not the words',
        sources: [
          'https://www.hlaszny.com/booksAndPapers/buckets/b3_handbookOfSysEng/Ch%2016%20Human%20Supervisory%20Control.pdf',
        ],
      },
      {
        header: 'Levels are not a strict ladder',
        sources: ['https://www.faa.gov/documentLibrary/media/Advisory_Circular/AC_120-123.pdf'],
      },
    ];
    // ACT
    const actual = notesOf(slideOf(LEVELS));
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('draws Slide 5 as three level cards, each named, defined and given its role', () => {
    // ARRANGE
    const expected = {
      pills: ['In the loop', 'On the loop', 'Out of the loop'],
      names: ['Human in the loop · HITL', 'Human on the loop · HOTL', 'Human out of the loop · HOOTL'],
      roles: ['The gatekeeper', 'The pilot', 'The auditor'],
    };
    // ACT
    const $ = sceneOf(LEVELS);
    const actual = {
      pills: textsOf($, '[data-level-card] [data-oversight-pill]'),
      names: textsOf($, '[data-level-card] [data-level-name]'),
      roles: textsOf($, '[data-level-card] [data-role-name]'),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('runs one task, booking the venue, under each card at its level, and leads it to the goal', () => {
    // ARRANGE
    const expected = {
      task: ['Venue · Book a venue for 200 on 20 June'],
      examples: [
        'In the loop Proposes a venue',
        'On the loop Books the venue and reports',
        'Out of the loop Books the venue',
      ],
      goal: ['Goal 20 June: everyone celebrates together and gets home safely'],
    };
    // ACT
    const $ = sceneOf(LEVELS);
    const actual = {
      task: textsOf($, '[data-example-task]'),
      examples: $('[data-task-example]')
        .toArray()
        .map((node) =>
          [$(node).find('[data-oversight-pill]').text(), $(node).find('[data-example-text]').text()].join(' '),
        ),
      goal: [textsOf($, '[data-goal-note] p').join(' ')],
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('marks Slide 5 with the Context markers its Option places, in reading order', () => {
    // ARRANGE
    const expected = {
      caption: 'out-is-a-per-step-property',
      scene: [
        'two-senses-of-on',
        'levels-are-not-a-strict-ladder',
        'origin-of-the-three-terms',
        'aviation-supplied-the-concept-not-the-words',
      ],
    };
    // ACT
    const actual = { caption: slideOf(LEVELS).captionNote, scene: markersOf(sceneOf(LEVELS)) };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('scripts Slide 6 in the Spec’s Voice script, verbatim', () => {
    // ARRANGE
    const expected = [
      'The rule — You can step out of the loop only as far as you can check the result. Where checking costs as much as doing the work yourself, stepping out does not save you anything, it only means you accept a risk that nobody looks at.',
      'Hypothesis, said openly — The rule that you can step out only as far as you can check is my hypothesis, and I say so openly; the evidence for it comes mostly from software, so treat it as a good bet and not as a law.',
      'Risk too — Checkability is only half of it. What a wrong result can do also helps set the level, so the more damage a wrong result can cause, the more a person stays in.',
      'Make it checkable — That makes the check the lever you control. Give the activity a test it can pass, such as everyone can join, wheelchair access, no fitness needed, and the same task can move from in the loop to on the loop.',
    ];
    // ACT
    const actual = scriptOf(slideOf(DISTANCE));
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('notes Slide 6 with the Spec’s Speaker notes and their sources', () => {
    // ARRANGE
    const psw = 'https://doi.org/10.1109/3468.844354';
    const expected = [
      { header: 'Software is easy to check', sources: ['https://www.anthropic.com/research/measuring-agent-autonomy'] },
      { header: 'Vigilance is no check', sources: ['https://doi.org/10.1177/0018720810376055'] },
      { header: 'Level is a design choice', sources: [psw] },
      { header: 'Oversight follows risk in the rules', sources: ['https://artificialintelligenceact.eu/article/14/'] },
      {
        header: 'Risk as a tool rating',
        sources: ['https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf'],
      },
      { header: 'Risk is one input, not the rule', sources: [psw] },
    ];
    // ACT
    const actual = notesOf(slideOf(DISTANCE));
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('draws Slide 6 as the party board in workflow order, each task as far out as its risk and its check allow', () => {
    // ARRANGE
    const expected = {
      tasks: ['Guest list', 'Venue', 'Activity'],
      risk: ['1', '3', '3'],
      levels: ['Out of the loop', 'On the loop', 'On the loop'],
      handoffs: ['200 guests', 'venue, date', 'programme'],
      goal: 'Goal 20 June: everyone celebrates together and gets home safely',
    };
    // ACT
    const $ = sceneOf(DISTANCE);
    const actual = {
      tasks: textsOf($, '[data-task-note] [data-task-label]'),
      risk: $('[data-task-note] [data-risk-meter]')
        .toArray()
        .map((node) => $(node).attr('data-risk-meter')),
      levels: textsOf($, '[data-task-note] [data-oversight-pill]:not([data-former])'),
      handoffs: textsOf($, '[data-handoff]'),
      goal: textsOf($, '[data-goal-note] p').join(' '),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('moves the activity from in to on once its check card is pinned to it', () => {
    // ARRANGE
    const expected = {
      move: ['In', 'On the loop'],
      check: {
        heading: 'Its check, built in',
        checks: ['Everyone can join', 'Wheelchair access', 'No fitness needed'],
      },
    };
    // ACT
    const $ = sceneOf(DISTANCE);
    const actual = {
      move: textsOf($, '[data-level-move] [data-oversight-pill]'),
      check: {
        heading: textsOf($, '[data-check-card] [data-check-heading]')[0],
        checks: textsOf($, '[data-check-card] li'),
      },
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('marks Slide 6 with the Context markers its Option places, in reading order', () => {
    // ARRANGE
    const expected = {
      caption: 'oversight-follows-risk-in-the-rules',
      scene: [
        'level-is-a-design-choice',
        'risk-as-a-tool-rating',
        'vigilance-is-no-check',
        'risk-is-one-input-not-the-rule',
        'software-is-easy-to-check',
      ],
    };
    // ACT
    const actual = { caption: slideOf(DISTANCE).captionNote, scene: markersOf(sceneOf(DISTANCE)) };
    // ASSERT
    expect(actual).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('never says the words in, on and out of the loop come from aviation', () => {
    // ARRANGE
    const expected = [
      'The words: military policy on weapon autonomy, 2012',
      'The concept: supervisory control in aircraft',
    ];
    // ACT
    const actual = textsOf(sceneOf(LEVELS), '[data-origin-pill]');
    // ASSERT
    expect(actual).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('labels the activity’s move in German on the German page', () => {
    // ARRANGE
    const expected = ['In', 'An der Schleife'];
    // ACT
    const actual = textsOf(sceneOf(DISTANCE, 'de'), '[data-level-move] [data-oversight-pill]');
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('labels the oversight pills in German on the German page', () => {
    // ARRANGE
    const expected = ['In der Schleife', 'An der Schleife', 'Außerhalb der Schleife'];
    // ACT
    const actual = textsOf(sceneOf(LEVELS, 'de'), '[data-level-card] [data-oversight-pill]');
    // ASSERT
    expect(actual).toEqual(expected);
  });
});
