import { describe, expect, it } from 'vitest';
import { checkContext, checkedNote } from './context-check.pure';
import type { SpeakerNoteItem, VoiceScriptSegment } from './context-drawer.pure';

function note(
  slug: string,
  target = 'prose',
  cited?: { description?: string; sources?: SpeakerNoteItem['sources'] },
): SpeakerNoteItem {
  const { description = 'd', sources } = cited ?? {};
  return { slug, header: 'h', description, target, ...(sources && { sources }) };
}

function source(slug: string, url = 'https://example.com/a') {
  return { slug, url, title: slug };
}

function segment(slug: string, from = 0, to = 1): VoiceScriptSegment {
  return { slug, from, to, title: 't', keywords: [], script: 's' };
}

describe('success cases', () => {
  it('accepts a Slide with distinct notes and segments', () => {
    // ARRANGE
    const notes = [note('one'), note('two', 'caption')];
    const segments = [segment('a', 0, 1), segment('b', 1, 2)];
    // ACT
    const check = () => checkContext('foundations--why', notes, segments);
    // ASSERT
    expect(check).not.toThrow();
  });

  it('finds the note a context reference names', () => {
    // ARRANGE
    const notes = [note('a'), note('b')];
    const expected = 'b';
    // ACT
    const found = checkedNote(notes, 'b');
    // ASSERT
    expect(found.slug).toBe(expected);
  });

  it('accepts markers that each name a source of their note', () => {
    // ARRANGE
    const notes = [
      note('a', 'prose', {
        description: 'One [1] and two [2], again [1].',
        sources: [source('x'), source('y', 'https://example.com/b')],
      }),
    ];
    const check = () => checkContext('s', notes, []);
    // ACT
    const result = check();
    // ASSERT
    expect(result).toBeUndefined();
  });
});

describe('failure cases', () => {
  it('rejects two notes, or two segments, sharing a slug', () => {
    // ARRANGE
    const dupNoteSlug = '"x"';
    const dupSegmentSlug = '"y"';
    const dupNote = () => checkContext('s', [note('x'), note('x')], []);
    const dupSegment = () => checkContext('s', [], [segment('y'), segment('y', 1, 2)]);
    // ACT
    const messages = [dupNote, dupSegment].map((run) => {
      try {
        run();
        return '';
      } catch (error) {
        return (error as Error).message;
      }
    });
    // ASSERT
    expect(messages[0]).toContain(dupNoteSlug);
    expect(messages[1]).toContain(dupSegmentSlug);
  });

  it('rejects a target or slug that is not kebab-case', () => {
    // ARRANGE
    const badTargetName = 'Not Kebab';
    const badSlugName = 'Bad Slug';
    const badTarget = () => checkContext('s', [note('x', badTargetName)], []);
    const badSlug = () => checkContext('s', [], [segment(badSlugName)]);
    // ACT
    const attempts = [badTarget, badSlug];
    // ASSERT
    expect(attempts[0]).toThrow(badTargetName);
    expect(attempts[1]).toThrow(badSlugName);
  });

  it('rejects a segment that ends before it starts', () => {
    // ARRANGE
    const segmentSlug = '"x"';
    const backwards = () => checkContext('s', [], [segment('x', 2, 1)]);
    // ACT
    const attempt = backwards;
    // ASSERT
    expect(attempt).toThrow(segmentSlug);
  });

  it('rejects a citation marker that names no source', () => {
    // ARRANGE
    const marker = '[2]';
    const notes = [note('a', 'prose', { description: `Only one source ${marker}.`, sources: [source('x')] })];
    const check = () => checkContext('s', notes, []);
    // ACT
    const run = () => check();
    // ASSERT
    expect(run).toThrow(marker);
  });

  it('rejects a citation marker on a note with no sources', () => {
    // ARRANGE
    const marker = '[1]';
    const check = () => checkContext('s', [note('a', 'prose', { description: `Cited ${marker}.` })], []);
    // ACT
    const run = () => check();
    // ASSERT
    expect(run).toThrow(marker);
  });

  it('rejects two sources of one note sharing a slug', () => {
    // ARRANGE
    const dup = '"x"';
    const check = () => checkContext('s', [note('a', 'prose', { sources: [source('x'), source('x')] })], []);
    // ACT
    const run = () => check();
    // ASSERT
    expect(run).toThrow(dup);
  });

  it('throws when a context reference names a note the Slide does not have', () => {
    // ARRANGE
    const missing = '"nope"';
    const run = () => checkedNote([note('a')], 'nope');
    // ACT
    const result = run;
    // ASSERT
    expect(result).toThrow(missing);
  });
});

describe('edge cases', () => {
  it('accepts a Slide with no notes and no script', () => {
    // ARRANGE
    const check = () => checkContext('s', [], []);
    // ACT
    const result = check();
    // ASSERT
    expect(result).toBeUndefined();
  });
});
