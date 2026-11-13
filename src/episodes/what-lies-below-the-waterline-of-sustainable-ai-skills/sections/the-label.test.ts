import { localizeSlide, type LocalizedSlide } from '@/episodes/components/slide-master/localized-slide';
import type { Slide } from '@/episodes/components/slide-master/slide';
import { SlideHeader } from '@/episodes/components/slide-master/slide-header';
import { placeSections } from '@/episodes/lib/episode.pure';
import type { Locale } from '@/shared/lib/locale.pure';
import { load } from 'cheerio';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { theLabelSection } from './the-label';

/*
 * Section 4 of "What lies below the waterline of sustainable AI skills", "The label" (its h2 "The description"), as the
 * approved Spec gives it: Slides 11 to 13 in Spec order, each with the Spec's Voice script, Speaker notes and sources,
 * a Context marker wherever its picked Option's mock shows one, and the Scene facts the Option draws. Read through the
 * one interface the page reads a Slide by: localized on the shared Slide header.
 */

const OPTIMIZING = 'https://agentskills.io/skill-creation/optimizing-descriptions';
const PIROLLI = 'https://doi.org/10.1037/0033-295X.106.4.643';
const SPECIFICATION = 'https://agentskills.io/specification';
const ANTHROPIC = 'https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices';
const GOOGLE = 'https://www.kaggle.com/whitepaper-agent-skills';
const HICK = 'https://doi.org/10.1080/17470215208416600';
const HYMAN = 'https://doi.org/10.1037/h0056940';
const VERCEL = 'https://vercel.com/blog/agents-md-outperforms-skills-in-our-agent-evals';
const BEST_PRACTICES = 'https://agentskills.io/skill-creation/best-practices';

const PLACED = placeSections<Slide>([theLabelSection]).flat();

function localized(slug: string, locale: Locale = 'en'): LocalizedSlide {
  const own = PLACED.find((entry) => entry.slide.slug === slug);
  if (own === undefined) throw new Error(`No Slide "${slug}" in the Section.`);
  return localizeSlide(own, {
    episode: 'what-lies-below-the-waterline-of-sustainable-ai-skills',
    locale,
    placed: PLACED,
    referenceLabels: { ref: 'opens speaker note', marker: (title) => `Speaker note: ${title}` },
    header: 'shared',
  });
}

const sceneOf = (slug: string, locale: Locale = 'en') =>
  load(renderToStaticMarkup(createElement(Fragment, null, localized(slug, locale).content)));

/** A Slide as the page shows it: the shared Slide header above its Scene, as the Slide wrapper renders the two. */
function pageOf(slug: string, locale: Locale = 'en') {
  const { id, level, header, content } = localized(slug, locale);
  if (header === undefined) throw new Error(`Slide "${slug}" has no shared header.`);
  const heading = createElement(SlideHeader, { seed: id, level, ...header });
  return load(renderToStaticMarkup(createElement(Fragment, null, heading, content)));
}

/** The page Slides of the Section, the section slide left out. */
const PAGE_SLIDES = [
  'the-description-is-all-the-ai-sees',
  'name-the-moment-not-the-content',
  'more-skills-harder-choice',
];

