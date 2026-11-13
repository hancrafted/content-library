import { localizeSlide, type LocalizedSlide } from '@/episodes/components/slide-master/localized-slide';
import type { Slide } from '@/episodes/components/slide-master/slide';
import { placeSections } from '@/episodes/lib/episode.pure';
import type { Locale } from '@/shared/lib/locale.pure';
import { load } from 'cheerio';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { whatLiesBelowTheWaterlineOfSustainableAiSkills } from '../episode';
import { whatASkillIsSection } from './what-a-skill-is';

/*
 * The Section "What a skill is" as the approved Spec gives it: its section slide, then five page Slides in Spec order,
 * each titled by its Spec h3, scripted segment by segment and annotated with the Spec's Speaker notes and sources.
 * Each Scene is composed from ZoneScene and the cast (design-ADR-0025) and carries both views' words.
 */

const EPISODE = 'what-lies-below-the-waterline-of-sustainable-ai-skills';
const PLACED = placeSections<Slide>(whatLiesBelowTheWaterlineOfSustainableAiSkills.sections).flat();
const PAGE_SLUGS = [
  'a-skill-is-a-written-procedure',
  'three-levels-of-loading',
  'skills-are-dynamic-context',
  'instructions-skills-and-connectors',
  'two-ways-to-call-a-skill',
];

function localized(slug: string, locale: Locale = 'en'): LocalizedSlide {
  const own = PLACED.find((entry) => entry.slide.slug === slug);
  if (own === undefined) throw new Error(`No Slide "${slug}".`);
  return localizeSlide(own, {
    episode: EPISODE,
    locale,
    placed: PLACED,
    referenceLabels: { ref: 'opens speaker note', marker: (title) => `Speaker note: ${title}` },
    header: 'shared',
  });
}

const sceneOf = (slug: string, locale: Locale = 'en') =>
  load(renderToStaticMarkup(createElement(Fragment, null, localized(slug, locale).content)));

describe('success cases', () => {
  it('lists the section slide, then the five page Slides in Spec order', () => {
    // ARRANGE
    const expected = ['what-a-skill-is', ...PAGE_SLUGS];
    // ACT
    const actual = whatASkillIsSection.map((slide) => slide.slug);
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('titles each page Slide with its Spec h3, the table of contents entry', () => {
    // ARRANGE
    const expected = [
      'A skill is a folder of instructions',
      'How AI discovers and reads a skill',
      'Skills are static and dynamic context',
      'Instructions, skills and connectors',
      'Two ways to call a skill',
    ];
    // ACT
    const actual = PAGE_SLUGS.map((slug) => localized(slug).title);
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('scripts each page Slide in the Spec segments, titled as the Spec writes them', () => {
    // ARRANGE
    const expected = [
      ['Name and use-when', 'Steps in the body', 'For developers'],
      ['The concept', 'Step one', 'Step two', 'Step three'],
      ['Back to the window', 'The standing part', 'Filling as you dive'],
      ['Four things in the room', 'Read the tags', 'Your words may differ'],
      ['By name', 'By description', 'Unused is real'],
    ];
    // ACT
    const actual = PAGE_SLUGS.map((slug) => localized(slug).voiceScript.map((segment) => segment.title));
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('keeps a Voice script segment of the first Slide verbatim from the Spec', () => {
    // ARRANGE
    const expected =
      "Then come the instructions, the procedure itself as numbered steps, in the body of the card. Beside that file a skill can carry optional supporting files that its steps reach for, like a species guide, a label template or an arm preset tucked into the card's sleeve. So a skill is a procedure, plus the material that procedure needs.";
    // ACT
    const actual = localized('a-skill-is-a-written-procedure').voiceScript[1]?.script;
    // ASSERT
    expect(actual).toBe(expected);
  });

  it('annotates each page Slide with the Spec Speaker notes, in Spec order', () => {
    // ARRANGE
    const expected = [
      [
        'What a skill is made of',
        'Names differ by app',
        'The description is the routing line',
        "Anthropic's definition of a skill",
      ],
      [
        'Three levels, stated by the standard',
        'Other apps load in stages too',
        'Scripts: documented for Claude only',
        'What the skill index costs',
        'Progressive disclosure, as Anthropic names it',
        'Progressive disclosure, as Nielsen Norman Group defines it',
      ],
      [
        'Static and dynamic, as Google defines them',
        'Why static and dynamic context are kept apart',
        'Static instructions are a rule of thumb',
      ],
      [
        'Instructions are always loaded, skills are not',
        'Names in chat apps',
        'Connectors reach, skills know how',
        'Skill vs. AGENTS.md, as Google puts it',
      ],
      [
        'Calling a skill by name differs by app',
        'The model picks a skill by its description',
        'Skills left unused: what the 56% measures',
        "Unused skills in Google's Day 3: two misreadings of Vercel",
      ],
    ];
    // ACT
    const actual = PAGE_SLUGS.map((slug) => localized(slug).notes.map((note) => note.header));
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('places a Context marker for every Speaker note of every page Slide, in its Scene or beside its caption', () => {
    // ARRANGE
    const expected = [4, 6, 3, 4, 4];
    // ACT
    const actual = PAGE_SLUGS.map((slug) => {
      const $ = sceneOf(slug);
      const own = localized(slug);
      const named = new Set([
        ...$('[data-context-ref]')
          .toArray()
          .map((marker) => $(marker).attr('data-context-ref')),
        own.header?.captionNote?.note,
      ]);
      return own.notes.filter((note) => named.has(note.slug)).length;
    });
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('draws every page Scene with ZoneScene, at the Surface or through a window onto the deep', () => {
    // ARRANGE
    const expected = ['surface', 'surface', 'twilight', 'surface', 'surface'];
    // ACT
    const actual = PAGE_SLUGS.map((slug) => sceneOf(slug)('[data-scene]').first().attr('data-depth-zone'));
    // ASSERT
    expect(actual).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('names no source twice within one Speaker note', () => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const actual = PAGE_SLUGS.flatMap((slug) =>
      localized(slug)
        .notes.filter((note) => new Set(note.sources?.map((s) => s.url)).size !== (note.sources?.length ?? 0))
        .map((note) => note.header),
    );
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('leaves no Speaker note without a source', () => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const actual = PAGE_SLUGS.flatMap((slug) =>
      localized(slug)
        .notes.filter((note) => (note.sources?.length ?? 0) === 0)
        .map((note) => note.header),
    );
    // ASSERT
    expect(actual).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('carries both views on every page Slide, the coding words hidden until the switch', () => {
    // ARRANGE
    const expected = [true, true, true, true, true];
    // ACT
    const actual = PAGE_SLUGS.map((slug) => {
      const $ = sceneOf(slug);
      return $('[data-view="chat"]').length > 0 && $('[data-view="coding"]').length > 0;
    });
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('scripts every German page Slide segment by segment, as English does', () => {
    // ARRANGE
    const expected = [3, 4, 3, 3, 3];
    // ACT
    const actual = PAGE_SLUGS.map(
      (slug) => localized(slug, 'de').voiceScript.filter((segment) => segment.script.length > 0).length,
    );
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it("keeps Anthropic's definition in English in the German caption, as a quotation", () => {
    // ARRANGE
    const expected =
      '“Skills are folders that include instructions, scripts, and resources that Claude can load when needed.”';
    // ACT
    const actual = localized('a-skill-is-a-written-procedure', 'de').header?.caption;
    // ASSERT
    expect(actual).toBe(expected);
  });
});
