import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { missingPublishedSnapshot } from './composed-page-context';

const EPISODE_MODULE = {
  episode: { sections: [[{ slug: 'foundations' }, { slug: 'why' }, { slug: 'how' }]], messages: {} },
};

const folders: string[] = [];

/** A fresh page folder in the system's temp directory, removed after the test. */
function pageFolder(): string {
  const dir = mkdtempSync(path.join(tmpdir(), 'composed-page-context-'));
  folders.push(dir);
  return dir;
}

afterEach(() => {
  folders.splice(0).forEach((dir) => rmSync(dir, { recursive: true, force: true }));
});

describe('success cases', () => {
  it('hands a folder with no snapshot the sorted file of the anchors its composition produces', async () => {
    // ARRANGE
    const dir = pageFolder();
    const expected = {
      file: path.join(dir, 'published-anchors.json'),
      contents: '["foundations", "foundations--how", "foundations--why"]\n',
    };
    // ACT
    const missing = await missingPublishedSnapshot(dir, async () => EPISODE_MODULE);
    // ASSERT
    expect(missing).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('refuses an episode.ts that exports no composition', async () => {
    // ARRANGE
    const dir = pageFolder();
    const expected = 'episode.ts exports no composition';
    // ACT
    const missing = missingPublishedSnapshot(dir, async () => ({ slug: 'demo' }));
    // ASSERT
    await expect(missing).rejects.toThrow(expected);
  });
});

describe('edge cases', () => {
  it('hands nothing for a folder that has its snapshot already', async () => {
    // ARRANGE
    const dir = pageFolder();
    writeFileSync(path.join(dir, 'published-anchors.json'), '["foundations"]\n');
    const expected = undefined;
    // ACT
    const missing = await missingPublishedSnapshot(dir, async () => EPISODE_MODULE);
    // ASSERT
    expect(missing).toBe(expected);
  });
});
