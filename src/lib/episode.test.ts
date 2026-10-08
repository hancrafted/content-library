import { describe, expect, it } from 'vitest';
import { slidesInPageOrder, slidesOf, targetAnchor, titleAnchor, type SectionOutline } from './episode.pure';

/** A Section outline whose page Slides carry only their slugs. */
function outline(slug: string, slides: readonly string[]): SectionOutline {
  return { slug, slides: slides.map((page) => ({ slug: page })) };
}

/** What a reader of placed Slides sees: each id and the slug of the record it came from. */
function idsAndSlugs(sections: readonly SectionOutline[]): [string, string][] {
  return slidesInPageOrder(slidesOf(sections)).map(({ id, slide }) => [id, slide.slug]);
}

describe('success cases', () => {
  it('places every section slide and page Slide in page order, each with its anchor, a slideless Section included', () => {
    // ARRANGE
    const sections = [
      outline('foundations', ['why-a-template', 'three-pillars']),
      outline('interlude', []),
      outline('next-steps', ['recap']),
    ];
    const expected = [
      ['foundations', 'foundations'],
      ['foundations--why-a-template', 'why-a-template'],
      ['foundations--three-pillars', 'three-pillars'],
      ['interlude', 'interlude'],
      ['next-steps', 'next-steps'],
      ['next-steps--recap', 'recap'],
    ];
    // ACT
    const placed = idsAndSlugs(sections);
    // ASSERT
    expect(placed).toEqual(expected);
  });

  it('groups each Section with its own page Slides and hands back the records it was given', () => {
    // ARRANGE
    const why = { slug: 'why', title: 'Why' };
    const foundations = { slug: 'foundations', title: 'Foundations', slides: [why] };
    const expected = [{ id: 'foundations', slide: foundations, slides: [{ id: 'foundations--why', slide: why }] }];
    // ACT
    const placed = slidesOf([foundations]);
    // ASSERT
    expect(placed).toEqual(expected);
    expect(placed[0].slides[0].slide).toBe(why);
  });

  it('joins a Slide anchor and an element name with a double hyphen, never equal to a two-part Slide anchor', () => {
    // ARRANGE
    const expected = 'foundations--why--prose';
    const slideAnchor = 'foundations--why';
    // ACT
    const anchor = targetAnchor(slideAnchor, 'prose');
    // ASSERT
    expect(anchor).toBe(expected);
    expect(anchor).not.toBe(slideAnchor);
  });

  describe('the Title slide anchor', () => {
    it('is `top`, the one id no Section or Slide may take', () => {
      // ARRANGE
      const reserved = 'top';
      // ACT
      const anchor = titleAnchor();
      // ASSERT
      expect(anchor).toBe(reserved);
    });
  });
});

describe('failure cases', () => {
  it('rejects two slides sharing a slug within a section', () => {
    // ARRANGE
    const sections = [outline('next-steps', ['recap', 'recap'])];
    const duplicate = 'next-steps--recap';
    // ACT
    const build = () => slidesOf(sections);
    // ASSERT
    expect(build).toThrow(duplicate);
  });

  it('rejects a slug that is not lowercase kebab-case', () => {
    // ARRANGE
    const badSlug = 'Why A Template';
    const sections = [outline('foundations', [badSlug])];
    // ACT
    const build = () => slidesOf(sections);
    // ASSERT
    expect(build).toThrow(badSlug);
  });

  it('rejects an element name that is not kebab-case', () => {
    // ARRANGE
    const bad = 'Not Kebab';
    // ACT
    const build = () => targetAnchor('foundations--why', bad);
    // ASSERT
    expect(build).toThrow(bad);
  });

  describe('the Title slide anchor', () => {
    it('rejects `top` as a Section slug, which would collide with the Title slide', () => {
      // ARRANGE
      const sections = [outline('top', [])];
      // ACT
      const build = () => slidesOf(sections);
      // ASSERT
      expect(build).toThrow('top');
    });

    it('rejects `top` as a Slide slug', () => {
      // ARRANGE
      const sections = [outline('intro', ['top'])];
      // ACT
      const build = () => slidesOf(sections);
      // ASSERT
      expect(build).toThrow('top');
    });
  });
});

describe('edge cases', () => {
  it('places nothing for an Episode with no Sections yet', () => {
    // ARRANGE
    const sections: SectionOutline[] = [];
    // ACT
    const placed = slidesOf(sections);
    // ASSERT
    expect(placed).toEqual([]);
  });

  it('rejects a double hyphen, which would collide with a section--slide anchor', () => {
    // ARRANGE
    const sections = [outline('next', ['steps']), outline('next--steps', [])];
    const badSlug = 'next--steps';
    // ACT
    const build = () => slidesOf(sections);
    // ASSERT
    expect(build).toThrow(badSlug);
  });
});
