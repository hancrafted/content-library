import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { GhostNote, type GhostNoteProps } from './ghost-note';

function render(props: GhostNoteProps) {
  const $ = load(renderToStaticMarkup(createElement(GhostNote, props)));
  return $('[data-board-ghost]');
}

describe('success cases', () => {
  it('marks the empty place a note left as an image named by its label', () => {
    // ARRANGE
    const expected = { role: 'img', name: 'Where Nordwerk was', text: '' };
    // ACT
    const ghost = render({ label: 'Where Nordwerk was' });
    // ASSERT
    expect({ role: ghost.attr('role'), name: ghost.attr('aria-label'), text: ghost.text() }).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('writes its label inside only when asked, so a reader sees what moved', () => {
    // ARRANGE
    const expected = { name: 'Moved', text: 'Moved' };
    // ACT
    const ghost = render({ label: 'Moved', showLabel: true });
    // ASSERT
    expect({ name: ghost.attr('aria-label'), text: ghost.text() }).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('merges the Slide class last and passes its style through for motion and placement', () => {
    // ARRANGE
    const expected = { motion: true, style: '--i:3' };
    // ACT
    const ghost = render({ label: 'Moved', className: 'motion', style: { '--i': 3 } as GhostNoteProps['style'] });
    // ASSERT
    expect({ motion: ghost.hasClass('motion'), style: ghost.attr('style') }).toEqual(expected);
  });
});
