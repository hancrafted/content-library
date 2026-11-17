import { describe, expect, it } from 'vitest';
import { explorablePageTemplate } from './episode';

/*
 * What this page composes, Section by Section, as slugs: a content decision the Episode-level checks
 * (`episode-checks.test.ts`) cannot know, so it is written out here, beside the page.
 */

const SECTIONS = explorablePageTemplate.sections.map((section) => section.map(({ slug }) => slug));

describe('success cases', () => {
  it('composes the Explorable page template as play (the Explorable), then about with Why, How and What, after its Title slide', () => {
    // ARRANGE
    const expected = [
      ['play', 'every-option-on'],
      ['about', 'why-how-what'],
    ];
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
