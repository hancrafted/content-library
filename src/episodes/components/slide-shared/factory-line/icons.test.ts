import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { DocumentIcon, type DocumentTone } from './icons';

/*
 * The document that moves down the line, in each of its looks: what its page is drawn in, and whether its outline is
 * dashed. Quality is a weight (crisp or dulled), never a hue; a hue marks only who handled it or that it missed.
 */

const pageOf = (tone: DocumentTone) => {
  const $ = load(renderToStaticMarkup(createElement(DocumentIcon, { tone })));
  const page = $('path').first();
  return { className: page.attr('class'), dashed: page.attr('stroke-dasharray') !== undefined };
};

describe('success cases', () => {
  it('draws a document an AI station turns out in the ai colour', () => {
    // ARRANGE
    const expected = { className: 'fill-card stroke-ai', dashed: false };
    // ACT
    const actual = pageOf('ai');
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('draws a clear document that misses its target in warning', () => {
    // ARRANGE
    const expected = { className: 'fill-card stroke-(--warning)', dashed: false };
    // ACT
    const actual = pageOf('miss');
    // ASSERT
    expect(actual).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('keeps the crisp document solid and in full ink, as before', () => {
    // ARRANGE
    const expected = { className: 'fill-card stroke-foreground', dashed: false };
    // ACT
    const actual = pageOf('crisp');
    // ASSERT
    expect(actual).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('draws a vague document dashed and dulled toward muted-foreground, never in a hue', () => {
    // ARRANGE
    const expected = { className: 'fill-muted stroke-muted-foreground', dashed: true };
    // ACT
    const actual = pageOf('vague');
    // ASSERT
    expect(actual).toEqual(expected);
  });
});
