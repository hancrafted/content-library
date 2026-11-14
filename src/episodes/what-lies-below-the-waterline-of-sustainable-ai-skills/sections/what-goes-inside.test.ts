import { localizeSlide } from '@/episodes/components/slide-master/localized-slide';
import type { Slide } from '@/episodes/components/slide-master/slide';
import { placeSections } from '@/episodes/lib/episode.pure';
import type { Locale } from '@/shared/lib/locale.pure';
import { load } from 'cheerio';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { whatGoesInsideSection } from './what-goes-inside';

/*
 * Section 5, "What context goes inside", as the approved Spec gives it: its section slide, then Slides 14 to 16 built
 * to the picked Options 14a, 15b and 16a, each titled, scripted and noted as the Spec writes it. Slide 14 is the
 * control room with one fact and its three homes; Slide 15 the two dives under one skill card; Slide 16 the procedure
 * card in its sleeve with a supporting file level with each step (design-ADR 0025: ZoneScene, Travel and the cast).
 */

const EPISODE = 'what-lies-below-the-waterline-of-sustainable-ai-skills';
const SLIDES = whatGoesInsideSection as readonly Slide[];
const PLACED = placeSections<Slide>([whatGoesInsideSection]).flat();
const WHERE = 'what-goes-where-is-information-architecture';
const COUPLING = 'one-skill-one-job';
const INSIDE = 'inside-the-skill';
const PAGE_SLIDES = [WHERE, COUPLING, INSIDE];

interface Messages {
  title: string;
  heading?: string;
  voiceScript: { segments: Record<string, { title: string; script: string }> };
  notes?: Record<string, { header: string }>;
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
    episode: EPISODE,
    locale,
    placed: PLACED,
    referenceLabels: { ref: 'opens speaker note', marker: (title) => `Speaker note: ${title}` },
    header: 'shared',
  });
  return load(renderToStaticMarkup(createElement(Fragment, null, localized.content)));
}

const MARKER = '[data-context-ref]';
/** The `primary` classes an element carries: the Options' one emphasis colour. */
const primaryOf = (element: ReturnType<ReturnType<typeof load>>) =>
  (element.attr('class') ?? '').split(/\s+/).filter((name) => name.endsWith('-primary'));
/** An element's words without its Context markers. */
const wordsOf = (element: ReturnType<ReturnType<typeof load>>) => {
  const copy = element.clone();
  copy.find(MARKER).remove();
  return copy.text().trim();
};
const textsOf = ($: ReturnType<typeof load>, selector: string) =>
  $(selector)
    .toArray()
    .map((element) => $(element).text());

