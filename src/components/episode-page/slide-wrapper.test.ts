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

  it('renders the Slide header above the Scene, which holds the visual only', () => {
    // ARRANGE
    const header = { seed: 'a--b', level: 'h3' as const, title: 'Why a template', entrance: 'none' as const };
    const wrapper = createElement(
      SlideWrapper,
      { id: 'a--b', mode: 'shared', header },
      createElement('figure', null, 'visual'),
    );
    const expected =
      /data-slot="slide-header".*<h3[^>]*>Why a template<\/h3>.*data-slot="slide-scene".*<figure>visual<\/figure>/;
    // ACT
    const html = renderToStaticMarkup(wrapper);
    // ASSERT
    expect(html).toMatch(expected);
  });

  it('keeps a section slide at least 40% of the viewport tall, free to grow', () => {
    // ARRANGE
    const wrapper = createElement(SlideWrapper, { id: 'a', size: 'section' }, 'content');
    const expected = 'min-h-[40svh]';
    // ACT
    const html = renderToStaticMarkup(wrapper);
    // ASSERT
    expect(html).toContain(expected);
    expect(html).not.toContain('min-h-svh');
  });

  it('lays a section slide on the shared header on a full-bleed band one step off the page', () => {
    // ARRANGE
    const wrapper = createElement(SlideWrapper, { id: 'a', size: 'section', mode: 'shared' }, 'content');
    const expected = 'bg-section-band';
    // ACT
    const html = renderToStaticMarkup(wrapper);
    // ASSERT
    expect(html).toContain(expected);
  });
});

describe('failure cases', () => {
  it('leaves a section slide on an Episode with authored headers on the page background', () => {
    // ARRANGE
    const wrapper = createElement(SlideWrapper, { id: 'a', size: 'section', mode: 'authored' }, 'content');
    const band = 'bg-section-band';
    // ACT
    const html = renderToStaticMarkup(wrapper);
    // ASSERT
    expect(html).not.toContain(band);
  });

  it('leaves the header and the entrance to the Scene on an Episode with authored headers', () => {
    // ARRANGE
    const header = { seed: 'a--b', level: 'h3' as const, title: 'Why a template', entrance: 'none' as const };
    const wrapper = createElement(SlideWrapper, { id: 'a--b', mode: 'authored', header }, 'content');
    // ACT
    const html = renderToStaticMarkup(wrapper);
    // ASSERT
    expect(html).not.toContain('slide-header');
    expect(html).not.toContain('data-entry');
  });

  it('isolates its stacking context, so a Backdrop at a negative z-index stays inside its own Slide', () => {
    // ARRANGE
    const wrapper = createElement(SlideWrapper, { id: 'test-slide' }, 'content');
    // ACT
    const html = renderToStaticMarkup(wrapper);
    // ASSERT
    expect(html).toMatch(/class="[^"]*\bisolate\b/);
  });

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
    expect(html).not.toMatch(/(?:^|[\s"])(p|px|pl|pr)-/);
  });
});
