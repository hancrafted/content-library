import { describe, expect, it } from 'vitest';
import { placeSections, TITLE_ANCHOR, type SectionList, type SlideOutline } from './episode.pure';

/** A Section as a Slide record lists it: its section slide's slug first, then its page Slides'. */
function list(...slugs: [string, ...string[]]): readonly [SlideOutline, ...SlideOutline[]] {
  const [first, ...rest] = slugs;
  return [{ slug: first }, ...rest.map((slug) => ({ slug }))];
}

/** What a reader of placed Slides sees: each id and the slug of the record it came from. */
function idsAndSlugs(sections: readonly (readonly [SlideOutline, ...SlideOutline[]])[]): [string, string][] {
  return placeSections(sections).flatMap((section) =>
    section.map(({ id, slide }): [string, string] => [id, slide.slug]),
  );
}

describe('success cases', () => {
  it('places every section slide and page Slide in page order, each with its anchor, a slideless Section included', () => {
    // ARRANGE
    const sections = [
      list('foundations', 'why-a-template', 'three-pillars'),
      list('interlude'),
      list('next-steps', 'recap'),
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
  });

  describe('the Title slide anchor', () => {
    it('is `top`, the one id no Section or Slide may take', () => {
      // ARRANGE
      const reserved = 'top';
      // ACT
      const anchor = TITLE_ANCHOR;
      // ASSERT
      expect(anchor).toBe(reserved);
    });
  });
});

describe('failure cases', () => {
  it('rejects two slides sharing a slug within a section', () => {
    // ARRANGE
    const sections = [list('next-steps', 'recap', 'recap')];
    const duplicate = 'recap';
    // ACT
    const build = () => placeSections(sections);
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
    const sections = [list('foundations', badSlug)];
    // ACT
    const build = () => placeSections(sections);
    // ASSERT
    expect(build).toThrow(badSlug);
  });

  describe('the Title slide anchor', () => {
    it('rejects `top` as a Section slug, which would collide with the Title slide', () => {
      // ARRANGE
      const sections = [list('top')];
      // ACT
      const build = () => placeSections(sections);
      // ASSERT
      expect(build).toThrow('top');
    });

    it('rejects `top` as a Slide slug', () => {
      // ARRANGE
      const sections = [list('intro', 'top')];
      // ACT
      const build = () => placeSections(sections);
      // ASSERT
      expect(build).toThrow('top');
    });
  });
});

describe('edge cases', () => {
  it('places nothing for an Episode with no Sections yet', () => {
    // ARRANGE
    const sections: SectionList[] = [];
    // ACT
    const placed = placeSections(sections);
    // ASSERT
    expect(placed).toEqual([]);
  });

  it('rejects a double hyphen, which would collide with a section--slide anchor', () => {
    // ARRANGE
    const sections = [list('next', 'steps'), list('next--steps')];
    const badSlug = 'next--steps';
    // ACT
    const build = () => placeSections(sections);
    // ASSERT
    expect(build).toThrow(badSlug);
  });
});