describe('success cases', () => {
  it('places the three page Slides after the section slide, in Spec order, under their Spec titles', () => {
    // ARRANGE
    const expected = [
      'What context goes inside',
      'What context goes where',
      'A project detail couples a skill to one project',
      'Inside the skill',
    ];
    // ACT
    const actual = SLIDES.map((slide) => messagesOf(slide).title);
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('scripts each page Slide in the Spec’s Voice script segments', () => {
    // ARRANGE
    const expected = {
      [WHERE]: ['A home for each fact', 'Three costs', 'Three homes'],
      [COUPLING]: ['Scribbled in', 'Coupling'],
      [INSIDE]: ['Extras by step', 'The long step', 'Contents first'],
    };
    // ACT
    const actual = Object.fromEntries(
      PAGE_SLIDES.map((slug) => {
        const slide = slideOf(slug);
        return [slug, slide.segments.map((segment) => messagesOf(slide).voiceScript.segments[segment.slug]?.title)];
      }),
    );
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('keeps the Spec’s closing line verbatim in Slide 15’s first segment', () => {
    // ARRANGE
    const expected =
      'Take a sampling skill with one project detail written into it: "descend to 40 metres", true at site 4. At site 7 the seabed lies at 120, and the robot hangs uselessly at 40 while the model follows the skill perfectly. (pause) The skill was followed to the letter, and the dive still failed.';
    // ACT
    const actual = messagesOf(slideOf(COUPLING)).voiceScript.segments['scribbled-in']?.script;
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('notes each page Slide with the Spec’s Speaker notes and their sources', () => {
    // ARRANGE
    const expected = {
      [WHERE]: [
        {
          header: 'Information architecture, as Nielsen Norman Group defines it',
          sources: ['https://www.nngroup.com/articles/information-architecture-sitemaps/'],
        },
        {
          header: "Information architecture, in its authors' words",
          sources: [
            'https://www.oreilly.com/library/view/information-architecture-4th/9781491913529/part01.html',
            'https://www.oreilly.com/library/view/information-architecture-4th/9781491913529/ch02.html',
          ],
        },
        {
          header: 'Every line of a loaded skill is a recurring token cost',
          sources: ['https://code.claude.com/docs/en/skills', 'https://agentskills.io/skill-creation/best-practices'],
        },
      ],
      [COUPLING]: [
        { header: 'Coupling, as first written', sources: ['https://doi.org/10.1147/sj.132.0115'] },
        {
          header: 'Project details hard-coded into a skill can override the task',
          sources: ['https://arxiv.org/abs/2603.15401'],
        },
      ],
      [INSIDE]: [
        {
          header: 'Move detail out of SKILL.md, and say when to read it',
          sources: ['https://agentskills.io/specification', 'https://agentskills.io/skill-creation/best-practices'],
        },
        {
          header: 'Long reference files start with a contents list',
          sources: ['https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices'],
        },
        {
          header: 'References stay one level deep',
          sources: [
            'https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices',
            'https://agentskills.io/specification',
          ],
        },
        {
          header: 'Progressive disclosure, as Anthropic names it',
          sources: ['https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview'],
        },
      ],
    };
    // ACT
    const actual = Object.fromEntries(
      PAGE_SLIDES.map((slug) => {
        const slide = slideOf(slug);
        return [
          slug,
          slide.notes.map((note) => ({
            header: messagesOf(slide).notes?.[note.slug]?.header,
            sources: (note.sources ?? []).map((source) => source.url),
          })),
        ];
      }),
    );
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('draws Slide 14 as one fact with three homes: three pins, the note travelling to the dive plan, three cards', () => {
    // ARRANGE
    const expected = {
      pins: ['1', '2', '3'],
      travellingNote: ['Site 4 · 40 m'],
      homes: ['In the skill', 'In the project instructions', 'In a project file the skill reads'],
      rows: ['When loaded', 'Fits', 'When loaded', 'Fits', 'When loaded', 'Fits'],
      markers: [
        'information-architecture-as-nielsen-norman-group-defines-it',
        'every-line-of-a-loaded-skill-is-a-recurring-token-cost',
        'every-line-of-a-loaded-skill-is-a-recurring-token-cost',
      ],
    };
    // ACT
    const $ = sceneOf(WHERE);
    const actual = {
      pins: textsOf($, '[data-pin]'),
      travellingNote: textsOf($, '[data-travel] [data-depth-note]'),
      homes: textsOf($, '[data-home] [data-term]'),
      rows: textsOf($, '[data-home] [data-row-label]'),
      markers: $(MARKER)
        .toArray()
        .map((marker) => $(marker).attr('data-context-ref')),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('draws Slide 15 as two dives under one skill card, both robots descending together', () => {
    // ARRANGE
    const expected = {
      sites: ['Site 4', 'Site 7'],
      travellingRobots: ['happy', 'confused'],
      moods: ['happy', 'confused'],
      short: ['80 m short'],
      card: ['Coupling'],
      markers: [
        'project-details-hard-coded-into-a-skill-can-override-the-task',
        'project-details-hard-coded-into-a-skill-can-override-the-task',
        'coupling-as-first-written',
      ],
    };
    // ACT
    const $ = sceneOf(COUPLING);
    const actual = {
      sites: textsOf($, '[data-site]'),
      travellingRobots: $('[data-travel] [data-robot]')
        .toArray()
        .map((robot) => $(robot).attr('data-mood')),
      moods: $('[data-robot]')
        .toArray()
        .map((robot) => $(robot).attr('data-mood')),
      short: textsOf($, '[data-short]'),
      card: textsOf($, '[data-mistake] [data-term]'),
      markers: $(MARKER)
        .toArray()
        .map((marker) => $(marker).attr('data-context-ref')),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('draws Slide 16 as six steps, step 4 lit, each supporting file level with the step that uses it', () => {
    // ARRANGE
    const expected = {
      steps: ['1', '2', '3', '4', '5', '6'],
      focus: ['4'],
      files: [
        { step: '3', kind: 'Script' },
        { step: '4', kind: 'Reference file' },
        { step: '6', kind: 'Template' },
      ],
      contents: ['1 Corals', '2 Sponges', '3 Worms and tubes', '4 Crustaceans', '5 Unknown finds'],
      markers: [
        'progressive-disclosure-as-anthropic-names-it',
        'references-stay-one-level-deep',
        'long-reference-files-start-with-a-contents-list',
        'move-detail-out-of-skill-md-and-say-when-to-read-it',
        'long-reference-files-start-with-a-contents-list',
        'references-stay-one-level-deep',
      ],
    };
    // ACT
    const $ = sceneOf(INSIDE);
    const actual = {
      steps: $('[data-step]')
        .toArray()
        .map((step) => $(step).attr('data-step')),
      focus: $('[data-step][data-focus]')
        .toArray()
        .map((step) => $(step).attr('data-step')),
      files: $('[data-file]')
        .toArray()
        .map((file) => ({ step: $(file).attr('data-file'), kind: $(file).find('[data-kind]').text() })),
      contents: textsOf($, '[data-file] [data-contents] li > span:first-child'),
      markers: $(MARKER)
        .toArray()
        .map((marker) => $(marker).attr('data-context-ref')),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('marks Slide 14’s concept card with a primary rule, as the verdict line is', () => {
    // ARRANGE
    const expected = { callout: ['border-primary'], verdict: ['border-primary'] };
    // ACT
    const $ = sceneOf(WHERE);
    const actual = {
      callout: primaryOf($('aside[data-target="ia-callout"]')),
      verdict: primaryOf($('[data-verdict]')),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('fills Slide 15’s "80 m short" pill and its Coupling pill in primary', () => {
    // ARRANGE
    const expected = { short: 'tag-focal', coupling: ['bg-primary'] };
    // ACT
    const $ = sceneOf(COUPLING);
    const actual = {
      short: $('[data-short]').closest('g').find('rect').attr('data-tone'),
      coupling: primaryOf($('[data-mistake] [data-term]')),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('keeps Slide 15’s heading in the Coding agent view, with the benchmark example and all four steps of the skill', () => {
    // ARRANGE
    const expected = {
      heads: ['A project detail written into the skill'],
      coding:
        'A benchmark worked example: a template that hard-coded .github/workflows/ beat a task that required ci/.',
      snippet: ['1. Check arm and tubes.', '2. Descend to 40 m.', '3. Lower the arm.', '4. Identify the catch.'],
    };
    // ACT
    const $ = sceneOf(COUPLING);
    const actual = {
      heads: textsOf($, '[data-mistake] [data-mistake-head]'),
      coding: wordsOf($('[data-mistake] [data-view="coding"]')),
      snippet: $('[data-skill-card] [data-view="coding"] code').text().split('\n'),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('links Slide 16’s progressive-disclosure line to Slide 4, in each locale', () => {
    // ARRANGE
    const anchor = '#what-a-skill-is--three-levels-of-loading';
    const expected = [
      { text: 'See Slide 4', href: `/episodes/${EPISODE}${anchor}` },
      { text: 'Folie 4 ansehen', href: `/de/episodes/${EPISODE}${anchor}` },
    ];
    // ACT
    const actual = (['en', 'de'] as const).map((locale) => {
      const link = sceneOf(INSIDE, locale)('[data-target="disclosure"] a');
      return { text: link.text(), href: link.attr('href') };
    });
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('closes Slide 16 with the analogy in both views, the contents line in Chat app and the one-level line in Coding agent', () => {
    // ARRANGE
    const expected = {
      analogy: 'In the story: The card in its sleeve: each extra tied to the step that uses it.',
      chat: {
        text: 'When step 4 opens the species guide, its contents page alone tells the AI what else is inside.',
        marker: 'long-reference-files-start-with-a-contents-list',
      },
      coding: {
        text: 'Link every supporting file straight from SKILL.md, one level deep.',
        marker: 'references-stay-one-level-deep',
      },
      analogyMarkers: [],
      analogyViews: [],
    };
    // ACT
    const $ = sceneOf(INSIDE);
    const view = (name: string) => {
      const line = $(`[data-footer] [data-view="${name}"]`);
      return { text: wordsOf(line), marker: line.find(MARKER).attr('data-context-ref') };
    };
    const analogy = $('[data-analogy]');
    const actual = {
      analogy: analogy.text(),
      chat: view('chat'),
      coding: view('coding'),
      analogyMarkers: textsOf($, '[data-analogy] [data-context-ref]'),
      analogyViews: analogy
        .parents('[data-view]')
        .toArray()
        .map((parent) => $(parent).attr('data-view')),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('names the card SKILL.md in Slide 16’s Coding agent view and draws the lit file, its arrow and its pill in primary', () => {
    // ARRANGE
    const expected = {
      head: 'collect-sediment-sample/SKILL.md',
      guide: ['border-primary'],
      arrow: ['border-primary'],
      pill: ['bg-primary'],
      trails: 1,
      slotMark: ['4'],
    };
    // ACT
    const $ = sceneOf(INSIDE);
    const actual = {
      head: $('[data-card-head] [data-view="coding"]').text(),
      guide: primaryOf($('[data-file="4"]')),
      arrow: primaryOf($('[data-arrow][data-focal]')),
      pill: primaryOf($('[data-file="4"] [data-kind]')),
      trails: $('[data-trail]').length,
      slotMark: $('[data-slot-mark]')
        .toArray()
        .map((mark) => $(mark).closest('[data-step]').attr('data-step')),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('shows the Spec h3 on screen, with no separate heading, since no picked Option retitles its Slide', () => {
    // ARRANGE
    const expected = [undefined, undefined, undefined];
    // ACT
    const actual = PAGE_SLIDES.map((slug) => messagesOf(slideOf(slug)).heading);
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('lets no home win on Slide 14: no card is focal, the verdict line is the one focal mark', () => {
    // ARRANGE
    const expected = {
      focalHomes: [],
      verdicts: ['None is right in general. It depends on how many projects the skill will serve.'],
    };
    // ACT
    const $ = sceneOf(WHERE);
    const actual = {
      focalHomes: textsOf($, '[data-home][data-focal] [data-term]'),
      verdicts: textsOf($, '[data-verdict]'),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('keys every step and pointer by its role, never by its position (FE-002 §5.1), in both locales', () => {
    // ARRANGE
    const POSITIONAL = /^(s?\d+)$/;
    const expected: string[] = [];
    // ACT
    const keyed = (messages: Record<string, unknown>, path: string[]) =>
      Object.keys(
        path.reduce<Record<string, unknown>>((node, key) => (node[key] ?? {}) as Record<string, unknown>, messages),
      );
    const actual = PAGE_SLIDES.flatMap((slug) =>
      (['en', 'de'] as const).flatMap((locale) => {
        const messages = slideOf(slug).messages[locale] as unknown as Record<string, unknown>;
        return [['steps'], ['pointers'], ['card', 'steps'], ['art', 'card', 'steps']].flatMap((path) =>
          keyed(messages, path)
            .filter((key) => POSITIONAL.test(key))
            .map((key) => `${slug} ${locale} ${[...path, key].join('.')}`),
        );
      }),
    );
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('carries no view switch of its own on any Slide: the page’s top bar holds the one toggle', () => {
    // ARRANGE
    const expected = [[], [], []];
    // ACT
    const actual = PAGE_SLIDES.map((slug) => {
      const $ = sceneOf(slug);
      return $('[aria-pressed], input[type="radio"]')
        .toArray()
        .map((control) => $(control).prop('tagName'));
    });
    // ASSERT
    expect(actual).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('titles and scripts the German Slides segment by segment, as English does', () => {
    // ARRANGE
    const expected = [
      {
        title: 'Welcher Kontext wohin gehört',
        segments: ['Ein Zuhause für jede Tatsache', 'Drei Kosten', 'Drei Orte'],
      },
      {
        title: 'Ein Projektdetail bindet einen Skill an ein Projekt',
        segments: ['Hineingekritzelt', 'Kopplung'],
      },
      {
        title: 'Im Skill',
        segments: ['Extras nach Schritt', 'Der lange Schritt', 'Inhaltsverzeichnis zuerst'],
      },
    ];
    // ACT
    const actual = PAGE_SLIDES.map((slug) => {
      const slide = slideOf(slug);
      const messages = messagesOf(slide, 'de');
      return {
        title: messages.title,
        segments: slide.segments.map((segment) => messages.voiceScript.segments[segment.slug]?.title),
      };
    });
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('names the files in the Coding agent view: the three homes, the coupled step and the three pointers', () => {
    // ARRANGE
    const expected = {
      [WHERE]: ['collect-sediment-sample/SKILL.md', 'AGENTS.md or CLAUDE.md', 'CONTEXT.md'],
      [COUPLING]: ['2. Descend to 40 m.'],
      [INSIDE]: [
        'Run scripts/arm-preset.py.',
        'Read references/species-guide.md, starting with its contents.',
        'Fill in assets/label-template.md.',
      ],
    };
    // ACT
    const actual = {
      [WHERE]: textsOf(sceneOf(WHERE), '[data-view="coding"] [data-path]'),
      [COUPLING]: textsOf(sceneOf(COUPLING), '[data-view="coding"] [data-coupled-step]'),
      [INSIDE]: textsOf(sceneOf(INSIDE), '[data-view="coding"] [data-pointer]'),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });
});
