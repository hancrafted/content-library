import { describe, expect, it } from 'vitest';
import { createMemoryFolder } from './episode-folder.pure';

/*
 * The in-memory Episode folder: the adapter the dashboard's poll step and output probe are tested through, and the
 * contract the File System Access adapter keeps — paths inside the folder, a NotFoundError for a missing file.
 */

describe('success cases', () => {
  it('reads a file as text, its bytes from an offset and its size and modification time', async () => {
    // ARRANGE
    const folder = createMemoryFolder('example', { 'research/notes.md': 'héllo' });
    const expectedText = 'héllo';
    const expectedTail = 'llo';
    const expectedStat = { size: 6, lastModified: 1 };
    // ACT
    const text = await folder.readText('research/notes.md');
    const tail = new TextDecoder().decode(await folder.readBytes('research/notes.md', 3));
    const stat = await folder.stat('research/notes.md');
    // ASSERT
    expect(text).toBe(expectedText);
    expect(tail).toBe(expectedTail);
    expect(stat).toEqual(expectedStat);
  });

  it('marks a rewrite as modified unless the writer names the modification time', async () => {
    // ARRANGE
    const folder = createMemoryFolder('example', { 'pipeline.yml': 'a' });
    const expectedBumped = 2;
    const expectedKept = 2;
    // ACT
    folder.write('pipeline.yml', 'b');
    const bumped = (await folder.stat('pipeline.yml')).lastModified;
    folder.write('pipeline.yml', 'c', expectedKept);
    const kept = (await folder.stat('pipeline.yml')).lastModified;
    // ASSERT
    expect(bumped).toBe(expectedBumped);
    expect(kept).toBe(expectedKept);
  });
});

describe('failure cases', () => {
  it('rejects a read of a missing file with a NotFoundError naming it', async () => {
    // ARRANGE
    const folder = createMemoryFolder('example');
    const expectedName = 'NotFoundError';
    const expectedMessage = 'events.jsonl';
    // ACT
    const error = await folder.stat('events.jsonl').catch((cause: Error) => cause);
    // ASSERT
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).name).toBe(expectedName);
    expect((error as Error).message).toContain(expectedMessage);
  });
});

describe('edge cases', () => {
  it('answers whether a file exists, and forgets a removed one', async () => {
    // ARRANGE
    const folder = createMemoryFolder('example', { 'brief.md': '# Brief', 'spec/spec.md': '# Spec' });
    // ACT
    folder.remove('brief.md');
    const found = await Promise.all(['brief.md', 'spec/spec.md', 'spec'].map((path) => folder.exists(path)));
    // ASSERT
    expect(found).toEqual([false, true, false]);
  });
});
