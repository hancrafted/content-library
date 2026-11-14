import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { DepthRail } from './depth-rail';
import type { Zone } from './ruler.pure';

/*
 * The slim rail every page Slide carries at its left edge, and a section slide on phones (design guide, Iceberg): one
 * tile per Section in its zone's colour, from the Surface down, the Slide's own Section lit.
 */

const SECTIONS: readonly Zone[] = [
  'surface',
  'surface',
  'sunlit',
  'sunlit',
  'twilight',
  'twilight',
  'midnight',
  'abyss',
];

const html = (element: Parameters<typeof renderToStaticMarkup>[0]) => load(renderToStaticMarkup(element));

describe('success cases', () => {
  it("gives each Section a tile in its zone's colour, from the Surface down, the Slide's own Section lit", () => {
    // ARRANGE
    const expected = [
      { section: '0', zone: 'surface', lit: undefined },
      { section: '1', zone: 'surface', lit: undefined },
      { section: '2', zone: 'sunlit', lit: undefined },
      { section: '3', zone: 'sunlit', lit: undefined },
      { section: '4', zone: 'twilight', lit: '' },
      { section: '5', zone: 'twilight', lit: undefined },
      { section: '6', zone: 'midnight', lit: undefined },
      { section: '7', zone: 'abyss', lit: undefined },
    ];
    // ACT
    const $ = html(createElement(DepthRail, { sections: SECTIONS, lit: 4 }));
    const seen = $('[data-depth-rail] [data-section]')
      .toArray()
      .map((tile) => ({
        section: $(tile).attr('data-section'),
        zone: $(tile).attr('data-rail-zone'),
        lit: $(tile).attr('data-lit'),
      }));
    // ASSERT
    expect(seen).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('refuses a rail for a Section the Episode does not have', () => {
    // ARRANGE
    const expected = /Section 9 of 8/;
    // ACT
    const draw = () => renderToStaticMarkup(createElement(DepthRail, { sections: SECTIONS, lit: 9 }));
    // ASSERT
    expect(draw).toThrow(expected);
  });
});

describe('edge cases', () => {
  it('keeps the rail wordless and out of assistive tech, as decoration the table of contents already says', () => {
    // ARRANGE
    const expected = { hidden: 'true', text: '' };
    // ACT
    const $ = html(createElement(DepthRail, { sections: SECTIONS, lit: 0 }));
    const seen = { hidden: $('[data-depth-rail]').attr('aria-hidden'), text: $('[data-depth-rail]').text() };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('keeps a section slide’s rail to phones, where its depth gauge is hidden', () => {
    // ARRANGE
    const expected = { phoneOnly: '', page: undefined };
    // ACT
    const phoneOnly = html(createElement(DepthRail, { sections: SECTIONS, lit: 2, phoneOnly: true }));
    const page = html(createElement(DepthRail, { sections: SECTIONS, lit: 2 }));
    const seen = {
      phoneOnly: phoneOnly('[data-depth-rail]').attr('data-phone-only'),
      page: page('[data-depth-rail]').attr('data-phone-only'),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });
});