describe('success cases', () => {
  it('lists Slides 11 to 13 after the section slide, in Spec order, titled by their Spec h3', () => {
    // ARRANGE
    const expected = [
      'The description',
      'The description is the trigger',
      'Name the trigger, not the content',
      'More skills, harder choice',
    ];
    // ACT
    const titles = PLACED.map(({ slide }) => localized(slide.slug).title);
    // ASSERT
    expect(titles).toEqual(expected);
  });

  it('speaks every Spec Voice script segment word for word, by its title, in order', () => {
    // ARRANGE
    const expected = [
      [
        {
          title: "The pilot's view",
          script:
            "Sit in the model's chair for a second. At the start of a task it has every skill's name and description in front of it, and none of the instructions behind them, like a pilot with the index open and every card closed. So unless you call the skill by name, the description is the trigger: it decides whether the model picks the skill on its own.",
        },
        {
          title: 'Two entries',
          script:
            'Take two descriptions for the same skill: "Samples", and "Take a sediment sample at a new site". A task comes in, because we have just reached a new site. Which one would you open?',
        },
        {
          title: 'Scent',
          script:
            'Researchers who study how people search call this information scent: the cue on a label that tells you whether it leads where you want to go. They found it in people, and I am lending it to the model. So your job is to make the description smell like the task it serves, because that scent is what pulls the trigger.',
        },
      ],
      [
        {
          title: 'Two labels',
          script:
            'Here are two descriptions for the same skill. The first names the content, "SOP-07: corer handling, steps 1 to 9", and the second says what the skill does and names the moment, "Takes a sediment core. Use when we reach a new site and need a sample from the seabed". One says only what is inside, the other names the trigger, when you need it, and that is your second step: write the description as the moment you\'d need it.',
        },
        {
          title: 'Your request',
          script:
            'Now it is the day of the dive and you type, "Grab some mud here before we move on." Nothing in "SOP-07, steps 1 to 9" tells the model when it is needed, but "a sample from the seabed" does, so only the moment description matches. Write it in the words you would actually say.',
        },
        {
          title: 'The closing line',
          script:
            'Last, the moment description can end on a second half: "Not for water samples or filming." It tells the model where the skill stops, so it does not open it for a job it cannot do. Treat that half as a choice and not a rule, and test whether it helps your skill.',
        },
      ],
      [
        {
          title: 'Near-twins',
          script:
            'Now see what happens when the skills pile up. "Sample", "Take sample", "Seabed sample v2": three skills whose descriptions sound alike, and a model that has to guess between them. It guesses, and you made it do so.',
        },
        {
          title: 'A short list on the wall',
          script:
            'The fix is cheap: a short list in your project instructions, AGENTS.md if you work with a coding agent, that says "In this project, use these three skills." Project instructions are always loaded, so the model no longer has to choose from a crowded index. On our ship, that is a list on the wall.',
        },
        {
          title: "Hick's law",
          script:
            "People have the same trouble: the more the options look alike, the longer it takes to choose, and psychologists call that Hick's law. I am lending it to the model, so hold it as a picture, not a measurement. What I want you to take from this Slide is the short list: it is short, and it is always loaded.",
        },
        {
          title: 'Name it as an action',
          script:
            'One more habit keeps the index tidy: name each skill as an action, in lowercase words joined by hyphens, like collect-sediment-sample. A name that says what the skill does tells the model, and you, what it is for before anyone reads the description, and when every name follows the same pattern, a near-twin stands out before it gets written.',
        },
      ],
    ];
    // ACT
    const scripts = PAGE_SLIDES.map((slug) =>
      localized(slug).voiceScript.map(({ title, script }) => ({ title, script })),
    );
    // ASSERT
    expect(scripts).toEqual(expected);
  });

  it('gives every Slide the Speaker notes of the Spec, by header, with their sources', () => {
    // ARRANGE
    const expected = [
      [
        { header: 'Description carries the whole burden', urls: [OPTIMIZING] },
        { header: 'Descriptions and information scent', urls: [PIROLLI] },
      ],
      [
        { header: 'A description says what and when', urls: [SPECIFICATION, ANTHROPIC] },
        { header: "Write the description in the user's words", urls: [OPTIMIZING] },
        { header: '"Not for" lines in a description: Google\'s advice alone', urls: [OPTIMIZING] },
        { header: 'The "not for" clause in Google\'s Day 3', urls: [GOOGLE] },
      ],
      [
        { header: 'Choosing among many skills: Hick and Hyman, a finding about people', urls: [HICK, HYMAN] },
        { header: "An AGENTS.md index beat skills: Vercel's test", urls: [VERCEL] },
        { header: 'Skills too broad or too narrow', urls: [BEST_PRACTICES] },
        { header: 'Name each skill as an action', urls: [ANTHROPIC] },
      ],
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
    // The caption's marker sits in the shared header, outside the Scene; the Scene holds the rest.
    const expected = [
      ['descriptions-and-information-scent', 'description-carries-the-whole-burden'],
      [
        'a-description-says-what-and-when',
        'not-for-lines-googles-advice-alone',
        'the-not-for-clause-in-googles-day-3',
        'a-description-says-what-and-when',
        'the-not-for-clause-in-googles-day-3',
        'not-for-lines-googles-advice-alone',
        'a-description-says-what-and-when',
      ],
      [
        'skills-too-broad-or-too-narrow',
        'choosing-among-many-skills-hick-and-hyman',
        'agents-md-index-beat-skills-vercels-test',
        'name-each-skill-as-an-action',
      ],
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

  it('follows each caption with the Context marker its picked Option shows there', () => {
    // ARRANGE
    const expected = [
      'description-carries-the-whole-burden',
      'write-the-description-in-the-users-words',
      'skills-too-broad-or-too-narrow',
    ];
    // ACT
    const actual = PAGE_SLIDES.map((slug) => {
      const $ = pageOf(slug);
      return $('[data-target="caption"] [data-context-ref]').attr('data-context-ref');
    });
    // ASSERT
    expect(actual).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('marks every note target on exactly one element of its Slide or its caption', () => {
    // ARRANGE
    const expected = [
      [
        { target: 'caption', marked: 1 },
        { target: 'scent', marked: 1 },
      ],
      [
        { target: 'moment', marked: 1 },
        { target: 'caption', marked: 1 },
        { target: 'not-for', marked: 1 },
        { target: 'hedge', marked: 1 },
      ],
      [
        { target: 'hick', marked: 1 },
        { target: 'vercel', marked: 1 },
        { target: 'caption', marked: 1 },
        { target: 'naming', marked: 1 },
      ],
    ];
    // ACT
    const actual = PAGE_SLIDES.map((slug) => {
      const $ = pageOf(slug);
      return localized(slug).notes.map(({ target }) => ({ target, marked: $(`[data-target="${target}"]`).length }));
    });
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('lights the clear entry alone in the index, never a vague one', () => {
    // ARRANGE
    const expected = { lit: ['collect-sediment-sample'], vague: ['samples', 'misc-procedures'] };
    // ACT
    const $ = sceneOf('the-description-is-all-the-ai-sees');
    const slugs = (selector: string) =>
      $(selector)
        .toArray()
        .map((entry) => $(entry).attr('data-index-row'));
    const actual = { lit: slugs('[data-index-row][data-focal]'), vague: slugs('[data-index-row][data-vague]') };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('matches the request to the moment description only, never to the content description', () => {
    // ARRANGE
    const expected = { matched: ['moment'], unmatched: ['content'] };
    // ACT
    const $ = sceneOf('name-the-moment-not-the-content');
    const kinds = (selector: string) =>
      $(selector)
        .toArray()
        .map((entry) => $(entry).attr('data-description'));
    const actual = {
      matched: kinds('[data-description][data-match]'),
      unmatched: kinds('[data-description]:not([data-match])'),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('fades the four near-twins of the index and leads the wall list to its one card', () => {
    // ARRANGE
    const expected = {
      twins: ['sample', 'take-sample', 'seabed-sample-v2', 'collect-mud-sample'],
      led: ['collect-sediment-sample'],
      wallLit: ['collect-sediment-sample'],
    };
    // ACT
    const $ = sceneOf('more-skills-harder-choice');
    const folders = (selector: string, attribute: string) =>
      $(selector)
        .toArray()
        .map((card) => $(card).attr(attribute));
    const actual = {
      twins: folders('[data-card][data-twin]', 'data-card'),
      led: folders('[data-card][data-led]', 'data-card'),
      wallLit: folders('[data-wall-item][data-lit]', 'data-wall-item'),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('keeps both views on every Slide, so the page switch has words for Chat app and Coding agent', () => {
    // ARRANGE
    const expected = [
      ['chat', 'coding'],
      ['chat', 'coding'],
      ['chat', 'coding'],
    ];
    // ACT
    const actual = PAGE_SLIDES.map((slug) => {
      const $ = sceneOf(slug);
      const views = $('[data-view]')
        .toArray()
        .map((element) => $(element).attr('data-view'));
      return [...new Set(views)].sort();
    });
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it("draws Vercel's pass rates on full tracks, the baseline 53 % first and the AGENTS.md line 79 %", () => {
    // ARRANGE
    const expected = ['53', '79'];
    // ACT
    const $ = sceneOf('more-skills-harder-choice');
    const actual = $('[data-pass-rate]')
      .toArray()
      .map((bar) => $(bar).attr('data-pass-rate'));
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('writes every German Slide with its own title, every note and Voice script segment, none left empty', () => {
    // ARRANGE
    const expected = [
      {
        title: 'Die Beschreibung ist der Auslöser',
        notes: ['Die Beschreibung trägt die ganze Last', 'Beschreibungen und Information Scent'],
        segments: ['Der Blick des Piloten', 'Zwei Einträge', 'Die Fährte'],
        empty: [],
      },
      {
        title: 'Nenne den Auslöser, nicht den Inhalt',
        notes: [
          'Eine Beschreibung sagt, was und wann',
          'Schreib die Beschreibung in den Worten der Nutzer',
          '„Nicht für“-Zeilen in einer Beschreibung: nur Googles Rat',
          'Der „Nicht für“-Satz in Googles Day 3',
        ],
        segments: ['Zwei Etiketten', 'Deine Bitte', 'Die Schlusszeile'],
        empty: [],
      },
      {
        title: 'Mehr Skills, schwerere Wahl',
        notes: [
          'Wahl unter vielen Skills: Hick und Hyman, ein Befund über Menschen',
          'Ein Index in AGENTS.md schlug Skills: Vercels Test',
          'Skills zu breit oder zu eng',
          'Benenne jeden Skill als Tätigkeit',
        ],
        segments: [
          'Fast gleiche Skills',
          'Eine kurze Liste an der Wand',
          "Das Hick'sche Gesetz",
          'Benenne ihn als Tätigkeit',
        ],
        empty: [],
      },
    ];
    // ACT
    const actual = PAGE_SLIDES.map((slug) => {
      const { title, notes, voiceScript } = localized(slug, 'de');
      return {
        title,
        notes: notes.map(({ header }) => header),
        segments: voiceScript.map(({ title: segment }) => segment),
        empty: [
          ...notes.filter(({ description }) => description === '').map(({ header }) => header),
          ...voiceScript.filter(({ script }) => script === '').map(({ title: segment }) => segment),
        ],
      };
    });
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('quotes each description card in the marks of its locale', () => {
    // ARRANGE
    const expected = {
      en: ['“Samples”', '“Take a sediment sample at a new site”'],
      de: ['„Proben“', '„Eine Sedimentprobe an einem neuen Ort nehmen“'],
    };
    // ACT
    const quotes = (locale: Locale) => {
      const $ = sceneOf('the-description-is-all-the-ai-sees', locale);
      return $('[data-description-card] p[data-view="chat"]')
        .toArray()
        .map((text) => $(text).text());
    };
    const actual = { en: quotes('en'), de: quotes('de') };
    // ASSERT
    expect(actual).toEqual(expected);
  });
});
