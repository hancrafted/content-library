import { describe, expect, it } from 'vitest';
import { markdownBlocks } from './markdown-blocks.pure';

describe('success cases', () => {
  it('reads headings, paragraphs and both kinds of list, and leaves the front matter out', () => {
    // ARRANGE
    const source = '# Old Mill\n## Cost\n140 euros\nper person.\n## Sources\n- Brochure\n- Site\n1. First\n2. Second\n';
    // ACT
    const blocks = markdownBlocks(source);
    // ASSERT
    expect(blocks).toEqual([
      { kind: 'h1', text: 'Old Mill' },
      { kind: 'h2', text: 'Cost' },
      { kind: 'p', text: '140 euros per person.' },
      { kind: 'h2', text: 'Sources' },
      { kind: 'ul', items: ['Brochure', 'Site'] },
      { kind: 'ol', items: ['First', 'Second'] },
    ]);
  });
});

describe('failure cases', () => {
  it('returns no blocks for empty text', () => {
    // ARRANGE
    const source = '   \n';
    // ACT
    const blocks = markdownBlocks(source);
    // ASSERT
    expect(blocks).toEqual([]);
  });
});

describe('edge cases', () => {
  it('keeps the text of a code fence as one paragraph-free block of its own', () => {
    // ARRANGE
    const source = '# T\n```\n## not a heading\n```\n';
    // ACT
    const blocks = markdownBlocks(source);
    // ASSERT
    expect(blocks).toEqual([
      { kind: 'h1', text: 'T' },
      { kind: 'code', text: '## not a heading' },
    ]);
  });
});
