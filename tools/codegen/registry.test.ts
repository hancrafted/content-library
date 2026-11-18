import path from 'node:path';
import { describe, expect, it } from 'vitest';
import outlines from '../../src/episodes/lib/episode-outlines.generated.json' with { type: 'json' };
import {
  episodePageIds,
  staleEpisodeRoutes,
  staleInstanceSlides,
  staleSourceFiles,
  type SiteLoader,
} from './registry.ts';

const ROOT = path.resolve(__dirname, '../..');

const load: SiteLoader = (repoPath) => import(path.join(ROOT, repoPath));

describe('success cases', () => {
  it('keeps the checked-in Episode, Event, Template, Explorable page and Guide registries in step with their folders (else run `npm run registry`)', async () => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const stale = await staleSourceFiles(ROOT);
    // ASSERT
    expect(stale).toEqual(expected);
  });

  it('keeps every generated Episode route in step with the page catalogue, none left over (else run `npm run registry`)', async () => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const stale = await staleEpisodeRoutes(ROOT, load);
    // ASSERT
    expect(stale).toEqual(expected);
  });

  it('keeps the Base Episodes’ Slide messages map in step with the checked-in Episode outline (else run `npm run registry`)', async () => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const stale = await staleInstanceSlides(ROOT, outlines);
    // ASSERT
    expect(stale).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('refuses an Episode instance whose Base Episode has no outline', async () => {
    // ARRANGE
    const orphan = {
      'axel__cash': { folder: 'by-event/axel/cash', base: 'cash', text: { en: [], de: [] }, sections: [] },
    };
    const expected = 'names the Base Episode "cash", which has no outline';
    // ACT
    const checking = staleInstanceSlides(ROOT, orphan);
    // ASSERT
    await expect(checking).rejects.toThrow(expected);
  });
});

describe('edge cases', () => {
  it('outlines exactly the Episodes with a page, so no page goes unchecked by its folder (else run `npm run registry`)', () => {
    // ARRANGE
    const expected = episodePageIds(ROOT).sort();
    // ACT
    const outlined = Object.keys(outlines).sort();
    // ASSERT
    expect(outlined).toEqual(expected);
  });
});
