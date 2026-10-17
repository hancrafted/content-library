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
    // ACT
    const html = echo({
      lanes: [
        { slug: 'leads', count: '27' },
        { slug: 'opportunities', count: '3' },
        { slug: 'closing', count: '1', ringed: true },
        { slug: 'payment', slot: true },
      ],
      cycle: '27:1 over ≈ 9.5 months',
    });
    // ASSERT
    expect(textOf(html)).toBe(expected);
    expect(html.match(/data-echo="lane"/g)).toHaveLength(laneCount);
    expect(html.match(/data-echo="slot"/g)).toHaveLength(1);
    expect(html).toContain('data-echo="cycle"');
  });

  it('rings the lane that changed and tints a note by its tone', () => {
    // ARRANGE
    const expected = ['data-ringed="true"', 'data-tone="warning"', '€0'];
    // ACT
    const html = echo({
      lanes: [
        { slug: 'leads' },
        { slug: 'opportunities' },
        { slug: 'closing' },
        { slug: 'payment', ringed: true, notes: [{ slug: 'cash', text: '€0', tone: 'warning' }] },
      ],
    });
    // ASSERT
    expect(expected.filter((part) => !html.includes(part))).toEqual([]);
    expect(html.match(/data-ringed="true"/g)).toHaveLength(1);
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
    const noteCount = 2;
    // ACT
    const html = echo({ lanes: [{ slug: 'leads', notes: [{ slug: 'a' }, { slug: 'b' }] }] });
    // ASSERT
    expect(html.startsWith('<div') && html.includes(expected)).toBe(true);
    expect(html).not.toContain('data-echo="cycle"');
    expect(html.match(/data-echo="note"/g)).toHaveLength(noteCount);
  });
});
