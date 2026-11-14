import { localizeSlide, type LocalizedSlide } from '@/episodes/components/slide-master/localized-slide';
import type { Slide } from '@/episodes/components/slide-master/slide';
import { SlideHeader } from '@/episodes/components/slide-master/slide-header';
import { placeSections } from '@/episodes/lib/episode.pure';
import type { Locale } from '@/shared/lib/locale.pure';
import { load } from 'cheerio';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { keepingItAliveSection } from './keeping-it-alive';

/*
 * Section 8 of "What lies below the waterline of sustainable AI skills", "Keeping it alive", as the approved Spec gives
 * it: Slides 23 to 26 in Spec order, each with the Spec's Voice script, Speaker notes and sources, a Context marker
 * wherever its picked Option's mock shows one, and the Scene facts the Option draws. Read through the one interface the
 * page reads a Slide by: localized on the shared Slide header.
 */

const CUNNINGHAM = 'https://c2.com/doc/oopsla92.html';
const LEHMAN = 'https://users.ece.utexas.edu/~perry/work/papers/feast1.pdf';
const HERRAIZ = 'https://doi.org/10.1145/2543581.2543595';
const GODFREY = 'https://plg2.cs.uwaterloo.ca/~migod/papers/2000/icsm00.pdf';
const ANTHROPIC_PROMPTING =
  'https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices';
const OPENAI = 'https://developers.openai.com/cookbook/examples/gpt4-1_prompting_guide';
const SQUIRE_HM = 'https://pmc.ncbi.nlm.nih.gov/articles/PMC2649674/';
const SQUIRE_SYSTEMS = 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4355270/';
const SWE_SKILLS = 'https://arxiv.org/abs/2603.15401';
const KCS = 'https://library.serviceinnovation.org/KCS/KCS_v6/KCS_v6_Practices_Guide/030/040/010/030';
const ENTERPRISE = 'https://platform.claude.com/docs/en/agents-and-tools/agent-skills/enterprise';
const SKILLDEX = 'https://arxiv.org/abs/2604.16911';

const PLACED = placeSections<Slide>([keepingItAliveSection]).flat();

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

/** The values of one attribute over every element a selector finds, in document order. */
function valuesOf(slug: string, selector: string, attribute: string) {
  const $ = sceneOf(slug);
  return $(selector)
    .toArray()
    .map((element) => $(element).attr(attribute));
}

/** The page Slides of the Section, the section slide left out. */
const PAGE_SLIDES = [
  'every-skill-is-a-loan',
  'the-model-changes-the-skill-doesn-t',
  'retire-skills',
  'the-whole-iceberg',
];

