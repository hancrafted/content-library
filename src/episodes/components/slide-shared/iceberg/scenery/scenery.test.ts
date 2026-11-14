import { load } from 'cheerio';
import { createElement, type ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Bubbles } from './bubbles';
import { Clouds } from './clouds';
import { ToneFacets } from './facets';
import { FishSchool } from './fish-school';
import { Iceberg } from './iceberg';
import { Jellies } from './jellies';
import { LightRays } from './seabed';
import { SunMoon } from './sun-moon';
import { Whale } from './whale';

/*
 * The scenery parts `ZoneScene` draws: the iceberg by part, the sea life with its one ambient loop each, the sky's
 * clouds and its sun and moon, the seabed and the light rays. Rendered to static markup, as a Scene's server render
 * does, and read by their `data-*` hooks. That every tone they paint has a colour is checked against the CSS on disk,
 * in scenery.slow.test.ts and fable-elements.slow.test.ts.
 */

const render = (element: ReactElement) => load(renderToStaticMarkup(createElement('svg', null, element)));

const TIP = '[data-iceberg-tip]';
const KEEL = '[data-iceberg-keel]';
const GLOW = '[data-iceberg-glow]';
const MOTION = '[data-motion]';
const AMBIENT = '[data-motion="ambient"]';

describe('success cases', () => {
  it('draws the tip, the keel and the waterline glow for the whole iceberg, on the waterline', () => {
    // ARRANGE
    const expected = { tip: 1, keel: 1, glow: 1, transform: 'translate(900 400) scale(1)' };
    // ACT
    const $ = render(createElement(Iceberg, { x: 900, waterline: 400 }));
    const seen = {
      tip: $(TIP).length,
      keel: $(KEEL).length,
      glow: $(GLOW).length,
      transform: $('[data-iceberg]').attr('transform'),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('marks each creature loop as ambient, so a check finds every moving part', () => {
    // ARRANGE
    const expected = { school: 1, jellies: 2, whale: 1, bubbles: 7, clouds: 6 };
    // ACT
    const count = (element: ReactElement) => render(element)(AMBIENT).length;
    const seen = {
      school: count(createElement(FishSchool, { x: 0, y: 0 })),
      jellies: count(createElement(Jellies, { x: 0, y: 0 })),
      whale: count(createElement(Whale, { x: 0, y: 0 })),
      bubbles: count(createElement(Bubbles, { x: 0, y: 0 })),
      clouds: count(createElement(Clouds, {})),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('draws each Abyss bubble as the shared faceted PolyBubble, each named ambient for its host loop', () => {
    // ARRANGE
    const expected = { drawn: 7, ambient: 7, ownShapes: 0 };
    // ACT
    const $ = render(createElement(Bubbles, { x: 0, y: 0 }));
    const seen = {
      drawn: $('[data-bubbles] [data-poly-bubble]').length,
      ambient: $('[data-poly-bubble][data-motion="ambient"]').length,
      ownShapes: $('[data-bubbles] [data-tone]').length,
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('places each Abyss bubble like every creature group: the group at its centre, each bubble at its own size times the group scale', () => {
    // ARRANGE
    const at = [
      { x: 10, y: -20, s: 0.5 },
      { x: -6, y: 30, s: 1 },
    ];
    const expected = {
      group: 'translate(680 560)',
      bubbles: ['translate(10 -20) scale(0.75 0.75)', 'translate(-6 30) scale(1.5 1.5)'],
    };
    // ACT
    const $ = render(createElement(Bubbles, { x: 680, y: 560, at, scale: 1.5 }));
    const seen = {
      group: $('[data-bubbles]').attr('transform'),
      bubbles: $('[data-bubbles] > g')
        .map((_, member) => $(member).attr('transform'))
        .get(),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('draws both the sun and the moon, so the theme alone picks which shows', () => {
    // ARRANGE
    const expected = { day: 1, night: 1 };
    // ACT
    const $ = render(createElement(SunMoon, { x: 1000, y: 120 }));
    const seen = { day: $('[data-sky-day]').length, night: $('[data-sky-night]').length };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('draws as many light rays as asked, none of them moving', () => {
    // ARRANGE
    const expected = { rays: 4, moving: 0 };
    // ACT
    const $ = render(createElement(LightRays, { x: 120, y: 400, count: 4 }));
    const seen = { rays: $('[data-ray]').length, moving: $(MOTION).length };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('paints each row of tone and outline as one path, in paint order, its tone on the hook the Slide names', () => {
    // ARRANGE
    const facets = [
      ['room', 'M0 0 L1 0 Z'],
      ['floor-lit', 'M0 1 L1 1 Z'],
    ] as const;
    const expected = [
      ['room', 'M0 0 L1 0 Z'],
      ['floor-lit', 'M0 1 L1 1 Z'],
    ];
    // ACT
    const $ = render(createElement(ToneFacets, { facets, toneAttribute: 'data-lp', part: 'room' }));
    const seen = $('g[data-part="room"] path')
      .toArray()
      .map((path) => [$(path).attr('data-lp'), $(path).attr('d')]);
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('names the tone on data-tone and adds no group when the Slide names no part', () => {
    // ARRANGE
    const expected = { groups: 0, tone: 'sky-1' };
    // ACT
    const $ = render(createElement(ToneFacets, { facets: [['sky-1', 'M0 0 Z']] }));
    // ASSERT
    expect({ groups: $('g').length, tone: $('path').attr('data-tone') }).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('refuses a school of a fractional count', () => {
    // ARRANGE
    const expected = /whole count/;
    // ACT
    const draw = () => render(createElement(FishSchool, { x: 0, y: 0, count: 1.5 }));
    // ASSERT
    expect(draw).toThrow(expected);
  });
});

describe('edge cases', () => {
  it('draws only the keel below the waterline, stretched to its depth scale', () => {
    // ARRANGE
    const expected = { tip: 0, glow: 0, keel: 'scale(1 1.4)' };
    // ACT
    const $ = render(createElement(Iceberg, { part: 'keel', x: 0, waterline: 0, depthScale: 1.4 }));
    const seen = { tip: $(TIP).length, glow: $(GLOW).length, keel: $(KEEL).attr('transform') };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('never moves the iceberg: it carries no motion hook', () => {
    // ARRANGE
    const expected = 0;
    // ACT
    const moving = render(createElement(Iceberg, { x: 0, waterline: 0 }))(MOTION).length;
    // ASSERT
    expect(moving).toBe(expected);
  });

  it('places explicit fish where the Scene says, ignoring count and seed', () => {
    // ARRANGE
    const at = [{ x: 10, y: -4, s: 1 }];
    const expected = ['translate(10 -4) scale(-2 2)'];
    // ACT
    const $ = render(createElement(FishSchool, { x: 0, y: 0, at, count: 9, scale: 2, flip: true }));
    const placed = $('[data-fish]')
      .toArray()
      .map((fish) => $(fish).attr('transform'));
    // ASSERT
    expect(placed).toEqual(expected);
  });
});
