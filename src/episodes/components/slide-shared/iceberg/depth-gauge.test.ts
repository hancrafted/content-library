import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { DepthGauge } from './depth-gauge';
import type { ZoneLabelWords } from './zone-words.pure';

const TWILIGHT: ZoneLabelWords = { name: 'Twilight', metres: '200–1,000 m', science: 'mesopelagic' };
const SURFACE: ZoneLabelWords = { name: 'Surface', metres: '0 m', science: 'the sea surface and the air above it' };
const ABYSS: ZoneLabelWords = { name: 'Abyss', metres: '4,000–6,000 m', science: 'abyssopelagic' };

const html = (element: Parameters<typeof renderToStaticMarkup>[0]) => load(renderToStaticMarkup(element));

describe('success cases', () => {
  it('draws the five zones as one strip from the Surface down, each in its own colour, the current one marked', () => {
    // ARRANGE
    const expected = [
      { zone: 'surface', colour: '--zone:var(--zone-surface)', current: undefined },
      { zone: 'sunlit', colour: '--zone:var(--zone-sunlit)', current: undefined },
      { zone: 'twilight', colour: '--zone:var(--zone-twilight)', current: '' },
      { zone: 'midnight', colour: '--zone:var(--zone-midnight)', current: undefined },
      { zone: 'abyss', colour: '--zone:var(--zone-abyss)', current: undefined },
    ];
    // ACT
    const $ = html(createElement(DepthGauge, { zone: 'twilight', words: TWILIGHT, label: 'Depth gauge' }));
    const seen = $('[data-gauge-zone]')
      .toArray()
      .map((segment) => ({
        zone: $(segment).attr('data-gauge-zone'),
        colour: $(segment).attr('style'),
        current: $(segment).attr('data-current'),
      }));
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('names only the current zone, in its plain word, as the button that opens its depth and ocean term', () => {
    // ARRANGE
    const expected = { label: 'Depth gauge', names: ['Twilight'], text: 'Twilight', buttons: 1 };
    // ACT
    const $ = html(createElement(DepthGauge, { zone: 'twilight', words: TWILIGHT, label: 'Depth gauge' }));
    const seen = {
      label: $('[data-depth-gauge]').attr('aria-label'),
      names: $('[data-zone-label]')
        .toArray()
        .map((name) => $(name).text()),
      text: $('[data-gauge-reading]').text(),
      buttons: $('[data-gauge-reading] button[data-zone-label]').length,
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('carries no Section tiles and keeps its colour strip from assistive tech, which reads the name alone', () => {
    // ARRANGE
    const expected = { tiles: 0, strip: 'true' };
    // ACT
    const $ = html(createElement(DepthGauge, { zone: 'twilight', words: TWILIGHT, label: 'Depth gauge' }));
    const seen = { tiles: $('[data-tile]').length, strip: $('[data-gauge-strip]').attr('aria-hidden') };
    // ASSERT
    expect(seen).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('hangs the strip from the current band, the Surface at its top and the Abyss at its bottom', () => {
    // ARRANGE
    const expected = ['--at:0', '--at:4'];
    // ACT
    const at = (zone: 'surface' | 'abyss', words: ZoneLabelWords) =>
      html(createElement(DepthGauge, { zone, words, label: 'Depth gauge' }))('[data-depth-gauge]').attr('style');
    const seen = [at('surface', SURFACE), at('abyss', ABYSS)];
    // ASSERT
    expect(seen).toEqual(expected);
  });
});
