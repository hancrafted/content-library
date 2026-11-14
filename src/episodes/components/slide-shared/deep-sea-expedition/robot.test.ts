import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Robot, type RobotProps } from './robot';

/*
 * The diving robot, the AI of "What lies below the waterline": an SVG group a Scene places in its own <svg>. Its lamp
 * lights a beam, its motion plays once inside the figure, and its mood and words attach at its head anchor.
 */

const draw = (props: RobotProps) => {
  const $ = load(renderToStaticMarkup(createElement('svg', null, createElement(Robot, props))), { xml: true });
  return {
    beam: $('[data-beam]').length,
    lens: $('[data-lens]').attr('data-lens'),
    moving: $('[data-motion]')
      .toArray()
      .map((node) => [$(node).attr('data-robot-part'), $(node).attr('data-motion')]),
    head: $('[data-head]').attr('data-head'),
    flip: $('[data-robot-body]').attr('transform'),
    mood: $('[data-robot]').attr('data-mood'),
    bubbleAt: $('[data-says-bubble] > g').attr('transform'),
  };
};

describe('success cases', () => {
  it('rests with its lamp lit and its beam drawn, nothing moving', () => {
    // ARRANGE
    const expected = { beam: 1, lens: 'lit', moving: [] };
    // ACT
    const { beam, lens, moving } = draw({});
    // ASSERT
    expect({ beam, lens, moving }).toEqual(expected);
  });

  it('marks the beam as the moving part of a scan', () => {
    // ARRANGE
    const expected = [['beam', 'scan']];
    // ACT
    const { moving } = draw({ motion: 'scan' });
    // ASSERT
    expect(moving).toEqual(expected);
  });

  it('marks the whole robot as the moving part of a dive', () => {
    // ARRANGE
    const expected = [['whole', 'dive']];
    // ACT
    const { moving } = draw({ motion: 'dive' });
    // ASSERT
    expect(moving).toEqual(expected);
  });

  it('attaches its mood at the head anchor above the dome', () => {
    // ARRANGE
    const expected = { head: '19,2', mood: 'confused' };
    // ACT
    const { head, mood } = draw({ mood: 'confused' });
    // ASSERT
    expect({ head, mood }).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('refuses to switch the beam on with the lamp off', () => {
    // ARRANGE
    const expected = /lamp on/;
    // ACT
    const render = () => draw({ motion: 'beam-on', lamp: false });
    // ASSERT
    expect(render).toThrow(expected);
  });
});

describe('edge cases', () => {
  it('draws a dark lens and no beam with the lamp off', () => {
    // ARRANGE
    const expected = { beam: 0, lens: 'off' };
    // ACT
    const { beam, lens } = draw({ lamp: false });
    // ASSERT
    expect({ beam, lens }).toEqual(expected);
  });

  it('mirrors the body but not its words when it faces left', () => {
    // ARRANGE
    const expected = { flip: 'scale(-1 1)', head: '-19,2' };
    // ACT
    const { flip, head } = draw({ flip: true, says: 'Where am I?' });
    // ASSERT
    expect({ flip, head }).toEqual(expected);
  });

  it('raises its speech bubble on the left when it faces left, as a flipped Character does', () => {
    // ARRANGE
    const expected = 'translate(-10 -14)';
    // ACT
    const { bubbleAt } = draw({ flip: true, says: 'Where am I?' });
    // ASSERT
    expect(bubbleAt).toBe(expected);
  });

  it('places no head anchor when it neither feels nor speaks', () => {
    // ARRANGE
    const expected = undefined;
    // ACT
    const { head } = draw({});
    // ASSERT
    expect(head).toBe(expected);
  });
});
