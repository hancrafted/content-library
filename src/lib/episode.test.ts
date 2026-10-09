import { describe, expect, it } from 'vitest';
import {
  placeSections,
  slidesInPageOrder,
  slidesOf,
  targetAnchor,
  titleAnchor,
  type SectionOutline,
  type SlideOutline,
} from './episode.pure';

/** A Section outline whose page Slides carry only their slugs. */
function outline(slug: string, slides: readonly string[]): SectionOutline {
  return { slug, slides: slides.map((page) => ({ slug: page })) };
}

/** A Section as a Slide record lists it: its section slide's slug first, then its page Slides'. */
function list(...slugs: [string, ...string[]]): readonly [SlideOutline, ...SlideOutline[]] {
  const [first, ...rest] = slugs;
  return [{ slug: first }, ...rest.map((slug) => ({ slug }))];
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

  describe('a Section as a list of Slides', () => {
    it('names each Section after its first Slide and joins the rest under it, in page order', () => {
      // ARRANGE
      const sections = [list('foundations', 'why-a-template', 'three-layers'), list('interlude')];
      const expected = [['foundations', 'foundations--why-a-template', 'foundations--three-layers'], ['interlude']];
      // ACT
      const placed = placeSections(sections).map((section) => section.map(({ id }) => id));
      // ASSERT
      expect(placed).toEqual(expected);
    });

    it('gives the first Slide of a Section an h2 and every other Slide an h3', () => {
      // ARRANGE
      const sections = [list('foundations', 'why', 'how'), list('interlude')];
      const expected = [['h2', 'h3', 'h3'], ['h2']];
      // ACT
      const levels = placeSections(sections).map((section) => section.map(({ level }) => level));
      // ASSERT
      expect(levels).toEqual(expected);
    });

    it('tells every placed Slide the slug of the Section it sits in and hands back its record', () => {
      // ARRANGE
      const why = { slug: 'why' };
      const sections = [[{ slug: 'foundations' }, why] as const];
      // ACT
      const [[head, page]] = placeSections(sections);
      // ASSERT
      expect([head.section, page.section]).toEqual(['foundations', 'foundations']);
      expect(page.slide).toBe(why);
    });

    it('produces the same anchors as the Section-outline walk it replaces', () => {
      // ARRANGE
      const outlines = [outline('foundations', ['why', 'how']), outline('interlude', [])];
      const lists = [list('foundations', 'why', 'how'), list('interlude')];
      // ACT
      const legacy = slidesInPageOrder(slidesOf(outlines)).map(({ id }) => id);
      const placed = placeSections(lists).flatMap((section) => section.map(({ id }) => id));
      // ASSERT
      expect(placed).toEqual(legacy);
    });
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

  it('rejects two Slides sharing a slug anywhere in the Episode, since Translation keys are flat by Slide slug', () => {
    // ARRANGE
    const sections = [list('foundations', 'recap'), list('next-steps', 'recap')];
    const duplicate = 'recap';
    // ACT
    const build = () => placeSections(sections);
    // ASSERT
    expect(build).toThrow(duplicate);
  });

  it('rejects a page Slide sharing its slug with a section slide', () => {
    // ARRANGE
    const sections = [list('foundations', 'interlude'), list('interlude')];
    const duplicate = 'interlude';
    // ACT
    const build = () => placeSections(sections);
    // ASSERT
    expect(build).toThrow(duplicate);
  });

  it('rejects `top` as the slug of a Section’s first Slide', () => {
    // ARRANGE
    const sections = [list('top', 'why')];
    // ACT
    const build = () => placeSections(sections);
    // ASSERT
    expect(build).toThrow('top');
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
