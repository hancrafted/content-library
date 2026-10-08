import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { SlideWrapper } from './slide-wrapper';

describe('success cases', () => {
  it('satisfies the min-height contract of at least viewport height', () => {
    // ARRANGE
    const wrapper = createElement(SlideWrapper, { id: 'test-slide' }, 'content');
    // ACT
    const html = renderToStaticMarkup(wrapper);

    // ASSERT
    expect(html).toContain('min-h-svh');
  });

  it('renders id and data-slide from the id it is given', () => {
    // ARRANGE
    const wrapper = createElement(SlideWrapper, { id: 'my-section--my-slide' }, 'content');
    // ACT
    const html = renderToStaticMarkup(wrapper);

    // ASSERT
    expect(html).toContain('id="my-section--my-slide"');
    expect(html).toContain('data-slide="my-section--my-slide"');
  });

  it('renders its content through a mount, so prerendered HTML keeps the content a far Slide drops later', () => {
    // ARRANGE
    const wrapper = createElement(SlideWrapper, { id: 'a--b' }, createElement('p', null, 'kept'));
    // ACT
    const html = renderToStaticMarkup(wrapper);

    // ASSERT
    expect(html).toMatch(/data-slot="slide-mount"[^>]*>.*<p>kept<\/p>/);
  });
});

describe('failure cases', () => {
  it('never clips and never creates an inner scrollbar', () => {
    // ARRANGE
    const wrapper = createElement(SlideWrapper, { id: 'test-slide' }, 'content');
    // ACT
    const html = renderToStaticMarkup(wrapper);

    // ASSERT: no overflow clipping or inner scrollbars
    expect(html).not.toContain('overflow-hidden');
    expect(html).not.toContain('overflow-auto');
    expect(html).not.toContain('overflow-scroll');
    expect(html).not.toContain('overflow-y-auto');
    expect(html).not.toContain('overflow-y-scroll');
  });
});

describe('edge cases', () => {
  it('sets no outer margins or gaps, and no divider: rhythm belongs to the Content area', () => {
    // ARRANGE
    const wrapper = createElement(SlideWrapper, { id: 'test-slide' }, 'content');
    // ACT
    const html = renderToStaticMarkup(wrapper);

    // ASSERT: self-contained positioning
    expect(html).toContain('relative');
    expect(html).toContain('w-full');
    // Rhythm is owned by ContentArea, wrapper sets no outer margins
    expect(html).not.toMatch(/(?:^|\s)(m|my|mt|mb)-\d+/);
    expect(html).not.toMatch(/(?:^|\s)gap-/);
    expect(html).not.toContain('border-b');
  });
});
