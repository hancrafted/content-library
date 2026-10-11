import { EPISODE_PORTAL_ROOT_ID } from '@/lib/episode-portal.pure';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ContentArea } from './content-area';

/** The Content area with one Slide inside, as static HTML. */
function renderArea(): string {
  return renderToStaticMarkup(createElement(ContentArea, null, createElement('div', null, 'slide')));
}

describe('success cases', () => {
  it('renders a single-column CSS grid for reading so overview mode can re-tile the cells', () => {
    // ARRANGE
    // ACT
    const html = renderArea();

    // ASSERT
    expect(html).toContain('data-slot="slides"');
    expect(html).toContain('grid');
    expect(html).toContain('grid-cols-1');
  });
});

describe('failure cases', () => {
  it('pads every Slide wrapper with the two inset variables, and keeps no margin of its own for chrome', () => {
    // ARRANGE
    // ACT
    const html = renderArea();
    // ASSERT
    const classes = html.replaceAll('&amp;', '&');
    expect(classes).toContain('[&_[data-slide]]:pl-(--inset-l)');
    expect(classes).toContain('[&_[data-slide]]:pr-(--inset-r)');
    expect(html).not.toContain('md:ml-12');
  });

  it('never transitions the insets, so a drawer switch reflows once', () => {
    // ARRANGE
    // ACT
    const html = renderArea();
    // ASSERT
    expect(html).not.toMatch(/transition/);
  });

  it('hosts an episode-level portal root out of the grid flow', () => {
    // ARRANGE
    // ACT
    const html = renderArea();

    // ASSERT
    expect(html).toContain(`id="${EPISODE_PORTAL_ROOT_ID}"`);
    expect(html).toContain('data-slot="portal-root"');
    expect(html).toContain('fixed');
    expect(html).toContain('pointer-events-none');
  });
});

describe('edge cases', () => {
  it('provides the main landmark for episode content', () => {
    // ARRANGE
    // ACT
    const html = renderArea();

    // ASSERT
    expect(html).toMatch(/^<main\b/);
  });
});
