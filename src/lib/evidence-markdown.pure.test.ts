import { describe, expect, it } from 'vitest';
import { evidenceTree } from './evidence-markdown.pure';

/*
 * The Markdown of an evidence page (a Concept's body) turned into an HTML tree by unified: remark parses it, rehype
 * receives it. The tree, not HTML text, so the page renders it as React elements.
 */

/** The element names of a tree's top level, text nodes between them left out. */
function topTags(markdown: string, options?: Parameters<typeof evidenceTree>[1]): string[] {
  return evidenceTree(markdown, options).children.flatMap((node) => (node.type === 'element' ? [node.tagName] : []));
}

describe('success cases', () => {
  it('turns paragraphs, a list and a link into their HTML elements', () => {
    // ARRANGE
    const markdown = 'First.\n\n- one\n- two\n\nSee [the page](https://example.com).';
    const expected = ['p', 'ul', 'p'];
    // ACT
    const tags = topTags(markdown);
    // ASSERT
    expect(tags).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('drops raw HTML written in the Markdown, so a file cannot inject markup', () => {
    // ARRANGE
    const markdown = 'Text.\n\n<script>alert(1)</script>';
    const expected = ['p'];
    // ACT
    const tags = topTags(markdown);
    // ASSERT
    expect(tags).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('leaves out the leading h1 when the page draws the title itself', () => {
    // ARRANGE
    const markdown = '# Sales\n\nSales is winning paying customers.';
    const expected = ['p'];
    // ACT
    const tags = topTags(markdown, { withoutTitle: true });
    // ASSERT
    expect(tags).toEqual(expected);
  });
});
