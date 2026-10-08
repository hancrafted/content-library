import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { SlideWrapper } from './slide-wrapper';

describe('SlideWrapper', () => {
  it('satisfies the min-height contract of at least viewport height', () => {
    // ARRANGE & ACT
    const html = renderToStaticMarkup(createElement(SlideWrapper, { id: 'test-slide' }, 'content'));

    // ASSERT
    expect(html).toContain('min-h-svh');
  });

  it('never clips and never creates an inner scrollbar', () => {
    // ARRANGE & ACT
    const html = renderToStaticMarkup(createElement(SlideWrapper, { id: 'test-slide' }, 'content'));

    // ASSERT: no overflow clipping or inner scrollbars
    expect(html).not.toContain('overflow-hidden');
    expect(html).not.toContain('overflow-auto');
    expect(html).not.toContain('overflow-scroll');
    expect(html).not.toContain('overflow-y-auto');
    expect(html).not.toContain('overflow-y-scroll');
  });

  it('sets no outer margins or gaps, and no divider: rhythm belongs to the Content area', () => {
    // ARRANGE & ACT
    const html = renderToStaticMarkup(createElement(SlideWrapper, { id: 'test-slide' }, 'content'));

    // ASSERT: self-contained positioning
    expect(html).toContain('relative');
    expect(html).toContain('w-full');
    // Rhythm is owned by ContentArea, wrapper sets no outer margins
    expect(html).not.toMatch(/(?:^|\s)(m|my|mt|mb)-\d+/);
    expect(html).not.toMatch(/(?:^|\s)gap-/);
    expect(html).not.toContain('border-b');
  });

  it('renders id and data-slide from the id it is given', () => {
    // ARRANGE & ACT
    const html = renderToStaticMarkup(createElement(SlideWrapper, { id: 'my-section--my-slide' }, 'content'));

    // ASSERT
    expect(html).toContain('id="my-section--my-slide"');
    expect(html).toContain('data-slide="my-section--my-slide"');
  });
});
