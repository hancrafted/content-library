import { load } from 'cheerio';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement, type ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Clouds } from './clouds';
import { animatedProperties, blursAndShadows, globalsRead } from './fable-contract.test-support';
import { FishSchool } from './fish-school';
import { Iceberg } from './iceberg';
import { Jellies } from './jellies';
import { Lanternfish } from './lanternfish';
import { Siphonophore } from './siphonophore';
import { SunMoon } from './sun-moon';
import { Whale } from './whale';

/*
 * The slow half of fable-elements.test.ts: each Fable element's CSS module, read from disk, against its frozen
 * interface (decisions 15–17 and 19 of feedback 2). It mixes only from the tokens its JSDoc names, paints every tone
 * its drawing names, and moves only by transform or opacity, with no blur, filter or shadow. It reads the CSS rather
 * than importing it, so the slow lane names the modules as rerun triggers (vitest.slow.config.mts, ARCH-003 §4). The
 * ship's own check sits beside it, in deep-sea-expedition/ship.slow.test.ts.
 */

const HERE = import.meta.dirname;

/** Each element, its CSS module and the global tokens it may mix from. */
const ELEMENTS: readonly { name: string; element: ReactElement; file: string; tokens: readonly string[] }[] = [
  {
    name: 'Iceberg',
    element: createElement(Iceberg, { x: 0, waterline: 0 }),
    file: 'iceberg.module.css',
    tokens: ['--info', '--on-brand-accent', '--overlay'],
  },
  {
    name: 'Clouds',
    element: createElement(Clouds, {}),
    file: 'clouds.module.css',
    tokens: ['--info', '--on-brand-accent', '--overlay'],
  },
  {
    name: 'SunMoon',
    element: createElement(SunMoon, { x: 0, y: 0 }),
    file: 'sun-moon.module.css',
    tokens: ['--bulb', '--info', '--on-brand-accent', '--overlay'],
  },
  {
    name: 'FishSchool',
    element: createElement(FishSchool, { x: 0, y: 0 }),
    file: 'fish-school.module.css',
    tokens: ['--bulb', '--info', '--on-brand-accent', '--overlay'],
  },
  {
    name: 'Jellies',
    element: createElement(Jellies, { x: 0, y: 0 }),
    file: 'jellies.module.css',
    tokens: ['--info', '--on-brand-accent', '--overlay'],
  },
  {
    name: 'Whale',
    element: createElement(Whale, { x: 0, y: 0 }),
    file: 'whale.module.css',
    tokens: ['--info', '--bulb', '--on-brand-accent', '--overlay'],
  },
  {
    name: 'Lanternfish',
    element: createElement(Lanternfish, { x: 0, y: 0 }),
    file: 'lanternfish.module.css',
    tokens: ['--info', '--on-brand-accent', '--overlay'],
  },
  {
    name: 'Siphonophore',
    element: createElement(Siphonophore, { x: 0, y: 0 }),
    file: 'siphonophore.module.css',
    tokens: ['--info', '--on-brand-accent', '--overlay'],
  },
];

const read = (file: string) => readFileSync(path.join(HERE, file), 'utf8');

describe('success cases', () => {
  it.each(ELEMENTS)('mixes the $name only from the tokens its interface names', ({ file, tokens }) => {
    // ARRANGE
    const css = read(file);
    // ACT
    const strays = globalsRead(css).filter((token) => !tokens.includes(token));
    // ASSERT
    expect(strays).toEqual([]);
  });
});

describe('failure cases', () => {
  it.each(ELEMENTS)('gives the $name no blur, filter or shadow (decision 19)', ({ file }) => {
    // ARRANGE
    const css = read(file);
    // ACT
    const found = blursAndShadows(css);
    // ASSERT
    expect(found).toEqual([]);
  });

  it.each(ELEMENTS)('moves the $name only by transform or opacity (decision 19)', ({ file }) => {
    // ARRANGE
    const allowed = ['transform', 'opacity'];
    // ACT
    const others = animatedProperties(read(file)).filter((property) => !allowed.includes(property));
    // ASSERT
    expect(others).toEqual([]);
  });
});

describe('edge cases', () => {
  it.each(ELEMENTS)('declares every $name colour as a mix of tokens, none left without a value', ({ file }) => {
    // ARRANGE
    const css = read(file);
    // ACT
    const hollow = [...css.matchAll(/(--[a-z-]+):\s*([^;]+);/g)]
      .filter(([, , value]) => !value!.includes('var(--'))
      .map(([, name]) => name);
    // ASSERT
    expect(hollow).toEqual([]);
  });

  it.each(ELEMENTS)('paints every tone the $name names', ({ element, file }) => {
    // ARRANGE
    const css = read(file);
    const $ = load(renderToStaticMarkup(createElement('svg', null, element)));
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
