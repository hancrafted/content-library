import { describe, expect, it } from 'vitest';
import { evidenceTree } from './evidence-markdown.pure';

/*
 * The Markdown of an evidence page (a Concept's body) turned into an HTML tree by unified: remark parses it, rehype
 * receives it. The tree, not HTML text, so the page renders it as React elements.
 */

const ANSWER = [
  'It does, as two studies show [1][2].',
  '',
  "[1]: https://a.example/one 'One'",
  "[2]: https://a.example/two 'Two'",
].join('\n');

/** Every link of a tree as `href text`, in document order. */
function links(tree: ReturnType<typeof evidenceTree>): string[] {
  const found: string[] = [];
  const walk = (node: {
    type: string;
    tagName?: string;
    properties?: Record<string, unknown>;
    children?: unknown[];
  }) => {
    if (node.type === 'element' && node.tagName === 'a') {
      const text = (node.children as { value?: string }[]).map(({ value }) => value ?? '').join('');
      found.push(`${String(node.properties?.href)} ${text}`);
    }
    for (const child of (node.children ?? []) as (typeof node)[]) walk(child);
  };
  walk(tree);
  return found;
}

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

  it("links each [n] citation marker to the nth entry of the page's Sources list", () => {
    // ARRANGE
    const expected = ['#source-1 [1]', '#source-2 [2]'];
    // ACT
    const found = links(evidenceTree(ANSWER, { sources: [1, 2] }));
    // ASSERT
    expect(found).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('A citation marker with no matching Source fails the build', () => {
    // ARRANGE
    const markdown = `${ANSWER.split('\n')[0]} A third one disagrees [3].`;
    const expected = /\[3\].*no Source/;
    // ACT
    const render = () => evidenceTree(markdown, { sources: [1, 2] });
    // ASSERT
    expect(render).toThrow(expected);
  });

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
  it('leaves a bracketed number in inline code alone', () => {
    // ARRANGE
    const markdown = 'Write `[9]` to cite, as here [1].';
    const expected = ['#source-1 [1]'];
    // ACT
    const found = links(evidenceTree(markdown, { sources: [1] }));
    // ASSERT
    expect(found).toEqual(expected);
  });

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
