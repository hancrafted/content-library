import { describe, expect, it } from 'vitest';
import { eventLogDeletions } from './events-append-only.pure.ts';

/*
 * The append-only guard: given the staged diff (`git diff --cached -U0`), which Episode `events.jsonl`
 * files lose lines. Diffs here are hand-written.
 */

const LOG = 'docs/episodes/x/events.jsonl';

const diff = (file: string, body: string) =>
  `diff --git a/${file} b/${file}\nindex 111..222 100644\n--- a/${file}\n+++ b/${file}\n@@ -1,0 +2 @@\n${body}\n`;

describe('eventLogDeletions', () => {
  it('passes a diff that only adds lines to an events.jsonl', () => {
    expect(eventLogDeletions(diff(LOG, '+{"a":1}'))).toEqual([]);
  });

  it('names an events.jsonl that loses a line', () => {
    expect(eventLogDeletions(diff(LOG, '-{"a":1}\n+{"a":2}'))).toEqual([LOG]);
  });

  it('ignores deletions in other files', () => {
    expect(eventLogDeletions(diff('docs/episodes/x/episode.md', '-old'))).toEqual([]);
  });

  it('names each log once, and only the ones that lose lines', () => {
    const other = 'docs/episodes/y/events.jsonl';
    const text = diff(LOG, '-a\n-b') + diff(other, '+c');
    expect(eventLogDeletions(text)).toEqual([LOG]);
  });

  it('does not mistake the --- file header for a deleted line', () => {
    expect(eventLogDeletions(diff(LOG, '+x'))).toEqual([]);
  });

  it('names a log that is deleted whole', () => {
    const text = `diff --git a/${LOG} b/${LOG}\ndeleted file mode 100644\n--- a/${LOG}\n+++ /dev/null\n@@ -1 +0,0 @@\n-{"a":1}\n`;
    expect(eventLogDeletions(text)).toEqual([LOG]);
  });
});
