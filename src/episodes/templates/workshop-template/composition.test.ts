import { describe, expect, it } from 'vitest';
import { workshopTemplate } from './episode';

/*
 * What this page composes, Section by Section, as slugs: a content decision the Episode-level checks
 * (`episode-checks.test.ts`) cannot know, so it is written out here, beside the page.
 */

/** The page's Sections as the slugs of their Slides, section slide first. */
const SECTIONS = workshopTemplate.sections.map((section) => section.map(({ slug }) => slug));

describe('success cases', () => {
  it('composes the Workshop template as hook, agenda, scope, poll, About me as its own Section, and orga Slides after its Title slide', () => {
    // ARRANGE
    const expected = [['hook'], ['agenda'], ['in-scope', 'out-of-scope'], ['poll'], ['about-me'], ['orga']];
    // ACT
    const sections = SECTIONS;
    // ASSERT
    expect(sections).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('opens no two Sections with one Slide', () => {
    // ARRANGE
    const openers = SECTIONS.map(([opener]) => opener);
    // ACT
    const repeated = openers.filter((slug, index) => openers.indexOf(slug) !== index);
    // ASSERT
    expect(repeated).toEqual([]);
  });
});

describe('edge cases', () => {
  it('holds a Slide in every Section', () => {
    // ARRANGE
    const expected: string[][] = [];
    // ACT
    const empty = SECTIONS.filter((section) => section.length === 0);
    // ASSERT
    expect(empty).toEqual(expected);
  });
});
