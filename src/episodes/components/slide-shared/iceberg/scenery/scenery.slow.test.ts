import { load } from 'cheerio';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Bubbles } from './bubbles';
import { LightRays, Seabed } from './seabed';

// decision: ARCH-003 §4
const SCENERY_CSS_FILE = path.join(import.meta.dirname, 'scenery.module.css');

describe('edge cases', () => {
  it('gives every tone a part paints a colour in the scenery palette', () => {
    // ARRANGE
    const css = readFileSync(SCENERY_CSS_FILE, 'utf8');
    const $ = load(
      [
        createElement(Bubbles, { x: 0, y: 0 }),
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
