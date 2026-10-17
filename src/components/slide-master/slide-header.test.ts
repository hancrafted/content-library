import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { SlideHeader, type SlideHeaderProps } from './slide-header';

function header(extra: Partial<SlideHeaderProps> = {}): string {
  return renderToStaticMarkup(
    createElement(SlideHeader, {
      seed: 'section',
      level: 'h2',
      title: 'Start early',
      caption: 'Revenue lands here.',
      captionEmphasis: [{ start: 8, end: 13 }],
      ...extra,
    }),
  );
}

/** The characters of the typed caption that carry the emphasis mark, joined. */
function emphasisedCharacters(html: string): string {
  return [...html.matchAll(/<span data-char=""[^>]*data-emphasis=""[^>]*>(.)<\/span>/g)].map(([, c]) => c).join('');
}

describe('success cases', () => {
  it('types the emphasised run of the caption in `primary` semibold, character by character', () => {
    // ARRANGE
    const expected = 'lands';
    // ACT
    const html = header();
    // ASSERT
    expect(emphasisedCharacters(html)).toBe(expected);
  });

  it('shows the emphasised run as one `primary` run when the header does not type', () => {
    // ARRANGE
    const expected = /Revenue <b data-emphasis="" class="font-semibold text-primary">lands<\/b> here\./;
    // ACT
    const html = header({ entrance: 'none' });
    // ASSERT
    expect(html).toMatch(expected);
  });
});

describe('failure cases', () => {
  it('keeps the caption whole and plain for assistive tech while it types', () => {
    // ARRANGE
    const expected = '<span class="sr-only">Revenue lands here.</span>';
    // ACT
    const html = header();
    // ASSERT
    expect(html).toContain(expected);
  });
});

describe('edge cases', () => {
  it('sets nothing off in a caption without emphasis', () => {
    // ARRANGE
    const expected = 'data-emphasis';
    // ACT
    const html = header({ captionEmphasis: undefined });
    // ASSERT
    expect(html).not.toContain(expected);
  });
});