describe('success cases', () => {
  it('lists Slides 23 to 26 after the section slide, in Spec order, titled by their Spec h3', () => {
    // ARRANGE
    const expected = [
      'Keeping it alive',
      'Every skill is a loan',
      "The model changes, the skill doesn't",
      'Retire skills',
      'The whole iceberg',
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
          title: 'Quick to write',
          script: 'A skill takes five minutes to write. That is the loan: you get the speed now.',
        },
        {
          title: 'A running tab',
          script:
            "Then the statements arrive, one line at a time. The project details changed, a new tool arrived, and a description now overlaps another skill's. None of them is a disaster, and each is a small cost that piles up. Engineers call it technical debt, Ward Cunningham's phrase.",
        },
        {
          title: 'Owning thirty',
          script:
            'Writing thirty skills is easy. Owning thirty is the hard part, because the cost was never in writing the skill, it is in keeping it right, month after month.',
        },
      ],
      [
        {
          title: 'Not the only pilot',
          script:
            'There is one more thing that changes under your skill, and you do not control it: the model that reads it. Every AI model has the condition we started with, and each AI provider trains its own, the way each pilot school trains its own pilots. So the reader of your skill is never fixed.',
        },
        {
          title: 'Update and switch',
          script:
            'Two things can change the reader. A model update: your provider ships a new version, your skill keeps the same words, but an instruction like "descend slowly" now gives a different dive. A different model or agent: a colleague runs your skill in another app, and it reads the same words its own way. The skill did not change, the reader did, and engineers saw this long ago in software: what is in use has to keep changing, or it gets worse.',
        },
        {
          title: 'Hand over the verdict',
          script:
            'So here is my question to you: which of your skills would you re-check after the next model update? If you own one, would you trust it to behave the same way tomorrow?',
        },
      ],
      [
        {
          title: 'Read the log',
          script:
            'Last job: retire skills. Put your list of skills next to what your work actually used this season, the dive log on our ship, and see which skills no task ever opened.',
        },
        {
          title: 'The archive box',
          script:
            'Those skills go into an archive, each with the date it was retired, so the decision is written down and nobody wonders later where a skill went.',
        },
        {
          title: 'Short index again',
          script:
            'And the index left behind is short again, with the one you need easy to find. Remember the description buried in the middle of a stuffed manual a few Slides ago? It is back in view, and the model can pick it.',
        },
      ],
      [
        {
          title: 'Three steps',
          script:
            'Let me bring the three steps up from the seabed. One: pick a task you have explained three times, and turn a good run of it into a skill. Two: write its description as the moment you would need it. Three: before you share it, decide where the project details live, and give it an owner.',
        },
        {
          title: 'The honest caveat',
          script:
            'I want to be honest about the deep end. Governance, review and retirement are the part I am least sure about, and I am still learning there too. If you find something that works, tell me.',
        },
        {
          title: 'Your first card',
          script:
            'We are back on deck, with a short index. If you want a low-key start, take the task you explained last week and turn its best run into your first skill. Thank you.',
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
      [{ header: "Skill upkeep as technical debt: Cunningham's words", urls: [CUNNINGHAM] }],
      [
        {
          header: "Skills in a changing world: Lehman's first two laws, and their limits",
          urls: [LEHMAN, HERRAIZ, GODFREY],
        },
        { header: 'Each model reads the same instructions differently', urls: [ANTHROPIC_PROMPTING, OPENAI] },
        {
          header: "The model's memory and patient H.M.: an analogy that breaks at the skill",
          urls: [SQUIRE_HM, SQUIRE_SYSTEMS],
        },
        { header: 'The agent changes the skill too, even on the same model', urls: [SWE_SKILLS] },
      ],
      [{ header: 'Retire a skill: archive over delete', urls: [KCS, ENTERPRISE] }],
      [{ header: 'Skill governance: what is settled, and what is not', urls: [ENTERPRISE, SKILLDEX] }],
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
      ['skill-upkeep-as-technical-debt'],
      [
        'the-agent-changes-the-skill-too',
        'lehmans-laws-and-their-limits',
        'each-model-reads-instructions-differently',
        'model-memory-and-patient-hm',
      ],
      ['retire-a-skill-archive-over-delete', 'retire-a-skill-archive-over-delete'],
      ['skill-governance-settled-and-not', 'skill-governance-settled-and-not'],
    ];
    // ACT
    const markers = PAGE_SLIDES.map((slug) => valuesOf(slug, '[data-context-ref]', 'data-context-ref'));
    // ASSERT
    expect(markers).toEqual(expected);
  });

  it('follows the caption with a Context marker only where the picked Option shows one there', () => {
    // ARRANGE
    const expected = [undefined, 'each-model-reads-instructions-differently', undefined, undefined];
    // ACT
    const actual = PAGE_SLIDES.map((slug) => {
      const $ = pageOf(slug);
      return $('[data-target="caption"] [data-context-ref]').attr('data-context-ref');
    });
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('runs the loan statement from the skill to the overlap, one block in the stack per fix and the next unpaid', () => {
    // ARRANGE
    const expected = {
      entries: ['written', 'sites', 'arm', 'overlap'],
      focal: ['overlap'],
      blocks: ['sites', 'arm', 'overlap', 'next'],
      unpaid: ['next'],
    };
    // ACT
    const slug = 'every-skill-is-a-loan';
    const actual = {
      entries: valuesOf(slug, '[data-entry]', 'data-entry'),
      focal: valuesOf(slug, '[data-entry][data-focal]', 'data-entry'),
      blocks: valuesOf(slug, '[data-block]', 'data-block'),
      unpaid: valuesOf(slug, '[data-block][data-unpaid]', 'data-block'),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('marks every note target on exactly one element of its Slide or its caption', () => {
    // ARRANGE
    const expected = [
      [{ target: 'debt', marked: 1 }],
      [
        { target: 'lehman', marked: 1 },
        { target: 'caption', marked: 1 },
        { target: 'analogy-only', marked: 1 },
        { target: 'switch', marked: 1 },
      ],
      [{ target: 'archive', marked: 1 }],
      [{ target: 'governance', marked: 1 }],
    ];
    // ACT
    const actual = PAGE_SLIDES.map((slug) => {
      const $ = pageOf(slug);
      return localized(slug).notes.map(({ target }) => ({ target, marked: $(`[data-target="${target}"]`).length }));
    });
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('sends the same card into two dives that end apart: one stops short, one goes into the silt', () => {
    // ARRANGE
    const expected = { outcomes: ['short', 'silt'], readers: ['same-pilot', 'other-school'] };
    // ACT
    const slug = 'the-model-changes-the-skill-doesn-t';
    const actual = {
      outcomes: valuesOf(slug, '[data-dive]', 'data-dive'),
      readers: valuesOf(slug, '[data-dive]', 'data-reader'),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('greys out only the unused skills, keeps the used seven and lights the one you need alone', () => {
    // ARRANGE
    const expected = {
      unused: [
        'sample-old',
        'take-sample-v2',
        'sediment-quick',
        'sample-like-ana',
        'sample-but-faster',
        'clean-arm-maybe',
        'collect-sediment-sample-copy',
        'log-depth-draft',
        'sample-v3',
        'label-cores-alt',
      ],
      kept: [
        'rinse-camera-dome',
        'name-photo-folders',
        'collect-sediment-sample',
        'tuesday-weather-note',
        'crew-coffee-order',
        'check-winch-again',
        'dive-log-short',
      ],
      needed: ['collect-sediment-sample'],
    };
    // ACT
    const slug = 'retire-skills';
    const actual = {
      unused: valuesOf(slug, '[data-before-line][data-unused]', 'data-before-line'),
      kept: valuesOf(slug, '[data-after-line]', 'data-after-line'),
      needed: valuesOf(slug, '[data-after-line][data-needed]', 'data-after-line'),
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
      ['chat', 'coding'],
    ];
    // ACT
    const actual = PAGE_SLIDES.map((slug) => [...new Set(valuesOf(slug, '[data-view]', 'data-view'))].sort());
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('writes a takeaway at every depth, Surface to Abyss, the three steps numbered at Sunlit and Midnight', () => {
    // ARRANGE
    const expected = {
      zones: ['surface', 'sunlit', 'twilight', 'midnight', 'abyss'],
      steps: ['sunlit', 'sunlit', 'midnight'],
      chips: ['primary', 'primary', 'inverse'],
      cards: ['third-time', 'the-moment', 'before-sharing'],
      index: ['collect-sediment-sample', 'grilling', 'domain-modeling'],
    };
    // ACT
    const slug = 'the-whole-iceberg';
    const actual = {
      zones: valuesOf(slug, '[data-takeaway]', 'data-takeaway'),
      steps: valuesOf(slug, '[data-step-marker]', 'data-step-marker'),
      chips: valuesOf(slug, '[data-step-marker]', 'data-chip'),
      cards: valuesOf(slug, '[data-step]', 'data-step'),
      index: valuesOf(slug, '[data-index-entry]', 'data-index-entry'),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('draws the whole iceberg as one picture, the robot rising on its cable up a trail with a node at every zone', () => {
    // ARRANGE
    const expected = {
      pictures: 1,
      water: ['surface', 'sunlit', 'twilight', 'midnight', 'abyss'],
      trail: 1,
      nodes: ['surface', 'sunlit', 'twilight', 'midnight', 'abyss'],
      rising: { robot: 1, cable: 1, ship: 0 },
    };
    // ACT
    const $ = sceneOf('the-whole-iceberg');
    const actual = {
      pictures: $('svg[role="img"]').length,
      water: $('[data-depth-band]')
        .toArray()
        .map((band) => $(band).attr('data-depth-band')),
      trail: $('[data-rise-trail]').length,
      nodes: $('[data-trail-node]')
        .toArray()
        .map((node) => $(node).attr('data-trail-node')),
      rising: {
        robot: $('[data-travel] [data-robot]').length,
        cable: $('[data-cable]').length,
        ship: $('[data-travel] [data-ship]').length,
      },
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('writes every German Slide with its own title, every note and Voice script segment, none left empty', () => {
    // ARRANGE
    const expected = [
      {
        title: 'Jeder Skill ist ein Kredit',
        notes: ['Skill-Pflege als technische Schuld: Cunninghams Worte'],
        segments: ['Schnell geschrieben', 'Eine laufende Rechnung', 'Dreißig besitzen'],
        empty: [],
      },
      {
        title: 'Das Modell ändert sich, der Skill nicht',
        notes: [
          'Skills in einer Welt, die sich ändert: Lehmans erste zwei Gesetze und ihre Grenzen',
          'Jedes Modell liest dieselben Anweisungen anders',
          'Das Gedächtnis des Modells und Patient H.M.: eine Analogie, die beim Skill bricht',
          'Auch der Agent verändert den Skill, selbst beim selben Modell',
        ],
        segments: ['Nicht der einzige Pilot', 'Update und Wechsel', 'Das Urteil übergeben'],
        empty: [],
      },
      {
        title: 'Skills ausmustern',
        notes: ['Einen Skill ausmustern: archivieren statt löschen'],
        segments: ['Das Logbuch lesen', 'Die Archivkiste', 'Wieder ein kurzer Index'],
        empty: [],
      },
      {
        title: 'Der ganze Eisberg',
        notes: ['Skill-Governance: was geklärt ist und was nicht'],
        segments: ['Drei Schritte', 'Der ehrliche Vorbehalt', 'Deine erste Karte'],
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
});
