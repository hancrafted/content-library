import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { SlideMountView } from './slide-mount.client';

const render = (zone: 'far' | 'near' | 'active', heldHeight = 1800) =>
  renderToStaticMarkup(
    createElement(SlideMountView, { id: 'a--b', zone, heldHeight, children: createElement('p', null, 'content') }),
  );

describe('success cases', () => {
  it.each(['near', 'active'] as const)('renders the content in %s without holding a height', (zone) => {
    // ARRANGE
    const heldHeight = 1800;
    // ACT
    const html = render(zone, heldHeight);
    // ASSERT
    expect(html).toContain('<p>content</p>');
    expect(html).not.toContain('min-height');
  });
});

describe('failure cases', () => {
  it('carries no entrance on an Episode whose Scenes author their own header', () => {
    // ARRANGE
    const zone = 'active';
    // ACT
    const html = render(zone);
    // ASSERT
    expect(html).not.toContain('data-entry');
  });

  it('exposes the zone for the browser and the post-build check', () => {
    // ARRANGE
    const zone = 'active';
    // ACT
    const html = render(zone);
    // ASSERT
    expect(html).toContain('data-zone="active"');
  });
});

describe('edge cases', () => {
  it('exposes the entrance state, so CSS hides a Slide not yet entered and plays it once', () => {
    // ARRANGE
    const expected = 'data-entry="pending"';
    // ACT
    const html = renderToStaticMarkup(
      createElement(SlideMountView, {
        id: 'a--b',
        zone: 'near',
        heldHeight: 0,
        entry: 'pending',
        children: createElement('p', null, 'content'),
      }),
    );
    // ASSERT
    expect(html).toContain(expected);
  });

  it('drops the content while far and holds the measured height', () => {
    // ARRANGE
    const heldHeight = 1800;
    // ACT
    const html = render('far', heldHeight);
    // ASSERT
    expect(html).not.toContain('content');
    expect(html).toContain('min-height:1800px');
  });
});
