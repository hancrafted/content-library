import { describe, expect, it } from 'vitest';
import { eventLogDeletions } from './events-append-only.pure.ts';

/*
 * The append-only guard: given the staged diff (`git diff --cached -U0`), which Episode `events.jsonl`
 * files lose lines. Diffs here are hand-written.
 */

const LOG = 'docs/episodes/x/events.jsonl';

const diff = (file: string, body: string) =>
  `diff --git a/${file} b/${file}\nindex 111..222 100644\n--- a/${file}\n+++ b/${file}\n@@ -1,0 +2 @@\n${body}\n`;
describe('success cases', () => {
  describe('eventLogDeletions', () => {
    it('passes a diff that only adds lines to an events.jsonl', () => {
      // ARRANGE
      // ACT
      const actual = eventLogDeletions(diff(LOG, '+{"a":1}'));
      // ASSERT
      expect(actual).toEqual([]);
    });
  });
});

describe('failure cases', () => {
  describe('eventLogDeletions', () => {
    it('names an events.jsonl that loses a line', () => {
      // ARRANGE
      // ACT
      const actual = eventLogDeletions(diff(LOG, '-{"a":1}\n+{"a":2}'));
      // ASSERT
      expect(actual).toEqual([LOG]);
    });

    it('names each log once, and only the ones that lose lines', () => {
      // ARRANGE
      const other = 'docs/episodes/y/events.jsonl';
      const text = diff(LOG, '-a\n-b') + diff(other, '+c');
      // ACT
      const actual = eventLogDeletions(text);
      // ASSERT
      expect(actual).toEqual([LOG]);
    });

    it('still names a log that remains and loses lines beside one that is deleted whole', () => {
      // ARRANGE
      const other = 'docs/episodes/y/events.jsonl';
      const gone = `diff --git a/${other} b/${other}\ndeleted file mode 100644\n--- a/${other}\n+++ /dev/null\n@@ -1 +0,0 @@\n-{"a":1}\n`;
      // ACT
      const actual = eventLogDeletions(gone + diff(LOG, '-{"a":1}'));
      // ASSERT
      expect(actual).toEqual([LOG]);
    });
  });
});

describe('edge cases', () => {
  describe('eventLogDeletions', () => {
    it('ignores deletions in other files', () => {
      // ARRANGE
      // ACT
      const actual = eventLogDeletions(diff('docs/episodes/x/episode.md', '-old'));
      // ASSERT
      expect(actual).toEqual([]);
    });

    it('does not mistake the --- file header for a deleted line', () => {
      // ARRANGE
      // ACT
      const actual = eventLogDeletions(diff(LOG, '+x'));
      // ASSERT
      expect(actual).toEqual([]);
    });

    it('passes a log deleted whole, which Promotion does after archiving it to .logs/', () => {
      // ARRANGE
      const text = `diff --git a/${LOG} b/${LOG}\ndeleted file mode 100644\n--- a/${LOG}\n+++ /dev/null\n@@ -1 +0,0 @@\n-{"a":1}\n`;
      // ACT
      const actual = eventLogDeletions(text);
      // ASSERT
      expect(actual).toEqual([]);
    });
  });
});
