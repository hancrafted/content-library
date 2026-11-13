import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Console, type ConsoleProps } from './console';

/*
 * The control-room console: an SVG group a Scene places in its own `<svg>`. A Slide shows its own content on the
 * first screen by passing children, clipped to the glass.
 */

const SCREEN_SLOT = '[data-slot="screen"]';
const SLOT = '[data-slot]';
const SCREEN = '[data-screen]';
const TRACE = '[data-tone="screen-glow"]';
const MUG = '[data-mug]';

const draw = (props: ConsoleProps) =>
  load(renderToStaticMarkup(createElement('svg', null, createElement(Console, props))), { xml: true });

describe('success cases', () => {
  it('draws screen content inside the first screen’s glass, the second keeping its trace', () => {
    // ARRANGE
    const content = createElement('rect', { 'data-skill-file': '', width: 40, height: 20 });
    const expected = { slot: { x: '26', y: '-40', width: '93.6', height: '32' }, content: 1, traces: 1 };
    // ACT
    const $ = draw({ width: 260, children: content });
    const slot = $(SCREEN_SLOT);
    const seen = {
      slot: { x: slot.attr('x'), y: slot.attr('y'), width: slot.attr('width'), height: slot.attr('height') },
      content: slot.find('[data-skill-file]').length,
      traces: $(TRACE).filter((_, el) => $(el).closest(SCREEN).length > 0).length,
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('stands the asked number of mugs on the desk', () => {
    // ARRANGE
    const mugs = 2;
    // ACT
    const standing = draw({ width: 120, mugs })(MUG).length;
    // ASSERT
    expect(standing).toBe(mugs);
  });
});

describe('failure cases', () => {
  it('refuses to draw a desk narrower than a screen and a mug', () => {
    // ARRANGE
    const expected = /at least/;
    // ACT
    const render = () => draw({ width: 10 });
    // ASSERT
    expect(render).toThrow(expected);
  });
});

describe('edge cases', () => {
  it('draws no screen slot and two traces without content, and no mug by default', () => {
    // ARRANGE
    const expected = { slots: 0, traces: 2, mugs: 0 };
    // ACT
    const $ = draw({ width: 200 });
    const seen = { slots: $(SLOT).length, traces: $(`${SCREEN} ${TRACE}`).length, mugs: $(MUG).length };
    // ASSERT
    expect(seen).toEqual(expected);
  });
});
