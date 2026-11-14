import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ControlRoom, type ControlRoomProps } from './control-room';

/*
 * The control room the pilot's console stands in: scenery only, an SVG group a Scene places in its own `<svg>`, with
 * the cast and the console as children standing on its floor line.
 */

const draw = (props: ControlRoomProps) =>
  load(renderToStaticMarkup(createElement('svg', null, createElement(ControlRoom, props))), { xml: true });

describe('success cases', () => {
  it('draws the wall, the window at its hour and the clock, then the Scene’s own figures in front', () => {
    // ARRANGE
    const figure = createElement('g', { 'data-figure': '' });
    const expected = { facets: 8, window: 'dusk', clocks: 1, lastChild: '' };
    // ACT
    const $ = draw({ time: 'dusk', children: figure });
    const seen = {
      facets: $('[data-control-room] > polygon[data-tone]').length,
      window: $('[data-room-window]').attr('data-room-window'),
      clocks: $('[data-wall-clock]').length,
      lastChild: $('[data-control-room] > *').last().attr('data-figure'),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('shows the day sky with no low sun when no hour is given', () => {
    // ARRANGE
    const expected = { window: 'day', suns: 0 };
    // ACT
    const $ = draw({});
    const seen = {
      window: $('[data-room-window]').attr('data-room-window'),
      suns: $('[data-room-window] circle').length,
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('refuses a window in a room too narrow to hang it', () => {
    // ARRANGE
    const size = { width: 120, height: 100, floor: 90 };
    const expected = /too narrow/;
    // ACT
    const render = () => draw({ size });
    // ASSERT
    expect(render).toThrow(expected);
  });
});

describe('edge cases', () => {
  it('draws a bare corner, no window and no clock, at its own size', () => {
    // ARRANGE
    const size = { width: 240, height: 200, floor: 186 };
    const expected = { windows: 0, clocks: 0, floor: '0,186 240,186 240,200 0,200' };
    // ACT
    const $ = draw({ size, time: false, clock: false });
    const seen = {
      windows: $('[data-room-window]').length,
      clocks: $('[data-wall-clock]').length,
      floor: $('[data-tone="floor"]').attr('points'),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });
});
