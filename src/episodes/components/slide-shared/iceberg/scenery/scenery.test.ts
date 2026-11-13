import { load } from 'cheerio';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement, type ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Iceberg } from './iceberg';
import { Bubbles, FishSchool, Jellies, Whale } from './sea-life';
import { LightRays, Seabed } from './seabed';
import { Clouds, SunMoon } from './sky';

/*
 * The scenery parts `ZoneScene` draws: the iceberg by part, the sea life with its one ambient loop each, the sky's
 * clouds and its sun and moon, the seabed and the light rays. Rendered to static markup, as a Scene's server render
 * does, and read by their `data-*` hooks.
 */

const render = (element: ReactElement) => load(renderToStaticMarkup(createElement('svg', null, element)));

const SCENERY_CSS = readFileSync(path.join(import.meta.dirname, 'scenery.module.css'), 'utf8');

describe('success cases', () => {
  it('draws the tip, the keel and the waterline glow for the whole iceberg, on the waterline', () => {
    // ARRANGE
    const expected = { tip: 1, keel: 1, glow: 1, transform: 'translate(900 400) scale(1)' };
    // ACT
    const $ = render(createElement(Iceberg, { x: 900, waterline: 400 }));
    // ASSERT
    expect({
      tip: $('[data-iceberg-tip]').length,
      keel: $('[data-iceberg-keel]').length,
      glow: $('[data-iceberg-glow]').length,
      transform: $('[data-iceberg]').attr('transform'),
    }).toEqual(expected);
  });

  it('marks each creature loop as ambient, so a check finds every moving part', () => {
    // ARRANGE
    const expected = { school: 1, jellies: 2, whale: 1, bubbles: 7, clouds: 3 };
    // ACT
    const count = (element: ReactElement) => render(element)('[data-motion="ambient"]').length;
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

  it('draws both the sun and the moon, so the theme alone picks which shows', () => {
    // ARRANGE
    const expected = { day: 1, night: 1 };
    // ACT
    const $ = render(createElement(SunMoon, { x: 1000, y: 120 }));
    // ASSERT
    expect({ day: $('[data-sky-day]').length, night: $('[data-sky-night]').length }).toEqual(expected);
  });

  it('draws as many light rays as asked, none of them moving', () => {
    // ARRANGE
    const expected = { rays: 4, moving: 0 };
    // ACT
    const $ = render(createElement(LightRays, { x: 120, y: 400, count: 4 }));
    // ASSERT
    expect({ rays: $('[data-ray]').length, moving: $('[data-motion]').length }).toEqual(expected);
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
    // ASSERT
    expect({
      tip: $('[data-iceberg-tip]').length,
      glow: $('[data-iceberg-glow]').length,
      keel: $('[data-iceberg-keel]').attr('transform'),
    }).toEqual(expected);
  });

  it('never moves the iceberg: it carries no motion hook', () => {
    // ARRANGE
    const expected = 0;
    // ACT
    const $ = render(createElement(Iceberg, { x: 0, waterline: 0 }));
    // ASSERT
    expect($('[data-motion]').length).toBe(expected);
  });

  it('places explicit fish where the Scene says, ignoring count and seed', () => {
    // ARRANGE
    const at = [{ x: 10, y: -4, s: 1 }];
    const expected = ['translate(10 -4) scale(-2 2)'];
    // ACT
    const $ = render(createElement(FishSchool, { x: 0, y: 0, at, count: 9, scale: 2, flip: true }));
    // ASSERT
    expect(
      $('[data-fish]')
        .toArray()
        .map((fish) => $(fish).attr('transform')),
    ).toEqual(expected);
  });

  it('gives every tone a part paints a colour in the scenery palette', () => {
    // ARRANGE
    const $ = load(
      [
        createElement(Iceberg, { x: 0, waterline: 0 }),
        createElement(FishSchool, { x: 0, y: 0 }),
        createElement(Jellies, { x: 0, y: 0 }),
        createElement(Whale, { x: 0, y: 0 }),
        createElement(Bubbles, { x: 0, y: 0 }),
        createElement(Clouds, {}),
        createElement(SunMoon, { x: 0, y: 0 }),
        createElement(Seabed, { y: 0 }),
        createElement(LightRays, { x: 0, y: 0 }),
      ]
        .map((element) => renderToStaticMarkup(createElement('svg', null, element)))
        .join(''),
    );
    const tones = [
      ...new Set(
        $('[data-tone]')
          .toArray()
          .map((node) => $(node).attr('data-tone')),
      ),
    ];
    // ACT
    const unpainted = tones.filter((tone) => !SCENERY_CSS.includes(`[data-tone='${tone}'] {`));
    // ASSERT
    expect(unpainted).toEqual([]);
  });
});
