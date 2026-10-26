import { describe, expect, it } from 'vitest';
import { findToolingPage } from './tooling-pages';

/*
 * Tooling pages (design-ADR 0016 decision 12): authoring benches with a previewable page at `/episodes/<slug>/`, held
 * in their own list, apart from the Episode registry.
 */

describe('success cases', () => {
  it.each(['page-template', 'workshop-template', 'slide-master', 'slides'])(
    'finds the tooling page %s under its own slug',
    (slug) => {
      // ARRANGE
      const expected = slug;
      // ACT
      const page = findToolingPage(slug);
      // ASSERT
      expect(page.slug).toBe(expected);
    },
  );

  it('composes the Workshop template as agenda, in scope, out of scope and orga Slides after its Title slide', () => {
    // ARRANGE
    const expected = [['agenda'], ['in-scope', 'out-of-scope'], ['orga']];
    // ACT
    const sections = findToolingPage('workshop-template').sections.map((section) => section.map(({ slug }) => slug));
    // ASSERT
    expect(sections).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('finds no tooling page for an Episode slug', () => {
    // ARRANGE
    const episode = 'ai-attention-span';
    // ACT
    const lookup = () => findToolingPage(episode);
    // ASSERT
    expect(lookup).toThrow();
  });
});

describe('edge cases', () => {
  it('finds no tooling page for the deleted slide-layouts', () => {
    // ARRANGE
    const deleted = 'slide-layouts';
    // ACT
    const lookup = () => findToolingPage(deleted);
    // ASSERT
    expect(lookup).toThrow();
  });
});
