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

const EYEBROW = { section: 'The long phone call', position: 1, count: 2, label: 'Page 1 of 2' };

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

  it('puts the page counter in brackets right after the Section title, in one line', () => {
    // ARRANGE
    const expected = /The long phone call <span[^>]*>\(1\/2\)/;
    // ACT
    const html = header({ eyebrow: EYEBROW, entrance: 'none' });
    // ASSERT
    expect(html).toMatch(expected);
  });

  it('reads the counter to assistive tech as the translated page label, not as a bare fraction', () => {
    // ARRANGE
    const expected = '<span class="sr-only">Page 1 of 2</span>';
    // ACT
    const html = header({ eyebrow: EYEBROW, entrance: 'none' });
    // ASSERT
    expect(html).toContain(expected);
  });

  it('spaces the parts with token gaps and no margins: a full gap around the title group, half between title and caption', () => {
    // ARRANGE
    const expected = ['gap-(--space-header)', 'pb-(--space-header)', 'gap-(--space-header-tight)'];
    // ACT
    const html = header({ eyebrow: EYEBROW, entrance: 'none' });
    // ASSERT
    for (const token of expected) expect(html).toContain(token);
    expect(html).not.toMatch(/class="[^"]*\bm[tb]-\d/);
  });

  it('lets the caption span the header full width', () => {
    // ARRANGE
    const forbidden = /data-target="caption" class="[^"]*max-w/;
    // ACT
    const html = header();
    // ASSERT
    expect(html).not.toMatch(forbidden);
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
