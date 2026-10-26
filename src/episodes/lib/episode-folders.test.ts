import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { episodeFolders, pageFolders, slideFolders, toolingFolders } from './episode-folders';

/*
 * The one folder walker (design-ADR 0016 decision 3): every Episode, standalone and Event copy alike, and every tooling
 * page beside them. The registry generator and every test that reads the Episode folders take their list from it, so
 * the counts below fail when a folder drops out of the walk instead of silently out of every check.
 */

const ROOT = process.cwd();

/** A throwaway Episodes folder, one entry per relative path: a folder ending in `/`, else a file. */
function tree(entries: readonly string[]): string {
  const root = mkdtempSync(path.join(tmpdir(), 'episode-folders-'));
  const episodes = path.join(root, 'src/episodes');
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
      standalone: episodes.filter(({ kind }) => kind === 'standalone').length,
      copies: episodes.filter(({ kind }) => kind === 'event-copy').length,
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
      .filter(({ kind }) => kind === 'event-copy')
      .map(({ id }) => id);
    // ASSERT
    expect(copies).toEqual(expected);
  });
  it('walks the 5 Slides of the Slide pool beside every page Slide, each owned by the pool', () => {
    // ARRANGE
    const expected = ['brief-the-venue', 'manage-the-price', 'one-prompt', 'pay-the-price', 'you-are-the-new-hire'];
    // ACT
    const pool = slideFolders(ROOT)
      .filter(({ owner }) => owner === 'slide-pool')
      .map(({ slug }) => slug);
    // ASSERT
    expect(pool).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('never takes the reserved slide-pool folder for an Episode or a tooling page', () => {
    // ARRANGE
    const root = tree(['alpha/episode-metadata.ts', 'slide-pool/pooled/slide.tsx']);
    const expected = ['alpha'];
    // ACT
    const ids = pageFolders(root).map(({ id }) => id);
    // ASSERT
    expect(ids).toEqual(expected);
  });

  it.each(['components', 'lib', 'hooks'])(
    'never takes the reserved %s folder for an Episode or a tooling page',
    (name) => {
      // ARRANGE
      const root = tree(['alpha/episode-metadata.ts', `${name}/part/part.ts`]);
      const expected = ['alpha'];
      // ACT
      const ids = pageFolders(root).map(({ id }) => id);
      // ASSERT
      expect(ids).toEqual(expected);
    },
  );

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
  it('walks the 4 tooling pages under tooling/, by slug, none of them an Episode', () => {
    // ARRANGE
    const expected = [
      'tooling/episode-template',
      'tooling/explorable-explanations',
      'tooling/slide-master',
      'tooling/workshop-template',
    ];
    // ACT
    const tooling = toolingFolders(ROOT).map(({ folder }) => folder);
    const episodes = episodeFolders(ROOT).filter(({ folder }) => folder.startsWith('tooling/'));
    // ASSERT
    expect(tooling).toEqual(expected);
    expect(episodes).toEqual([]);
  });

  it('names a tooling page by its slug, after the Episodes and their copies, and walks its Slide folders', () => {
    // ARRANGE
    const root = tree(['alpha/episode-metadata.ts', 'tooling/bench/episode.ts', 'tooling/bench/slides/demo/slide.tsx']);
    const expected = { pages: ['alpha', 'bench'], slides: [{ owner: 'bench', slug: 'demo' }] };
    // ACT
    const pages = pageFolders(root).map(({ id }) => id);
    const slides = slideFolders(root).map(({ owner, slug }) => ({ owner, slug }));
    // ASSERT
    expect({ pages, slides }).toEqual(expected);
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
