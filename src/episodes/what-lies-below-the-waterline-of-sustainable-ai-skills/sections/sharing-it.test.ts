import { localizeSlide, type LocalizedSlide } from '@/episodes/components/slide-master/localized-slide';
import type { Slide } from '@/episodes/components/slide-master/slide';
import { SlideHeader } from '@/episodes/components/slide-master/slide-header';
import { placeSections } from '@/episodes/lib/episode.pure';
import type { Locale } from '@/shared/lib/locale.pure';
import { load } from 'cheerio';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { sharingItSection } from './sharing-it';

/*
 * Section 7 of "What lies below the waterline of sustainable AI skills", "Sharing it", as the approved Spec gives it:
 * Slides 20 to 22 in Spec order, each with the Spec's Voice script, Speaker notes and sources, a Context marker
 * wherever its picked Option's mock shows one, and the Scene facts the Option draws. Read through the one interface the
 * page reads a Slide by: localized on the shared Slide header.
 */

const ENTERPRISE = 'https://platform.claude.com/docs/en/agents-and-tools/agent-skills/enterprise';
const KCS = 'https://library.serviceinnovation.org/KCS/KCS_v6/KCS_v6_Practices_Guide/030/040/010/030';
const SPECIFICATION = 'https://agentskills.io/specification';
const PROVISION = 'https://support.claude.com/en/articles/13119606-provision-and-manage-skills-for-your-organization';
const CLAUDE_CODE_SKILLS = 'https://code.claude.com/docs/en/skills';
const SWE_SKILLS_BENCH = 'https://arxiv.org/abs/2603.15401';
const SKILLSBENCH = 'https://arxiv.org/abs/2602.12670';
const VERCEL = 'https://vercel.com/blog/agents-md-outperforms-skills-in-our-agent-evals';
const OPTIMIZING = 'https://agentskills.io/skill-creation/optimizing-descriptions';
const BEST_PRACTICES = 'https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices';
const GOOGLE = 'https://www.kaggle.com/whitepaper-agent-skills';

const PLACED = placeSections<Slide>([sharingItSection]).flat();

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

/** The Slide as the page renders it: the shared Slide header, its caption and caption marker, above the Scene. */
function slideOf(slug: string) {
  const { header, content } = localized(slug);
  if (header === undefined) throw new Error(`Slide "${slug}" has no shared header.`);
  const heading = createElement(SlideHeader, { seed: slug, level: 'h3', entrance: 'none', ...header });
  return load(renderToStaticMarkup(createElement(Fragment, null, heading, content)));
}

/** The page Slides of the Section, the section slide left out. */
const PAGE_SLIDES = [
  'shared-skills-are-knowledge-articles',
  'who-owns-the-shared-skill-library',
  'does-the-skill-make-things-better',
];

