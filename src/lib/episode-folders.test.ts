import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { episodeFolders, pageFolders } from './episode-folders';

/*
 * The one folder walker (design-ADR 0016 decision 3): every Episode, standalone and Event copy alike, and every tooling
 * page beside them. The registry generator and every test that reads the Episode folders take their list from it, so
 * the counts below fail when a folder drops out of the walk instead of silently out of every check.
 */

const ROOT = process.cwd();

/** A throwaway Episodes folder, one entry per relative path: a folder ending in `/`, else a file. */
function tree(entries: readonly string[]): string {
  const root = mkdtempSync(path.join(tmpdir(), 'episode-folders-'));
  const episodes = path.join(root, 'src/components/episodes');
  for (const entry of entries) {
    const at = path.join(episodes, entry);
    if (entry.endsWith('/')) mkdirSync(at, { recursive: true });
    else {
      mkdirSync(path.dirname(at), { recursive: true });
      writeFileSync(at, '');
    }
  }
  return root;
}

describe('success cases', () => {
  it('finds the 6 standalone Episodes and the 7 Event copies, counted apart', () => {
    // ARRANGE
    const expected = { standalone: 6, copies: 7 };
    // ACT
    const episodes = episodeFolders(ROOT);
    const seen = {
      standalone: episodes.filter(({ event }) => event === undefined).length,
      copies: episodes.filter(({ event }) => event !== undefined).length,
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('names each Event copy by its id, under its Event', () => {
    // ARRANGE
    const expected = [
      '2026-10-23-axel-agentic-workflow__ai-attention-span',
      '2026-10-23-axel-agentic-workflow__ai-gives-you-more-work',
      '2026-10-23-axel-agentic-workflow__onboard-ai-every-time',
      '2026-10-28-cyberforum-akademie-intro-agentic-workflow__ai-attention-span',
      '2026-10-28-cyberforum-akademie-intro-agentic-workflow__ai-gives-you-more-work',
      '2026-10-28-cyberforum-akademie-intro-agentic-workflow__intro',
      '2026-10-28-cyberforum-akademie-intro-agentic-workflow__onboard-ai-every-time',
    ];
    // ACT
    const copies = episodeFolders(ROOT)
      .filter(({ event }) => event !== undefined)
      .map(({ id }) => id);
    // ASSERT
    expect(copies).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('never takes the reserved by-event folder for an Episode or a tooling page', () => {
    // ARRANGE
    const root = tree(['alpha/episode-metadata.ts', 'by-event/2026-01-01-x/beta/episode-metadata.ts']);
    const expected = ['alpha', '2026-01-01-x__beta'];
    // ACT
    const ids = pageFolders(root).map(({ id }) => id);
    // ASSERT
    expect(ids).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('walks the 4 tooling pages beside the Episodes, which hold no metadata', () => {
    // ARRANGE
    const expected = ['episode-template', 'explorable-explanations', 'slide-master', 'workshop-template'];
    // ACT
    const tooling = pageFolders(ROOT)
      .filter(({ files }) => !files.includes('episode-metadata.ts'))
      .map(({ id }) => id);
    // ASSERT
    expect(tooling).toEqual(expected);
  });

  it("gives each folder its path under the Episodes folder, a copy's under its Event", () => {
    // ARRANGE
    const root = tree(['alpha/episode-metadata.ts', 'by-event/2026-01-01-x/beta/episode-metadata.ts']);
    const expected = ['alpha', 'by-event/2026-01-01-x/beta'];
    // ACT
    const folders = pageFolders(root).map(({ folder }) => folder);
    // ASSERT
    expect(folders).toEqual(expected);
  });
});
