import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Travel } from './travel';
import { ZoneScene } from './zone-scene';

/*
 * `ZoneScene` as a Slide's server render draws it (design-ADR 0025): one `zone` prop picks the scenery the scenery
 * parts draw, the Slide's figures sit inside its SVG, and the Scene reports its motion for browser checks.
 */

const render = (props: Parameters<typeof ZoneScene>[0]) => load(renderToStaticMarkup(createElement(ZoneScene, props)));

const SCENE = '[data-scene]';

describe('success cases', () => {
  it('draws the Surface sky with the sun and moon, the whole iceberg and the clouds that carry its wind', () => {
    // ARRANGE
    const expected = { zone: 'surface', sky: 1, sunMoon: 1, iceberg: 'whole', clouds: 3, seabed: 0 };
    // ACT
    const $ = render({ zone: 'surface' });
    const seen = {
      zone: $(SCENE).attr('data-depth-zone'),
      sky: $('[data-band="sky"]').length,
      sunMoon: $('[data-sun-moon]').length,
      iceberg: $('[data-iceberg]').attr('data-iceberg'),
      clouds: $('[data-cloud]').length,
      seabed: $('[data-seabed]').length,
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('draws the Abyss with its seabed and rising bubbles, and no sky', () => {
    // ARRANGE
    const expected = { sky: 0, seabed: 1, bubbles: 1, iceberg: 0 };
    // ACT
    const $ = render({ zone: 'abyss' });
    const seen = {
      sky: $('[data-band="sky"]').length,
      seabed: $('[data-seabed]').length,
      bubbles: $('[data-bubbles]').length,
      iceberg: $('[data-iceberg]').length,
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('places the Slide figures inside its drawing and its words over it', () => {
    // ARRANGE
    const expected = { figure: 1, travel: 'travel', overlay: 'Twilight' };
    // ACT
    const $ = render({
      zone: 'twilight',
      children: createElement(Travel, { from: '-20% 0%', children: createElement('g', { 'data-figure': '' }) }),
      overlay: createElement('p', { 'data-words': '' }, 'Twilight'),
    });
    const seen = {
      figure: $('svg [data-travel] [data-figure]').length,
      travel: $('[data-travel]').attr('data-motion'),
      overlay: $(`${SCENE} > [data-words]`).text(),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('rests idle in the static page, so nothing plays until its Slide turns active', () => {
    // ARRANGE
    const expected = 'idle';
    // ACT
    const motion = render({ zone: 'midnight' })(SCENE).attr('data-motion');
    // ASSERT
    expect(motion).toBe(expected);
  });
});

describe('edge cases', () => {
  it('names the picture for assistive tech only when the Slide gives it words, and hides it otherwise', () => {
    // ARRANGE
    const label = 'A whale glides through dark water';
    const expected = [
      { role: 'img', name: label, hidden: undefined },
      { role: undefined, name: undefined, hidden: 'true' },
    ];
    // ACT
    const seen = [render({ zone: 'midnight', label }), render({ zone: 'midnight' })].map(($) => ({
      role: $('svg').first().attr('role'),
      name: $('svg').first().attr('aria-label'),
      hidden: $('svg').first().attr('aria-hidden'),
    }));
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('keeps calm water where a Slide drops the zone loop', () => {
    // ARRANGE
    const expected = 0;
    // ACT
    const fish = render({ zone: 'sunlit', ambient: false })('[data-fish-school]').length;
    // ASSERT
    expect(fish).toBe(expected);
  });
});
