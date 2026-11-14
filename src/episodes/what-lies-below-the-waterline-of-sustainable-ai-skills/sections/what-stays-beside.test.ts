import { localizeSlide, type LocalizedSlide } from '@/episodes/components/slide-master/localized-slide';
import type { Slide } from '@/episodes/components/slide-master/slide';
import { placeSections } from '@/episodes/lib/episode.pure';
import type { Locale } from '@/shared/lib/locale.pure';
import { load } from 'cheerio';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { whatStaysBesideSection } from './what-stays-beside';

/*
 * Section 6 of "What lies below the waterline of sustainable AI skills", "What stays beside" (its h2 "What context
 * stays beside"), as the approved Spec gives it: Slides 17 to 19 in Spec order, each with the Spec's Voice script,
 * Speaker notes and sources, a Context marker wherever its picked Option's mock shows one, and the Scene facts the
 * Option draws. Read through the one interface the page reads a Slide by: localized on the shared Slide header.
 */

const BEST_PRACTICES = 'https://agentskills.io/skill-creation/best-practices';
const CLAUDE_SKILLS = 'https://code.claude.com/docs/en/skills';
const CODEX_SKILLS = 'https://learn.chatgpt.com/docs/build-skills';
const SKILLDEX = 'https://arxiv.org/abs/2604.16911';
const ZONED_GOVERNANCE = 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/guidance/sec-gov-phase2';
const SWE_SKILLS_BENCH = 'https://arxiv.org/abs/2603.15401';
const CONTEXT_ENGINEERING = 'https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents';
const POCOCK_SKILLS = 'https://github.com/mattpocock/skills';

const PLACED = placeSections<Slide>([whatStaysBesideSection]).flat();

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

/** The page Slides of the Section, the section slide left out. */
const PAGE_SLIDES = ['beside-the-skill', 'who-uses-it-and-where', 'how-grill-me-and-grill-with-docs-work'];

