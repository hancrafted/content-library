import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { SlideBackdrop } from './slide-master';

function classesOf(html: string): string[] {
  return (/class="([^"]*)"/.exec(html)?.[1] ?? '').split(/\s+/);
}

describe('success cases', () => {
  it('sits behind the Foreground, clips only itself, ignores the pointer and hides from assistive technology', () => {
    // ARRANGE
    const backdrop = createElement(SlideBackdrop, null, createElement('i', null, 'glow'));
    // ACT
    const html = renderToStaticMarkup(backdrop);
    // ASSERT
    expect(html).toContain('data-slot="slide-backdrop"');
    expect(html).toContain('aria-hidden="true"');
    expect(classesOf(html)).toEqual(
      expect.arrayContaining(['absolute', 'inset-0', '-z-10', 'overflow-hidden', 'pointer-events-none']),
    );
    expect(html).toContain('<i>glow</i>');
  });

  it('is hidden in print', () => {
    // ARRANGE
    const backdrop = createElement(SlideBackdrop, null, 'x');
    // ACT
    const classes = classesOf(renderToStaticMarkup(backdrop));
    // ASSERT
    expect(classes).toContain('print:hidden');
  });
});

describe('failure cases', () => {
  it('is hidden below md by default, so a heavy Backdrop costs a phone nothing', () => {
    // ARRANGE
    const backdrop = createElement(SlideBackdrop, null, 'x');
    // ACT
    const classes = classesOf(renderToStaticMarkup(backdrop));
    // ASSERT
    expect(classes).toEqual(expect.arrayContaining(['hidden', 'md:block']));
  });
});

describe('edge cases', () => {
  it('stays visible below md when the Slide opts in with mobile', () => {
    // ARRANGE
    const backdrop = createElement(SlideBackdrop, { mobile: true }, 'x');
    // ACT
    const classes = classesOf(renderToStaticMarkup(backdrop));
    // ASSERT
    expect(classes).not.toContain('hidden');
    expect(classes).not.toContain('md:block');
  });
});
