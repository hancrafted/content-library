import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { DepthRail, DepthRuler, type ZoneWords } from './depth-ruler';
import type { Zone } from './ruler.pure';

/*
 * The depth ruler a section slide shows and the slim rail every page Slide carries (design guide, Iceberg): one tile
 * per Section on its zone's band, that Section's tile lit, the view travelling down to its band.
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

const WORDS: ZoneWords = {
  surface: { name: 'Surface', metres: '0 m, the waterline', science: 'the sea surface and the air above it' },
  sunlit: { name: 'Sunlit', metres: '0–200 m', science: 'epipelagic' },
  twilight: { name: 'Twilight', metres: '200–1,000 m', science: 'mesopelagic' },
  midnight: { name: 'Midnight', metres: '1,000–4,000 m', science: 'bathypelagic' },
  abyss: { name: 'Abyss', metres: '4,000–6,000 m', science: 'abyssopelagic' },
};

const html = (element: Parameters<typeof renderToStaticMarkup>[0]) => load(renderToStaticMarkup(element));

describe('success cases', () => {
  it('names the five zones in plain words, the ocean term beneath, each Section a tile on its band', () => {
    // ARRANGE
    const expected = [
      { zone: 'Surface', term: 'the sea surface and the air above it', tiles: 2 },
      { zone: 'Sunlit', term: 'epipelagic', tiles: 2 },
      { zone: 'Twilight', term: 'mesopelagic', tiles: 2 },
      { zone: 'Midnight', term: 'bathypelagic', tiles: 1 },
      { zone: 'Abyss', term: 'abyssopelagic', tiles: 1 },
    ];
    // ACT
    const $ = html(createElement(DepthRuler, { sections: SECTIONS, lit: 4, zones: WORDS, label: 'Depth ruler' }));
    const bands = $('[data-ruler-zone]')
      .toArray()
      .map((band) => ({
        zone: $(band).find('[data-zone-label]').text(),
        term: $(band).find('[data-ocean-term]').text(),
        tiles: $(band).find('[data-tile]').length,
      }));
    // ASSERT
    expect(bands).toEqual(expected);
  });

  it('lights the fifth Section on the Twilight band, and descends to it', () => {
    // ARRANGE
    const expected = { lit: ['4'], band: 'twilight', descent: 'descent', bands: '2', view: 1 };
    // ACT
    const $ = html(createElement(DepthRuler, { sections: SECTIONS, lit: 4, zones: WORDS, label: 'Depth ruler' }));
    const seen = {
      lit: $('[data-tile][data-lit]')
        .toArray()
        .map((tile) => $(tile).attr('data-section')),
      band: $('[data-tile][data-lit]').closest('[data-ruler-zone]').attr('data-ruler-zone'),
      descent: $('[data-depth-ruler]').attr('data-motion'),
      bands: $('[data-depth-ruler]').attr('data-descent'),
      view: $('[data-ruler-view]').length,
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('sends the view further for a deeper Section: none on the Surface, four bands down to the Abyss', () => {
    // ARRANGE
    const expected = ['0', '1', '2', '3', '4'];
    // ACT
    const seen = [0, 2, 4, 6, 7].map((lit) =>
      html(createElement(DepthRuler, { sections: SECTIONS, lit, zones: WORDS, label: 'Depth ruler' }))(
        '[data-depth-ruler]',
      ).attr('data-descent'),
    );
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
  it('keeps the Title slide ruler still, with no view to travel, the Surface lit', () => {
    // ARRANGE
    const expected = { motion: undefined, descent: undefined, view: 0, lit: ['0'] };
    // ACT
    const $ = html(
      createElement(DepthRuler, { sections: SECTIONS, lit: 0, zones: WORDS, label: 'Depth ruler', descend: false }),
    );
    const seen = {
      motion: $('[data-depth-ruler]').attr('data-motion'),
      descent: $('[data-depth-ruler]').attr('data-descent'),
      view: $('[data-ruler-view]').length,
      lit: $('[data-tile][data-lit]')
        .toArray()
        .map((tile) => $(tile).attr('data-section')),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('marks the two dark zones for light text, on the ruler bands and nowhere above them', () => {
    // ARRANGE
    const expected = ['midnight', 'abyss'];
    // ACT
    const $ = html(createElement(DepthRuler, { sections: SECTIONS, lit: 0, zones: WORDS, label: 'Depth ruler' }));
    const dark = $('[data-ruler-zone][data-dark]')
      .toArray()
      .map((band) => $(band).attr('data-ruler-zone'));
    // ASSERT
    expect(dark).toEqual(expected);
  });

  it('keeps the rail wordless and out of assistive tech, as decoration the table of contents already says', () => {
    // ARRANGE
    const expected = { hidden: 'true', text: '' };
    // ACT
    const $ = html(createElement(DepthRail, { sections: SECTIONS, lit: 0 }));
    const seen = { hidden: $('[data-depth-rail]').attr('aria-hidden'), text: $('[data-depth-rail]').text() };
    // ASSERT
    expect(seen).toEqual(expected);
  });
});