describe('success cases', () => {
  it('lists Slides 17 to 19 after the section slide, in Spec order, titled by their Spec h3', () => {
    // ARRANGE
    const expected = [
      'What context stays beside',
      'Beside the skill',
      'Who uses it, and where',
      'grill-with-docs keeps context beside the skill',
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
          title: 'The card points',
          script:
            'Here is the mistake from before, fixed. The skill no longer says 40 metres. Its step says "descend to the depth in today\'s dive plan", and that dive plan is a project file the skill reads when the step runs: site 4, 40 metres, site 7, 120 metres.',
        },
        {
          title: 'Same card, any site',
          script:
            'Replay site 7. It is the same skill with no edit, and this time the robot reaches the seabed at 120 metres. The procedure stayed put and the site details lived in the project file, which is your third step in miniature: decide where the project details live.',
        },
        {
          title: 'For developers',
          script:
            'In the coding-agent view the step names a project file, say CONTEXT.md, and the agent reads it when that step runs. For everyone else, it is any document in your project that the skill tells the model to read.',
        },
      ],
      [
        {
          title: 'Two questions',
          script:
            'Here is a decision tool, and it asks two questions. Who uses the skill, only you or others too? And where, in any project or in one in particular?',
        },
        {
          title: 'Four squares',
          script:
            'Four squares come out of that. Personal and project-specific: write the details straight in, it needs the least upkeep. Personal and general: keep the details beside, it is your own toolkit. Shared and project-specific: the details can live in its supporting files, and the project team owns it. Shared and general: the details sit beside, with an owner, a version and evals. So as a skill moves from your own notebook into the shared library, it loses its project details and gains an owner.',
        },
        {
          title: 'A rule of thumb',
          script:
            'This matrix is a rule of thumb, and the label is mine. It is how I think about it, so try it on your own skills and tell me where it breaks.',
        },
      ],
      [
        {
          title: 'The interview is the card',
          script:
            'Let me show you inside and beside together, on real files instead of the dive. This is grill-with-docs, a skill by Matt Pocock that I use, and it runs an interview, which is the procedure. It stays the same every time.',
        },
        {
          title: 'Follow the arrow',
          script:
            'While it runs, grill-with-docs writes files beside itself, a glossary and decision records, and the next run checks your words against them. The skill stays the same, and what it learned about your project waits beside it.',
        },
        {
          title: 'Skills can run skills',
          script:
            "One last thing: a skill can also run other skills: grill-with-docs runs one called grilling and another called domain-modeling. There is no settled name for that yet, and I'll leave it there.",
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
        {
          header: 'A skill teaches the class of problem and reads the instance',
          urls: [BEST_PRACTICES, CLAUDE_SKILLS],
        },
      ],
      [
        { header: 'Where a skill is stored encodes who gets it', urls: [CLAUDE_SKILLS, CODEX_SKILLS] },
        { header: 'The skill scope matrix is an inference', urls: [SKILLDEX, ZONED_GOVERNANCE] },
        { header: 'Evals matter once a skill is shared', urls: [SWE_SKILLS_BENCH] },
      ],
      [
        {
          header: 'Project context written beside the skill, read next run',
          urls: [CONTEXT_ENGINEERING, BEST_PRACTICES, POCOCK_SKILLS],
        },
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
      [
        'a-skill-teaches-the-class-of-problem',
        'a-skill-teaches-the-class-of-problem',
        'a-skill-teaches-the-class-of-problem',
      ],
      [
        'where-a-skill-is-stored',
        'evals-matter-once-a-skill-is-shared',
        'evals-matter-once-a-skill-is-shared',
        'the-skill-scope-matrix-is-an-inference',
        'where-a-skill-is-stored',
      ],
      ['project-context-written-beside-the-skill'],
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

  it('follows the caption of Beside the skill alone with a Context marker, as its picked Option shows', () => {
    // ARRANGE
    const expected = ['a-skill-teaches-the-class-of-problem', undefined, undefined];
    // ACT
    const actual = PAGE_SLIDES.map((slug) => PLACED.find(({ slide }) => slide.slug === slug)?.slide.captionNote);
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('reaches the seabed at 120 m at site 7, today, through the step that points to the project file', () => {
    // ARRANGE
    const expected = { focalStep: ['2'], today: ['site7'], seabed: '120', ghost: '40' };
    // ACT
    const $ = sceneOf('beside-the-skill');
    const actual = {
      focalStep: $('[data-step][data-focal]')
        .toArray()
        .map((step) => $(step).attr('data-step')),
      today: $('[data-site][data-today]')
        .toArray()
        .map((row) => $(row).attr('data-site')),
      seabed: $('[data-dive]').attr('data-seabed-m'),
      ghost: $('[data-dive]').attr('data-ghost-m'),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('steps care up from the notebook to the fleet manual, the shared, general square in focus', () => {
    // ARRANGE
    const expected = {
      squares: [
        { id: 'pp', care: '1' },
        { id: 'pg', care: '2' },
        { id: 'sp', care: '3' },
        { id: 'sg', care: '4' },
      ],
      focus: ['sg'],
    };
    // ACT
    const $ = sceneOf('who-uses-it-and-where');
    const actual = {
      squares: $('[data-square]')
        .toArray()
        .map((square) => ({ id: $(square).attr('data-square'), care: $(square).attr('data-care') })),
      focus: $('[data-square][data-focus]')
        .toArray()
        .map((square) => $(square).attr('data-square')),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('marks every note target on exactly one element of its Slide or its caption', () => {
    // ARRANGE
    const expected = [[1], [1, 1, 1], [1]];
    // ACT
    const counts = PAGE_SLIDES.map((slug) => {
      const $ = sceneOf(slug);
      return localized(slug).notes.map(({ target }) =>
        target === 'caption' ? 1 : $(`[data-target="${target}"]`).length,
      );
    });
    // ASSERT
    expect(counts).toEqual(expected);
  });

  it("adds the new term to Thursday's glossary only, never to Monday's", () => {
    // ARRANGE
    const expected = { monday: [], thursday: ['Core'] };
    // ACT
    const $ = sceneOf('how-grill-me-and-grill-with-docs-work');
    const added = (run: string) =>
      $(`[data-run="${run}"] [data-term][data-new] [data-view="chat"]`)
        .toArray()
        .map((term) => $(term).find('[data-term-name]').text());
    const actual = { monday: added('1'), thursday: added('2') };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('keeps project details out of the shared, general square, its details beside and owned', () => {
    // ARRANGE
    const expected = { scribbled: ['pp'], ownerTag: ['sg'] };
    // ACT
    const $ = sceneOf('who-uses-it-and-where');
    const squaresWith = (selector: string) =>
      $('[data-square]')
        .toArray()
        .filter((square) => $(square).find(selector).length > 0)
        .map((square) => $(square).attr('data-square'));
    const actual = { scribbled: squaresWith('[data-scribble]'), ownerTag: squaresWith('[data-owner-tag]') };
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

  it('shows each Context marker of Who uses it, and where only in the views its picked Option shows it', () => {
    // ARRANGE
    // "both" is a marker outside any view; the footer's "Where a skill is stored" marker is the Coding agent's alone.
    const expected = [
      { note: 'where-a-skill-is-stored', view: 'both' },
      { note: 'evals-matter-once-a-skill-is-shared', view: 'chat' },
      { note: 'evals-matter-once-a-skill-is-shared', view: 'coding' },
      { note: 'the-skill-scope-matrix-is-an-inference', view: 'both' },
      { note: 'where-a-skill-is-stored', view: 'coding' },
    ];
    // ACT
    const $ = sceneOf('who-uses-it-and-where');
    const actual = $('[data-context-ref]')
      .toArray()
      .map((marker) => ({
        note: $(marker).attr('data-context-ref'),
        view: $(marker).closest('[data-view]').attr('data-view') ?? 'both',
      }));
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('fills primary in the dive only on the seabed pill, as the focal point of Beside the skill gives it', () => {
    // ARRANGE
    const expected = ['seabed 120 m'];
    // ACT
    const $ = sceneOf('beside-the-skill');
    const actual = $('[data-dive] .bg-primary')
      .toArray()
      .map((element) => $(element).text());
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('writes the inline step of the personal, project-specific square through the Translation file', () => {
    // ARRANGE
    const expected = 'A step names the detail itself, say Descend to 40 m.; least upkeep.';
    // ACT
    const $ = sceneOf('who-uses-it-and-where');
    const actual = $('[data-square="pp"] p[data-view="coding"]').last().text();
    // ASSERT
    expect(actual).toBe(expected);
  });

  it('names the project file through the project folder variable in the Coding agent view', () => {
    // ARRANGE
    const expected = "2. Descend to the depth for today's site in ${CLAUDE_PROJECT_DIR}/CONTEXT.md.";
    // ACT
    const $ = sceneOf('beside-the-skill');
    const actual = $('[data-step="2"] [data-view="coding"]').text();
    // ASSERT
    expect(actual).toBe(expected);
  });

  it('writes every German Slide with notes and Voice script of the same shape, each title translated', () => {
    // ARRANGE
    const expected = [
      { title: 'Neben dem Skill', notes: 1, segments: 3 },
      { title: 'Wer ihn nutzt, und wo', notes: 3, segments: 3 },
      { title: 'grill-with-docs hält den Kontext neben dem Skill', notes: 1, segments: 3 },
    ];
    // ACT
    const actual = PAGE_SLIDES.map((slug) => ({
      title: localized(slug, 'de').title,
      notes: localized(slug, 'de').notes.filter(({ description }) => description.length > 0).length,
      segments: localized(slug, 'de').voiceScript.filter(({ script }) => script.length > 0).length,
    }));
    // ASSERT
    expect(actual).toEqual(expected);
  });
});
