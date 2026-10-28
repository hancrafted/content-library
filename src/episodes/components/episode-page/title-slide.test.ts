import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { TitleSlide } from './title-slide';

const TEXT = { title: 'Page template', caption: 'The smallest Episode.' };

/** The Title slide's static HTML on the shared header, with or without an authored hero Scene. */
function render(hero?: string) {
  const props = { ...TEXT, mode: 'shared' as const, entrance: 'none' as const };
  return renderToStaticMarkup(
    createElement(TitleSlide, hero === undefined ? props : { ...props, hero: createElement('figure', null, hero) }),
  );
}

describe('success cases', () => {
  it('sets an authored hero directly under the h1 and caption, the pair centred in the slide', () => {
    // ARRANGE
    const hug = 'data-headed="hug"';
    // ACT
    const html = render('board');
    // ASSERT
    expect(html).toContain(hug);
    expect(html).toMatch(/data-slot="slide-header"[^>]*class="[^"]*\bmt-auto\b/);
    expect(html).toMatch(/<\/h1>.*<figure>board<\/figure>/);
  });

  it('marks its wrapper with the declared tone', () => {
    // ARRANGE
    const props = { ...TEXT, mode: 'shared' as const, entrance: 'none' as const, tone: 'inverse' as const };
    // ACT
    const html = renderToStaticMarkup(createElement(TitleSlide, props));
    // ASSERT
    expect(html).toMatch(
      /data-slot="title-slide"[^>]*data-tone="inverse"|data-tone="inverse"[^>]*data-slot="title-slide"/,
    );
  });
});

describe('failure cases', () => {
  it('never lets an authored hero fill the slide, which would push it to the bottom', () => {
    // ARRANGE
    const fill = 'data-headed="fill"';
    // ACT
    const html = render('board');
    // ASSERT
    expect(html).not.toContain(fill);
  });
});

describe('edge cases', () => {
  it('centres the h1 and caption over the shared glow when there is no hero', () => {
    // ARRANGE
    const glow = 'hero-glow';
    // ACT
    const html = render();
    // ASSERT
    expect(html).toContain(glow);
    expect(html).toMatch(/data-slot="slide-header"[^>]*class="[^"]*\bmy-auto\b/);
  });

  it('carries no tone mark when the record declares none', () => {
    // ARRANGE
    const attribute = 'data-tone';
    // ACT
    const html = render('board');
    // ASSERT
    expect(html).not.toContain(attribute);
  });
});
