import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Ship, type ShipProps } from './ship';

/*
 * The research ship: an SVG group a Scene places in its own `<svg>`. It draws no people; the Scene passes them in as
 * bridge and deck figures, painted between the ship's layers. Its rock is opt-in: a Surface Slide asks for it, so a
 * ship placed anywhere else stays still.
 */

const draw = (props: ShipProps) => load(renderToStaticMarkup(createElement('svg', null, createElement(Ship, props))));

const paintOrder = (props: ShipProps) => {
  const $ = draw(props);
  return $('[data-layer], [data-slot]')
    .toArray()
    .map((el) => $(el).attr('data-layer') ?? `slot:${$(el).attr('data-slot')}`);
};

const MOTION = '[data-motion]';
const motions = (props: ShipProps) => {
  const $ = draw(props);
  return $(MOTION)
    .toArray()
    .map((el) => $(el).attr('data-motion'));
};

describe('success cases', () => {
  it('paints the bridge crew between the hull and the window frame, the deck crew behind the rail', () => {
    // ARRANGE
    const crew = createElement('circle', { r: 4 });
    const expected = ['hull', 'slot:bridge', 'superstructure', 'slot:deck', 'rail'];
    // ACT
    const order = paintOrder({ bridge: crew, deck: crew });
    // ASSERT
    expect(order).toEqual(expected);
  });

  it('rocks when the Surface Slide asks for it, marking the rock as the ambient loop', () => {
    // ARRANGE
    const expected = ['ambient'];
    // ACT
    const seen = motions({ rock: true });
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('places itself by the transform', () => {
    // ARRANGE
    const transform = 'translate(400 200) scale(0.8)';
    // ACT
    const placed = draw({ transform })('[data-ship]').attr('transform');
    // ASSERT
    expect(placed).toBe(transform);
  });
});

describe('failure cases', () => {
  it('stays still when the Slide does not ask for the rock, so a ship outside the Surface never rocks', () => {
    // ARRANGE
    const props = { transform: 'translate(400 200)' };
    // ACT
    const seen = motions(props);
    // ASSERT
    expect(seen).toEqual([]);
  });
});

describe('edge cases', () => {
  it('draws no crew slot when the Scene passes no figures', () => {
    // ARRANGE
    const expected = ['hull', 'superstructure', 'rail'];
    // ACT
    const order = paintOrder({});
    // ASSERT
    expect(order).toEqual(expected);
  });

  it('marks a flipped ship and mirrors its hull to the left of amidships', () => {
    // ARRANGE
    const expected = { flip: '', points: '144,-26 -150,-34 -178,-40 -160,-22 126,-14' };
    // ACT
    const $ = draw({ flip: true });
    const seen = {
      flip: $('[data-ship]').attr('data-flip'),
      points: $('[data-layer="hull"] polygon').first().attr('points'),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });
});
