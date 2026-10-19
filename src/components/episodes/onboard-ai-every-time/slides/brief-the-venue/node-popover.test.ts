import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { NodePopover, type NodeCopy } from './node-popover.client';

const COPY: NodeCopy = {
  title: 'Summer party',
  in: 'the whole party.',
  out: 'five pieces.',
  inLabel: 'In:',
  outLabel: 'Out:',
};

function render(label = 'Summer party'): string {
  return renderToStaticMarkup(createElement(NodePopover, { copy: COPY, className: 'x', children: label }));
}

describe('success cases', () => {
  it('is a button that says it opens a popover, closed at rest', () => {
    // ARRANGE
    const expected = ['<button type="button"', 'aria-expanded="false"', 'aria-haspopup="dialog"'];
    // ACT
    const html = render();
    // ASSERT
    expect(expected.filter((part) => !html.includes(part))).toEqual([]);
  });
});

describe('failure cases', () => {
  it('renders no popover before it is pressed, so the static page shows the graph at rest', () => {
    // ARRANGE
    const popover = 'role="dialog"';
    // ACT
    const html = render();
    // ASSERT
    expect(html).not.toContain(popover);
  });
});

describe('edge cases', () => {
  it('shows its label as the visible button text', () => {
    // ARRANGE
    const label = 'Venue 1';
    // ACT
    const html = render(label);
    // ASSERT
    expect(html).toContain(`>${label}</button>`);
  });
});
