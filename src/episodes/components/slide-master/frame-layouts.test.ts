import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { BasicPageSlide } from './basic-page-slide';
import { SectionSlide } from './section-slide';
import { ThreeColumnSlide } from './three-column-slide';

/*
 * The frame layouts (design-ADR 0016 decision 13): with the `slide-layouts` gallery deleted, the section slide, basic
 * page and three-column frames live here, and this pins the note targets each marks
 * (docs/features/episode-chrome.md, "Which targets exist").
 */

/** The `data-target` values a rendered frame carries, in document order. */
function targetsOf(html: string): string[] {
  return [...html.matchAll(/data-target="([^"]*)"/g)].map(([, target]) => target);
}

describe('success cases', () => {
  it('marks the caption on a section slide', () => {
    // ARRANGE
    const expected = ['caption'];
    // ACT
    const html = renderToStaticMarkup(createElement(SectionSlide, { title: 'Section', caption: 'Why' }));
    // ASSERT
    expect(targetsOf(html)).toEqual(expected);
  });

  it('marks the caption and the prose on a basic page', () => {
    // ARRANGE
    const expected = ['caption', 'prose'];
    // ACT
    const html = renderToStaticMarkup(createElement(BasicPageSlide, { title: 'Page', caption: 'Why', prose: 'How' }));
    // ASSERT
    expect(targetsOf(html)).toEqual(expected);
  });

  it('marks the caption and each column by its slug on a three-column page', () => {
    // ARRANGE
    const expected = ['caption', 'first', 'second', 'third'];
    const column = (slug: string) => ({ slug, title: slug, prose: slug });
    // ACT
    const html = renderToStaticMarkup(
      createElement(ThreeColumnSlide, {
        title: 'Columns',
        caption: 'Why',
        columns: [column('first'), column('second'), column('third')],
      }),
    );
    // ASSERT
    expect(targetsOf(html)).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('marks no caption on a section slide that has none', () => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const html = renderToStaticMarkup(createElement(SectionSlide, { title: 'Section' }));
    // ASSERT
    expect(targetsOf(html)).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('centres a section slide without children and lets children flow below', () => {
    // ARRANGE
    const centred = 'items-center';
    // ACT
    const bare = renderToStaticMarkup(createElement(SectionSlide, { title: 'Section' }));
    const withChildren = renderToStaticMarkup(createElement(SectionSlide, { title: 'Section', children: 'Scene' }));
    // ASSERT
    expect(bare).toContain(centred);
    expect(withChildren).not.toContain(centred);
  });
});
