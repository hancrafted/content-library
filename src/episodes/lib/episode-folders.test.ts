import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { episodeFolders, pageFolders, slideFolders, templateFolders, type PageFolder } from './episode-folders';

/*
 * The one folder walker (design-ADR 0016 decision 3): every Episode, standalone and Event copy alike, and every templates
 * page beside them. The registry generator and every test that reads the Episode folders take their list from it, so
 * each case below walks a throwaway Episodes folder, never the repo's: adding an Episode breaks no test here.
 */

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

/** An Event's copy among the page folders. */
type CopyFolder = Extract<PageFolder, { readonly kind: 'event-copy' }>;

describe('success cases', () => {
  it('finds the standalone Episodes and the Event copies, counted apart', () => {
    // ARRANGE
    const root = tree([
      'alpha/episode-metadata.ts',
      'beta/episode-metadata.ts',
      'by-event/2026-01-01-x/alpha/episode-metadata.ts',
    ]);
    const expected = { standalone: 2, copies: 1 };
    // ACT
    const episodes = episodeFolders(root);
    const seen = {
      standalone: episodes.filter(({ kind }) => kind === 'standalone').length,
      copies: episodes.filter(({ kind }) => kind === 'event-copy').length,
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('names each Event copy by its Event and its slug, Event by Event', () => {
    // ARRANGE
    const root = tree([
      'by-event/2026-02-02-y/alpha/episode-metadata.ts',
      'by-event/2026-01-01-x/beta/episode-metadata.ts',
      'by-event/2026-01-01-x/alpha/episode-metadata.ts',
    ]);
    const expected = [
      { event: '2026-01-01-x', slug: 'alpha' },
      { event: '2026-01-01-x', slug: 'beta' },
      { event: '2026-02-02-y', slug: 'alpha' },
    ];
    // ACT
    const copies = episodeFolders(root)
      .filter((folder): folder is CopyFolder => folder.kind === 'event-copy')
      .map(({ event, slug }) => ({ event, slug }));
    // ASSERT
    expect(copies).toEqual(expected);
  });

  it('walks the Slides of the Slide pool after every page Slide, each owned by the pool', () => {
    // ARRANGE
    const root = tree([
      'alpha/episode-metadata.ts',
      'alpha/slides/opener/slide.tsx',
      'slide-pool/pooled/slide.tsx',
      'slide-pool/another/slide.tsx',
    ]);
    const expected = [
      { owner: 'alpha', slug: 'opener' },
      { owner: 'slide-pool', slug: 'another' },
      { owner: 'slide-pool', slug: 'pooled' },
    ];
    // ACT
    const slides = slideFolders(root).map(({ owner, slug }) => ({ owner, slug }));
    // ASSERT
    expect(slides).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('never takes the reserved slide-pool folder for an Episode or a Template', () => {
    // ARRANGE
    const root = tree(['alpha/episode-metadata.ts', 'slide-pool/pooled/slide.tsx']);
    const expected = ['alpha'];
    // ACT
    const ids = pageFolders(root).map(({ id }) => id);
    // ASSERT
    expect(ids).toEqual(expected);
  });

  it.each(['components', 'lib', 'hooks'])('never takes the reserved %s folder for an Episode or a Template', (name) => {
    // ARRANGE
    const root = tree(['alpha/episode-metadata.ts', `${name}/part/part.ts`]);
    const expected = ['alpha'];
    // ACT
    const ids = pageFolders(root).map(({ id }) => id);
    // ASSERT
    expect(ids).toEqual(expected);
  });

  it('never takes the reserved by-event folder for an Episode or a Template', () => {
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
  it('walks the Templates under templates/, by slug, none of them an Episode', () => {
    // ARRANGE
    const root = tree(['alpha/episode-metadata.ts', 'templates/deck/episode.ts', 'templates/bench/episode.ts']);
    const expected = { templates: ['templates/bench', 'templates/deck'], episodes: ['alpha'] };
    // ACT
    const templates = templateFolders(root).map(({ folder }) => folder);
    const episodes = episodeFolders(root).map(({ folder }) => folder);
    // ASSERT
    expect({ templates, episodes }).toEqual(expected);
  });

  it('names a Template by its slug, after the Episodes and their copies, and walks its Slide folders', () => {
    // ARRANGE
    const root = tree([
      'alpha/episode-metadata.ts',
      'templates/bench/episode.ts',
      'templates/bench/slides/demo/slide.tsx',
    ]);
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