describe('success cases', () => {
  it('lists the page Slides after the section slide, in Spec order, titled by their Spec h3', () => {
    // ARRANGE
    const expected = [
      'Sharing it',
      'Shared skills are knowledge articles',
      'Who owns the shared skill library',
      'Does the skill make things better?',
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
          title: 'Your notebook',
          script:
            'A personal skill has no header at all, like a card in your own notebook. That is fine while it is only yours, because you know who wrote it, when you last used it, and who fixes it when it breaks.',
        },
        {
          title: 'Into the fleet manual',
          script:
            "Once you share it into your team's skill library, the fleet manual on our ship, it needs what any company knowledge article has: an owner, a version, and a date for its next review. It is the same skill with a control block on top, and your personal skills can skip this until you share them.",
        },
        {
          title: 'Why',
          script:
            "Why bother? Because once it is shared, one author's edit changes what the model does for everyone who runs it, and nobody knows whom to ask when it goes wrong. That is your third step: before you share a skill, decide where the project details live, and give it an owner.",
        },
      ],
      [
        {
          title: 'Back to the square',
          script:
            'Come back to the matrix, to the shared, general square. That is the kind of skill the most people rely on, so it is where care matters most.',
        },
        {
          title: 'What the front page needs',
          script:
            'A shared library needs rules beyond the owner and the version: who may add a skill, which tier it sits in and so whom it reaches, what it costs to load, which models and agents it works with, and when it retires. Each is a question somebody has to answer before the skill goes in.',
        },
        {
          title: 'The dark corner',
          script:
            "And then there are the questions nobody has settled yet. I want to be plain with you: I do not have the answers there, and I don't think many organisations do yet. If you have worked it out in yours, I would like to hear how.",
        },
      ],
      [
        {
          title: 'Same task twice',
          script:
            "How do you know a skill helps? Run the same task twice, once without the skill and once with it, and compare the results, like two test dives in shallow water. Don't trust your feeling about it, because feeling useful and being useful are not the same thing.",
        },
        {
          title: 'The callout',
          script:
            '(pause) And this test matters more than it sounds, because a skill is not automatically a gain. A bad skill can leave the model worse off than no skill at all, which is the whole reason the comparison exists.',
        },
        {
          title: 'Test the label',
          script:
            'Test the description too. Take a few requests that should trigger the skill and a few that should not, and include near-misses, the ones that sound like the skill but need something else. Those show you whether the model reaches for it at the right moment.',
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
        { header: 'A skill registry entry', urls: [ENTERPRISE] },
        { header: 'A skill review date is an adaptation', urls: [KCS] },
        { header: 'The Agent Skills format has no owner field', urls: [SPECIFICATION, ENTERPRISE] },
      ],
      [
        { header: 'Shared skills are tiered by audience', urls: [PROVISION] },
        { header: 'Who adds, reviews and removes shared skills', urls: [PROVISION, ENTERPRISE] },
        { header: 'Token cost and model fit are per-skill facts', urls: [CLAUDE_CODE_SKILLS, SWE_SKILLS_BENCH] },
        { header: 'Skill governance "still being worked out" is a judgement', urls: [ENTERPRISE] },
      ],
      [
        { header: 'Skills that score below no skill: SkillsBench, not Vercel', urls: [SKILLSBENCH, VERCEL] },
        { header: 'Bad skills can hurt, many do nothing', urls: [SWE_SKILLS_BENCH, SKILLSBENCH] },
        { header: "Test the skill's description too", urls: [OPTIMIZING, BEST_PRACTICES] },
        { header: "Trigger tests in Google's Day 3: two sizes", urls: [GOOGLE] },
        { header: "Skill evals in Google's Day 3: one figure misread", urls: [GOOGLE, VERCEL] },
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
    const expected = [
      [
        'a-skill-registry-entry',
        'a-skill-review-date-is-an-adaptation',
        'the-agent-skills-format-has-no-owner-field',
        'the-agent-skills-format-has-no-owner-field',
      ],
      [
        'who-adds-reviews-and-removes-shared-skills',
        'shared-skills-are-tiered-by-audience',
        'token-cost-and-model-fit-are-per-skill-facts',
        'token-cost-and-model-fit-are-per-skill-facts',
        'who-adds-reviews-and-removes-shared-skills',
        'who-adds-reviews-and-removes-shared-skills',
        'skill-governance-still-being-worked-out-is-a-judgement',
        'shared-skills-are-tiered-by-audience',
      ],
      [
        'test-the-skills-description-too',
        'trigger-tests-in-googles-day-3-two-sizes',
        'skills-that-score-below-no-skill-skillsbench-not-vercel',
        'bad-skills-can-hurt-many-do-nothing',
        'skill-evals-in-googles-day-3-one-figure-misread',
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

  it('follows the caption with the Context marker its picked Option shows there, and only there', () => {
    // ARRANGE
    const expected = [[], ['skill-governance-still-being-worked-out-is-a-judgement'], []];
    // ACT
    const actual = PAGE_SLIDES.map((slug) => {
      const $ = slideOf(slug);
      return $('[data-target="caption"] [data-context-ref]')
        .toArray()
        .map((marker) => $(marker).attr('data-context-ref'));
    });
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it("lists the front page's five questions in the Voice script's order, each led by its AI term", () => {
    // ARRANGE
    const expected = [
      'Who may add it',
      'Whom it reaches (its tier)',
      'What it costs to load',
      'Which models and agents it works with',
      'When it retires',
    ];
    // ACT
    const $ = sceneOf('who-owns-the-shared-skill-library');
    const actual = $('[data-front-row] [data-term]')
      .toArray()
      .map((term) => $(term).text());
    // ASSERT
    expect(actual).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('rings the shared, general square alone on the matrix, never a neighbour', () => {
    // ARRANGE
    const expected = { focal: ['shared-general'], dimmed: ['personal-project', 'personal-general', 'shared-project'] };
    // ACT
    const $ = sceneOf('who-owns-the-shared-skill-library');
    const squares = (selector: string) =>
      $(selector)
        .toArray()
        .map((square) => $(square).attr('data-square'));
    const actual = { focal: squares('[data-square][data-focal]'), dimmed: squares('[data-square]:not([data-focal])') };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('marks every note target on exactly one element of its Slide or its caption', () => {
    // ARRANGE
    const expected = [
      [1, 1, 1],
      [1, 1, 1, 1],
      [1, 1, 1, 1, 1],
    ];
    // ACT
    const counts = PAGE_SLIDES.map((slug) => {
      const $ = slideOf(slug);
      return localized(slug).notes.map(({ target }) => $(`[data-target="${target}"]`).length);
    });
    // ASSERT
    expect(counts).toEqual(expected);
  });

  it('stamps the control block on the shared copy alone, never on the personal notebook', () => {
    // ARRANGE
    const expected = { stamped: ['shared'], bare: ['personal'] };
    // ACT
    const $ = sceneOf('shared-skills-are-knowledge-articles');
    const copies = (selector: string) =>
      $(selector)
        .toArray()
        .map((copy) => $(copy).attr('data-copy'));
    const actual = {
      stamped: copies('[data-copy]:has([data-control-block])'),
      bare: copies('[data-copy]:not(:has([data-control-block]))'),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });
  it('fails the with-skill run on core length alone, the one check its procedure has no step for', () => {
    // ARRANGE
    const expected = {
      without: ['Held 2\u00a0m above the seabed', 'Camera checked for loose sediment'],
      with: ['Core over 30\u00a0cm'],
    };
    // ACT
    const $ = sceneOf('does-the-skill-make-things-better');
    const misses = (run: string) =>
      $(`[data-run="${run}"] [data-check][data-pass="false"]`)
        .toArray()
        .map((check) => $(check).text());
    const actual = { without: misses('without'), with: misses('with') };
    // ASSERT
    expect(actual).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('scores the two runs of the same task, without the skill first, as an illustration of your own test', () => {
    // ARRANGE
    const expected = ['2 / 4', '3 / 4'];
    // ACT
    const $ = sceneOf('does-the-skill-make-things-better');
    const actual = $('[data-run] [data-score]')
      .toArray()
      .map((score) => $(score).text());
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('tests the description with a few requests each way, one of them a near-miss', () => {
    // ARRANGE
    const expected = { should: 3, shouldNot: 3, nearMiss: ['Sample the water column here.'] };
    // ACT
    const $ = sceneOf('does-the-skill-make-things-better');
    const actual = {
      should: $('[data-request="should"]').length,
      shouldNot: $('[data-request="should-not"]').length,
      nearMiss: $('[data-request][data-near-miss] [data-request-text]')
        .toArray()
        .map((request) => $(request).text()),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('reaches three AIs from the fleet manual, every one running version 1.3', () => {
    // ARRANGE
    const expected = ['1.3', '1.3', '1.3'];
    // ACT
    const $ = sceneOf('shared-skills-are-knowledge-articles');
    const actual = $('[data-reach]')
      .toArray()
      .map((reader) => $(reader).attr('data-version'));
    // ASSERT
    expect(actual).toEqual(expected);
  });

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
        .map((view) => $(view).attr('data-view'));
      return [...new Set(views)].sort();
    });
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('quotes the task and every request in the marks of the reading locale', () => {
    // ARRANGE
    const expected = {
      en: { task: '“Take a sediment sample at a new site.”', request: '“Take a sediment sample at Site 7.”' },
      de: {
        task: '„Nimm an einem neuen Ort eine Sedimentprobe.“',
        request: '„Nimm eine Sedimentprobe an Ort 7.“',
      },
    };
    // ACT
    const quoted = (locale: Locale) => {
      const $ = sceneOf('does-the-skill-make-things-better', locale);
      return {
        task: $('[data-task] [data-view="chat"]').text(),
        request: $('[data-request="should"]').first().find('[data-quote]').text(),
      };
    };
    const actual = { en: quoted('en'), de: quoted('de') };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('writes every German Slide with notes and Voice script of the same shape, each title translated', () => {
    // ARRANGE
    const expected = [
      { title: 'Geteilte Skills sind Wissensartikel', notes: 3, segments: 3, blankNotes: [], blankSegments: [] },
      { title: 'Wem die geteilte Skill-Bibliothek gehört', notes: 4, segments: 3, blankNotes: [], blankSegments: [] },
      { title: 'Macht der Skill es besser?', notes: 5, segments: 3, blankNotes: [], blankSegments: [] },
    ];
    // ACT
    const actual = PAGE_SLIDES.map((slug) => {
      const { title, notes, voiceScript } = localized(slug, 'de');
      return {
        title,
        notes: notes.length,
        segments: voiceScript.length,
        blankNotes: notes.filter(({ description }) => description.trim() === '').map(({ header }) => header),
        blankSegments: voiceScript.filter(({ script }) => script.trim() === '').map(({ title: segment }) => segment),
      };
    });
    // ASSERT
    expect(actual).toEqual(expected);
  });
});
