import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { HeroTitle, SlideCaption, SlideProse, SlideTitle } from './slide-master';

function classesOf(html: string): string[] {
  return (/class="([^"]*)"/.exec(html)?.[1] ?? '').split(/\s+/);
}

describe('success cases', () => {
  it('renders HeroTitle as an h1 in the hero role', () => {
    // ARRANGE
    const heroRole = 'text-hero';
    const openingTag = '<h1 ';
    const title = createElement(HeroTitle, null, 'Hello');
    // ACT
    const html = renderToStaticMarkup(title);
    const opening = html.slice(0, openingTag.length);
    // ASSERT
    expect(opening).toBe(openingTag);
    expect(classesOf(html)).toContain(heroRole);
  });

  it.each([
    ['h2', 'text-heading'],
    ['h3', 'text-subheading'],
    ['h4', 'text-body'],
  ] as const)('sizes a %s title by the %s role', (level, role) => {
    // ARRANGE
    const weight = 'font-semibold';
    const openingTag = `<${level} `;
    const title = createElement(SlideTitle, { as: level, children: 'Hello' });
    // ACT
    const html = renderToStaticMarkup(title);
    const classes = classesOf(html);
    const opening = html.slice(0, openingTag.length);
    // ASSERT
    expect(opening).toBe(openingTag);
    expect(classes).toContain(role);
    expect(classes).toContain(weight);
  });

  it('sets the caption in the caption role, muted, and prose in the body role', () => {
    // ARRANGE
    const expectedCaption = ['text-caption', 'text-muted-foreground'];
    const expectedProse = 'text-body';
    const caption = createElement(SlideCaption, null, 'c');
    const prose = createElement(SlideProse, null, 'p');
    // ACT
    const captionClasses = classesOf(renderToStaticMarkup(caption));
    const proseClasses = classesOf(renderToStaticMarkup(prose));
    // ASSERT
    expect(captionClasses).toEqual(expect.arrayContaining(expectedCaption));
    expect(proseClasses).toContain(expectedProse);
  });
});

describe('failure cases', () => {
  it('leaves text-hero to HeroTitle alone', () => {
    // ARRANGE
    const heroRole = 'text-hero';
    const titles = (['h2', 'h3', 'h4'] as const).map((as) => createElement(SlideTitle, { as, children: 'x' }));
    // ACT
    const html = titles.map((title) => renderToStaticMarkup(title)).join('');
    // ASSERT
    expect(html).not.toContain(heroRole);
  });

  it('uses no breakpoint prefix on any size', () => {
    // ARRANGE
    const breakpointSize = /\b(sm|md|lg|xl):text-/;
    const parts = [
      createElement(HeroTitle, null, 'x'),
      createElement(SlideTitle, { as: 'h3', children: 'x' }),
      createElement(SlideCaption, null, 'x'),
      createElement(SlideProse, null, 'x'),
    ];
    // ACT
    const html = parts.map((part) => renderToStaticMarkup(part)).join('');
    // ASSERT
    expect(html).not.toMatch(breakpointSize);
  });
});

describe('edge cases', () => {
  it('passes id, className, data attributes and rich children through HeroTitle', () => {
    // ARRANGE
    const id = 'hero-title';
    const testId = 'page-title';
    const extra = 'extra';
    const accent = '<em>accent</em>';
    const idAttribute = `id="${id}"`;
    const testIdAttribute = `data-testid="${testId}"`;
    const title = createElement(
      HeroTitle,
      { id, className: extra, 'data-testid': testId } as object,
      'Plain ',
      createElement('em', null, 'accent'),
    );
    // ACT
    const html = renderToStaticMarkup(title);
    // ASSERT
    expect(html).toContain(idAttribute);
    expect(html).toContain(testIdAttribute);
    expect(html).toContain(accent);
    expect(classesOf(html)).toContain(extra);
  });
});
