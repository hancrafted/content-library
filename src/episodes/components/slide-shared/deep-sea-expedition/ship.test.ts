import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Ship, type ShipProps } from './ship';

/*
 * The research ship: an SVG group a Scene places in its own `<svg>`. It draws no people; the Scene passes them in as
 * bridge and deck figures, painted between the ship's layers. Its rock is the one ambient loop.
 */

const draw = (props: ShipProps) => load(renderToStaticMarkup(createElement('svg', null, createElement(Ship, props))));

const paintOrder = (props: ShipProps) => {
  const $ = draw(props);
  return $('[data-layer], [data-slot]')
    .toArray()
    .map((el) => $(el).attr('data-layer') ?? `slot:${$(el).attr('data-slot')}`);
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

  it('marks its rock as the ambient loop and places itself by the transform', () => {
    // ARRANGE
    const transform = 'translate(400 200) scale(0.8)';
    const expected = { motion: 'ambient', transform };
    // ACT
    const $ = draw({ transform });
    // ASSERT
    expect({ motion: $('[data-motion]').attr('data-motion'), transform: $('[data-ship]').attr('transform') }).toEqual(
      expected,
    );
  });
});

describe('failure cases', () => {
  it('draws no crew slot when the Scene passes no figures', () => {
    // ARRANGE
    const expected = ['hull', 'superstructure', 'rail'];
    // ACT
    const order = paintOrder({});
    // ASSERT
    expect(order).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('marks a flipped ship and mirrors its hull to the left of amidships', () => {
    // ARRANGE
    const sternPoint = (props: ShipProps) => draw(props)('[data-layer="hull"] polygon').first().attr('points');
    const expected = sternPoint({})
      ?.split(' ')
      .map((pair) => {
        const [x, y] = pair.split(',').map(Number);
        return `${-x},${y}`;
      })
      .join(' ');
    // ACT
    const $ = draw({ flip: true });
    // ASSERT
    expect({
      flip: $('[data-ship]').attr('data-flip'),
      points: $('[data-layer="hull"] polygon').first().attr('points'),
    }).toEqual({
      flip: '',
      points: expected,
    });
  });
});
