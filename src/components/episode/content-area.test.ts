import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ContentArea, EPISODE_PORTAL_ROOT_ID } from './content-area';

describe('ContentArea', () => {
  it('renders a single-column CSS grid for reading so an overview mode can re-tile cells', () => {
    // ARRANGE & ACT
    const html = renderToStaticMarkup(createElement(ContentArea, null, createElement('div', null, 'slide')));

    // ASSERT
    expect(html).toContain('data-slot="slides"');
    expect(html).toContain('grid');
    expect(html).toContain('grid-cols-1');
  });

  it('hosts an episode-level portal root out of grid flow', () => {
    // ARRANGE & ACT
    const html = renderToStaticMarkup(createElement(ContentArea, null, createElement('div', null, 'slide')));

    // ASSERT
    expect(html).toContain(`id="${EPISODE_PORTAL_ROOT_ID}"`);
    expect(html).toContain('data-slot="portal-root"');
    expect(html).toContain('fixed');
    expect(html).toContain('pointer-events-none');
  });

  it('provides the main landmark for episode content', () => {
    // ARRANGE & ACT
    const html = renderToStaticMarkup(createElement(ContentArea, null, createElement('div', null, 'slide')));

    // ASSERT
    expect(html).toMatch(/^<main\b/);
  });
});
