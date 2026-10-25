import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { TitleSlide } from './title-slide';

const TEXT = { title: 'Page template', caption: 'The smallest Episode.' };

/** The Title slide's static HTML on the shared header, with or without an authored hero Scene. */
function render(hero?: string, position?: string) {
  const props = { ...TEXT, mode: 'shared' as const, entrance: 'none' as const, ...(position && { position }) };
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
});

describe('failure cases', () => {
  it("names nothing of a Playlist on an Episode's own page", () => {
    // ARRANGE
    const marker = 'data-playlist-position';
    // ACT
    const html = render();
    // ASSERT
    expect(html).not.toContain(marker);
  });

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
  it("follows the title with the Episode's place in its Event's Playlist", () => {
    // ARRANGE
    const position = 'Episode 2 of 4';
    const afterTitle = new RegExp(`</h1>.*data-playlist-position[^>]*>${position}<`);
    // ACT
    const html = render(undefined, position);
    // ASSERT
    expect(html).toMatch(afterTitle);
  });

  it('centres the h1 and caption over the shared glow when there is no hero', () => {
    // ARRANGE
    const glow = 'hero-glow';
    // ACT
    const html = render();
    // ASSERT
    expect(html).toContain(glow);
    expect(html).toMatch(/data-slot="slide-header"[^>]*class="[^"]*\bmy-auto\b/);
  });
});
