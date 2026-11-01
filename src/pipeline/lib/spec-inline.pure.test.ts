import { describe, expect, it } from 'vitest';
import { hasDesignLink, inlineDesignCss } from './spec-inline.pure.ts';

/* A Spec page carries its compiled design.css in a <style> instead of a sibling file, so it opens from anywhere. */

const PAGE = `<html><head><title>S</title>
<link rel="stylesheet" href="design.css" />
<script>1</script></head><body></body></html>`;

describe('success cases', () => {
  it('replaces the design.css link with a style holding the css', () => {
    // ARRANGE
    const css = '.border-ai{border-color:red}';
    // ACT
    const html = inlineDesignCss(PAGE, css);
    // ASSERT
    expect(html).toContain('<style data-design-css>.border-ai{border-color:red}</style>');
    expect(html).not.toContain('<link');
  });

  it('does not read $ patterns in the css as replacement tokens', () => {
    // ARRANGE
    const css = '.a::after{content:"$&$1"}';
    // ACT
    const html = inlineDesignCss(PAGE, css);
    // ASSERT
    expect(html).toContain(css);
  });
});

describe('failure cases', () => {
  it('refuses css that would close the style early', () => {
    // ARRANGE
    const css = '/* </style> */';
    // ACT
    const run = () => inlineDesignCss(PAGE, css);
    // ASSERT
    expect(run).toThrow('</style');
  });
});

describe('edge cases', () => {
  it('tells a linked page from an inlined one', () => {
    // ARRANGE
    const inlined = inlineDesignCss(PAGE, '.a{}');
    // ACT
    const found = [hasDesignLink(PAGE), hasDesignLink(inlined)];
    // ASSERT
    expect(found).toEqual([true, false]);
  });

  it('is a no-op when the page holds no link, so a second run keeps the first css', () => {
    // ARRANGE
    const once = inlineDesignCss(PAGE, '.a{}');
    // ACT
    const twice = inlineDesignCss(once, '.b{}');
    // ASSERT
    expect(twice).toBe(once);
  });
});
