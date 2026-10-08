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
