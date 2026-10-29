import { describe, expect, it } from 'vitest';
import {
  chapterBlockLines,
  parseYoutubeFile,
  publishedDescription,
  serializeYoutubeFile,
  withChapterBlock,
  type YoutubeFile,
} from './youtube-file.pure.ts';

const BLOCK = '<!-- chapters:start -->\n00:00 Eins\n<!-- chapters:end -->';
const FILE: YoutubeFile = {
  description: `Intro text\n\n${BLOCK}\n\nOutro text`,
  pinnedComment: 'Welche Frage nimmst Du mit?',
  commentId: '',
};

describe('success cases', () => {
  it('parses what it serialized', () => {
    // ARRANGE
    const text = serializeYoutubeFile(FILE);
    // ACT
    const parsed = parseYoutubeFile(text);
    // ASSERT
    expect(parsed).toEqual({ value: FILE });
  });

  it('rewrites the block in place without touching the text around it', () => {
    // ARRANGE
    const next = '<!-- chapters:start -->\n00:00 Neu\n<!-- chapters:end -->';
    const expected = `Intro text\n\n${next}\n\nOutro text`;
    // ACT
    const rewritten = withChapterBlock(FILE.description, next);
    // ASSERT
    expect(rewritten).toBe(expected);
  });

  it('removes only the marker lines from the description YouTube shows', () => {
    // ARRANGE
    const expected = 'Intro text\n\n00:00 Eins\n\nOutro text';
    // ACT
    const published = publishedDescription(FILE);
    // ASSERT
    expect(published).toBe(expected);
  });
});

describe('failure cases', () => {
  it('rejects a file missing a heading', () => {
    // ARRANGE
    const text = '## Description\n\nx\n';
    // ACT
    const parsed = parseYoutubeFile(text);
    // ASSERT
    expect(parsed).toHaveProperty('problems');
  });

  it('rejects headings out of order', () => {
    // ARRANGE
    const text = '## Pinned comment\n\n## Description\n\n## Comment ID\n';
    // ACT
    const parsed = parseYoutubeFile(text);
    // ASSERT
    expect(parsed).toHaveProperty('problems');
  });
});

describe('edge cases', () => {
  it('appends the block when the description has none', () => {
    // ARRANGE
    const expected = `Intro\n\n${BLOCK}`;
    // ACT
    const rewritten = withChapterBlock('Intro', BLOCK);
    // ASSERT
    expect(rewritten).toBe(expected);
  });

  it('uses the block alone for an empty description', () => {
    // ARRANGE
    const description = '';
    // ACT
    const rewritten = withChapterBlock(description, BLOCK);
    // ASSERT
    expect(rewritten).toBe(BLOCK);
  });

  it('finds no block lines without both markers', () => {
    // ARRANGE
    const description = '<!-- chapters:start -->\n00:00 Eins';
    // ACT
    const lines = chapterBlockLines(description);
    // ASSERT
    expect(lines).toBeUndefined();
  });

  it('keeps an empty comment ID empty', () => {
    // ARRANGE
    const text = serializeYoutubeFile(FILE);
    // ACT
    const parsed = parseYoutubeFile(text);
    // ASSERT
    expect(parsed).toEqual({ value: expect.objectContaining({ commentId: '' }) });
  });
});

describe('applied fingerprint', () => {
  it('round-trips the fingerprint of the last applied description', () => {
    // ARRANGE
    const file: YoutubeFile = { ...FILE, commentId: 'Ugx1', appliedFingerprint: 'a1b2c3d4e5f60718' };
    // ACT
    const parsed = parseYoutubeFile(serializeYoutubeFile(file));
    // ASSERT
    expect(parsed).toEqual({ value: file });
  });

  it('writes no fingerprint heading until apply stored one', () => {
    // ARRANGE
    const text = serializeYoutubeFile(FILE);
    // ACT
    const hasHeading = text.includes('## Applied fingerprint');
    // ASSERT
    expect(hasHeading).toBe(false);
  });
});
