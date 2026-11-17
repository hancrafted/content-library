import { localizeSlide } from '@/episodes/components/slide-master/localized-slide';
import type { Slide } from '@/episodes/components/slide-master/slide';
import { episodeRef } from '@/episodes/lib/episode-folders';
import { placeSections } from '@/episodes/lib/episode.pure';
import type { Locale } from '@/shared/lib/locale.pure';
import { load } from 'cheerio';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { howFarYouStepOutSection } from './how-far-you-step-out';

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

function sceneOf(slug: string, locale: Locale = 'en') {
  const own = PLACED.find((entry) => entry.slide.slug === slug);
  if (own === undefined) throw new Error(`No Slide "${slug}" placed.`);
  const localized = localizeSlide(own, {
    episode: episodeRef('what-agentic-workflows-require', '2026-11-16-cyberforum-akademie-hands-on-agentic-workflows')
      .id,
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

const scriptOf = (slide: Slide, locale: Locale = 'en') =>
  slide.segments.map((segment) => {
    const own = messagesOf(slide, locale).voiceScript.segments[segment.slug];
    return `${own?.title} — ${own?.script}`;
  });

const notesOf = (slide: Slide) =>
  slide.notes.map((note) => ({
    header: messagesOf(slide).notes?.[note.slug]?.header,
    sources: (note.sources ?? []).map((source) => source.url),
  }));

describe('success cases', () => {
  it('places Slides 5 and 6 after the section slide, in Spec order, under their Spec titles', () => {
    // ARRANGE
    const expected = [
      'How far you step out',
      'In, on or out of the loop',
      'Trust lets you step out; review builds the trust',
    ];
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
      'The rule — Trust is what lets you step out of the loop, and you only trust a result you can check. Where checking costs as much as doing the work yourself, stepping out does not save you anything, it only means you accept a risk that nobody looks at.',
      'Hypothesis, said openly — That rule is my hypothesis, and I say so openly; the evidence for it comes mostly from software, so treat it as a good bet and not as a law.',
      'Review builds the trust — So the engineering comes first: you build the check in before the agent starts, a test the result can pass. When it passes, that is evidence, and evidence is what builds the trust. A feeling that the agent is good does not.',
      'Risk sets the bar — Risk sets how much trust a task needs. The guest list needs little, a missing name is one email. The venue and the activity need a lot, because a wrong result can leave two hundred people at a place that does not fit.',
      'The activity moves — Now look at the activity. It needed trust three and had one, so a person stayed in. Give it its check, everyone can join, wheelchair access, no fitness needed, and once the check passes the trust is earned and the task moves from in the loop to on the loop.',
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

  it('draws Slide 6 as the party board in workflow order, each task as far out as its earned trust covers its need', () => {
    // ARRANGE
    const expected = {
      tasks: ['Guest list', 'Venue', 'Activity'],
      needed: ['1', '3', '3'],
      earned: ['1', '3', '3'],
      levels: ['Out of the loop', 'On the loop', 'On the loop'],
      handoffs: ['200 guests', 'venue, date', 'programme'],
      goal: 'Goal 20 June: everyone celebrates together and gets home safely',
    };
    // ACT
    const $ = sceneOf(DISTANCE);
    const actual = {
      tasks: textsOf($, '[data-task-note] [data-task-label]'),
      needed: $('[data-task-note] [data-risk-meter]')
        .toArray()
        .map((node) => $(node).attr('data-risk-meter')),
      earned: $('[data-task-note] [data-trust-meter]')
        .toArray()
        .map((node) => $(node).attr('data-trust-meter')),
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
        meaning: 'A test the result can pass, set before the agent starts.',
      },
    };
    // ACT
    const $ = sceneOf(DISTANCE);
    const actual = {
      move: textsOf($, '[data-level-move] [data-oversight-pill]'),
      check: {
        heading: textsOf($, '[data-check-card] [data-check-title]')[0],
        checks: textsOf($, '[data-check-card] li'),
        meaning: textsOf($, '[data-check-card] [data-check-meaning]')[0],
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

  it('opens Slide 6 with the chain engineer for review, earned trust, step out, and numbers it with the board', () => {
    // ARRANGE
    const expected = {
      links: ['Engineer for review', 'Earned trust', 'Step out'],
      pills: ['In', 'On', 'Out'],
      callouts: ['1', '2', '3', '2', '3', '1'],
    };
    // ACT
    const $ = sceneOf(DISTANCE);
    const actual = {
      links: textsOf($, '[data-chain-link] [data-chain-label]'),
      pills: textsOf($, '[data-chain-link] [data-oversight-pill]'),
      callouts: textsOf($, '[data-callout]'),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('numbers the board’s check card 1, the activity’s earned trust 2 and its level move 3', () => {
    // ARRANGE
    const expected = { check: '1', earned: '2', move: '3' };
    // ACT
    const $ = sceneOf(DISTANCE);
    const actual = {
      check: $('[data-check-card] [data-callout]').text(),
      earned: $('[data-task-note]:has([data-level-move]) [data-trust-meter] ~ [data-callout]').text(),
      move: $('[data-task-note]:has([data-level-move]) [data-level-move] [data-callout]').text(),
    };
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
  it('titles and chains Slide 6 in German on the German page', () => {
    // ARRANGE
    const expected = {
      title: 'Vertrauen erlaubt den Schritt nach außen; Prüfung baut das Vertrauen auf',
      links: ['Prüfbar bauen', 'Verdientes Vertrauen', 'Nach außen treten'],
      pills: ['In', 'An', 'Außen'],
    };
    // ACT
    const actual = {
      title: messagesOf(slideOf(DISTANCE), 'de').title,
      links: textsOf(sceneOf(DISTANCE, 'de'), '[data-chain-link] [data-chain-label]'),
      pills: textsOf(sceneOf(DISTANCE, 'de'), '[data-chain-link] [data-oversight-pill]'),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

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
