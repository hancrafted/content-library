import { load } from 'cheerio';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Iceberg } from './iceberg';
import { Bubbles, FishSchool, Jellies, Whale } from './sea-life';
import { LightRays, Seabed } from './seabed';
import { Clouds, SunMoon } from './sky';

/*
 * The slow half of scenery.test.ts: every tone the scenery parts paint, checked against scenery.module.css read from
 * disk. It reads that file rather than importing it, so the slow lane names it as a rerun trigger
 * (vitest.slow.config.mts, ARCH-003-testing §4).
 */

const SCENERY_CSS_FILE = path.join(import.meta.dirname, 'scenery.module.css');

describe('edge cases', () => {
  it('gives every tone a part paints a colour in the scenery palette', () => {
    // ARRANGE
    const css = readFileSync(SCENERY_CSS_FILE, 'utf8');
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
    const unpainted = tones.filter((tone) => !css.includes(`[data-tone='${tone}'] {`));
    // ASSERT
    expect(unpainted).toEqual([]);
  });
});
