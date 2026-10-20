import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ContextGrid, GridSwatch, type ContextGridProps } from './context-grid';

function grid(props: ContextGridProps): string {
  return renderToStaticMarkup(createElement(ContextGrid, props));
}

/** How many boxes the grid draws, and how many of them carry every one of the given classes. */
function boxes(html: string, classNames?: string): number {
  const all = [...html.matchAll(/<li class="([^"]*)"/g)].map(([, classes]) => classes.split(' '));
  const wanted = classNames?.split(' ') ?? [];
  return all.filter((classes) => wanted.every((name) => classes.includes(name))).length;
}

describe('success cases', () => {
  it('draws one box per unit of its runs, in order, labelled as a list', () => {
    // ARRANGE
    const expected = { total: 100, instructions: 17, faded: 43 };
    const label = 'aria-label="The window, 100 boxes"';
    // ACT
    const html = grid({
      label: 'The window, 100 boxes',
      size: 'lg',
      runs: [
        { tone: 'instructions', count: 17 },
        { tone: 'memory', count: 1 },
        { tone: 'messages', count: 1 },
        { tone: 'faded', count: 43 },
        { tone: 'tools', count: 2 },
        { tone: 'free', count: 28 },
        { tone: 'buffer', count: 8 },
      ],
    });
    // ASSERT
    expect(boxes(html)).toBe(expected.total);
    expect(boxes(html, 'bg-machine')).toBe(expected.instructions);
    expect(boxes(html, 'bg-muted-foreground/25')).toBe(expected.faded);
    expect(html).toContain(label);
  });

  it('crosses every box kept free for summaries, and only those', () => {
    // ARRANGE
    const expected = 8;
    // ACT
    const html = grid({
      label: 'x',
      size: 'md',
      runs: [
        { tone: 'free', count: 3 },
        { tone: 'buffer', count: 8 },
      ],
    });
    // ASSERT
    expect(html.match(/<svg/g)?.length).toBe(expected);
  });

  it('draws a legend swatch in the tone of its boxes', () => {
    // ARRANGE
    const expected = 'bg-human';
    // ACT
    const html = renderToStaticMarkup(createElement(GridSwatch, { tone: 'messages' }));
    // ASSERT
    expect(html).toContain(expected);
  });
});

describe('failure cases', () => {
  it('rings only the boxes of a ringed run', () => {
    // ARRANGE
    const expected = 27;
    const ring = 'ring-1 ring-primary';
    // ACT
    const html = grid({
      label: 'x',
      size: 'md',
      runs: [
        { tone: 'faded', count: 8 },
        { tone: 'tools', count: 27, ring: 'span' },
        { tone: 'faded', count: 10 },
      ],
    });
    // ASSERT
    expect(boxes(html, ring)).toBe(expected);
  });
});

describe('edge cases', () => {
  it('draws a run of no units as no boxes', () => {
    // ARRANGE
    const expected = 1;
    // ACT
    const html = grid({
      label: 'x',
      size: 'sm',
      runs: [
        { tone: 'lit', count: 0 },
        { tone: 'lit', count: 1, ring: 'point' },
      ],
    });
    // ASSERT
    expect(boxes(html)).toBe(expected);
  });
});
