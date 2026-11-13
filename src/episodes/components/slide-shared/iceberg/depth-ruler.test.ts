import { load } from 'cheerio';
import { createElement, isValidElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { DepthRail, DepthRuler, type ZoneWords } from './depth-ruler';
import type { Zone } from './ruler.pure';
import { zonePresentation } from './zone-presentation';

/*
 * The depth ruler a section slide shows and the slim rail every page Slide carries (design guide, Iceberg): one tile
 * per Section on its zone's band, that Section's tile lit; and the surface a Slide takes from the zone it names.
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
  surface: { name: 'Surface', metres: 'Above 0 m', science: 'the sea surface and the air above it' },
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
    const expected = { lit: ['4'], band: 'twilight', descent: 'descent' };
    // ACT
    const $ = html(createElement(DepthRuler, { sections: SECTIONS, lit: 4, zones: WORDS, label: 'Depth ruler' }));
    const seen = {
      lit: $('[data-tile][data-lit]')
        .toArray()
        .map((tile) => $(tile).attr('data-section')),
      band: $('[data-tile][data-lit]').closest('[data-ruler-zone]').attr('data-ruler-zone'),
      descent: $('[data-depth-ruler]').attr('data-motion'),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('gives a page Slide its zone surface, a slim rail with its Section lit, and no bubbles on entry', () => {
    // ARRANGE
    const expected = { surface: 'var(--zone-midnight)', enter: undefined, rail: 1, lit: ['6'] };
    // ACT
    const presentation = zonePresentation({ sections: SECTIONS, section: 6, kind: 'page' });
    const $ = html(createElement('div', null, presentation.rear));
    const seen = {
      surface: presentation.style['--slide-surface'],
      enter: presentation.enter,
      rail: $('[data-depth-rail]').length,
      lit: $('[data-depth-rail] [data-lit]')
        .toArray()
        .map((tile) => $(tile).attr('data-section')),
    };
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
  it('descends into a section slide through bubbles and draws no rail on it, since it shows the whole ruler', () => {
    // ARRANGE
    const expected = { enter: { effect: 'bubbles' }, rear: false, surface: 'var(--zone-sunlit)' };
    // ACT
    const presentation = zonePresentation({ sections: SECTIONS, section: 2, kind: 'section' });
    const seen = {
      enter: presentation.enter,
      rear: isValidElement(presentation.rear),
      surface: presentation.style['--slide-surface'],
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('turns text light on the two dark zones in both themes, and leaves the page text alone above them', () => {
    // ARRANGE
    const expected = ['var(--on-brand-accent)', undefined];
    // ACT
    const seen = [6, 2].map(
      (section) => zonePresentation({ sections: SECTIONS, section, kind: 'page' }).style['--foreground'],
    );
    // ASSERT
    expect(seen).toEqual(expected);
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
