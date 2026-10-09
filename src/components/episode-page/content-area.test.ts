import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ContentArea, EPISODE_PORTAL_ROOT_ID } from './content-area';

describe('success cases', () => {
  it('renders a single-column CSS grid for reading so overview mode can re-tile the cells', () => {
    // ARRANGE
    const area = createElement(ContentArea, null, createElement('div', null, 'slide'));
    // ACT
    const html = renderToStaticMarkup(area);

    // ASSERT
    expect(html).toContain('data-slot="slides"');
    expect(html).toContain('grid');
    expect(html).toContain('grid-cols-1');
  });
});

describe('failure cases', () => {
  it('hosts an episode-level portal root out of the grid flow', () => {
    // ARRANGE
    const area = createElement(ContentArea, null, createElement('div', null, 'slide'));
    // ACT
    const html = renderToStaticMarkup(area);

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
    const area = createElement(ContentArea, null, createElement('div', null, 'slide'));
    // ACT
    const html = renderToStaticMarkup(area);

    // ASSERT
    expect(html).toMatch(/^<main\b/);
  });
});
