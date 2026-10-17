import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { DealEcho, type DealEchoProps } from './deal-echo';

function echo(props: DealEchoProps): string {
  return renderToStaticMarkup(createElement(DealEcho, props));
}

/** The visible text of rendered markup, tags dropped and whitespace collapsed. */
function textOf(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

describe('success cases', () => {
  it('draws one lane per stage, its notes and counts in order, and the cycle under them', () => {
    // ARRANGE
    const expected = '27 3 1 27:1 over ≈ 9.5 months';
    const laneCount = 4;
    const lane = /data-echo="lane"/g;
    const slot = /data-echo="slot"/g;
    const cycleMark = 'data-echo="cycle"';
    // ACT
    const html = echo({
      lanes: [
        { slug: 'leads', count: { value: '27' } },
        { slug: 'opportunities', count: { value: '3' } },
        { slug: 'closing', count: { value: '1', primary: true } },
        { slug: 'payment', slot: { kind: 'payment' } },
      ],
      cycle: '27:1 over ≈ 9.5 months',
    });
    // ASSERT
    expect(textOf(html)).toBe(expected);
    expect(html.match(lane)).toHaveLength(laneCount);
    expect(html.match(slot)).toHaveLength(1);
    expect(html).toContain(cycleMark);
  });

  it('rings the lane that changed and tints a note as cash', () => {
    // ARRANGE
    const expected = ['data-ringed="true"', 'data-tint="cash"', '€0'];
    const ringed = /data-ringed="true"/g;
    // ACT
    const html = echo({
      lanes: [
        { slug: 'leads' },
        { slug: 'opportunities' },
        { slug: 'closing' },
        { slug: 'payment', ringed: true, notes: [{ slug: 'cash', text: '€0', tint: 'cash' }] },
      ],
    });
    // ASSERT
    expect(expected.filter((part) => !html.includes(part))).toEqual([]);
    expect(html.match(ringed)).toHaveLength(1);
  });
});

describe('failure cases', () => {
  it('refuses to ring more than the one lane that changed', () => {
    // ARRANGE
    const expected = /rings 2 lanes/;
    // ACT
    const render = () =>
      echo({
        lanes: [
          { slug: 'leads', ringed: true },
          { slug: 'payment', ringed: true },
        ],
      });
    // ASSERT
    expect(render).toThrow(expected);
  });
});

describe('edge cases', () => {
  it('stays decoration: hidden from assistive tech, with no cycle unless given', () => {
    // ARRANGE
    const expected = 'aria-hidden="true"';
    const root = /^<div/;
    const cycleMark = 'data-echo="cycle"';
    const note = /data-echo="note"/g;
    const noteCount = 2;
    // ACT
    const html = echo({ lanes: [{ slug: 'leads', notes: [{ slug: 'a' }, { slug: 'b' }] }] });
    // ASSERT
    expect(html).toMatch(root);
    expect(html).toContain(expected);
    expect(html).not.toContain(cycleMark);
    expect(html.match(note)).toHaveLength(noteCount);
  });
});
