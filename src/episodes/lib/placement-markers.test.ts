import { folderOf, toolingRef, type EpisodeRef, type ToolingRef } from '@/content-store/catalogue/episode-id.pure';
import { hasPage, TOOLING_SLUGS, type EpisodeId, type ToolingSlug } from '@/content-store/catalogue/record-routes';
import { listEpisodes } from '@/content-store/store';
import { EPISODES_DIR } from '@/episodes/lib/episode-folders';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { compositionOf } from './registry';

/*
 * Placement markers (FE-004 Decision 3, design-ADR-0008 Decision 7):
 * an Episode built Section by Section in parallel keeps one module per Section,
 * `<ep>/sections/<section-slug>.ts`, exporting that Section's ordered Slide
 * list, section slide first. The record imports them into `sections` in order,
 * so each Section job edits its own module and no two jobs edit one line. Which pages keep such a folder is read
 * from the folders of every page the registry composes, an Event's copies included: an Episode or tooling page with
 * `sections/`.
 */

const ROOT = process.cwd();
const MARKERS_DIR = 'sections';

/** A page the registry composes, by the ref the store serves it with: an Episode with a page, or a tooling page. */
type ComposedPage = EpisodeRef<EpisodeId> | ToolingRef<ToolingSlug>;

/** The markers folder of a page. */
function markersDir(page: ComposedPage): string {
  return path.join(ROOT, EPISODES_DIR, folderOf(page), MARKERS_DIR);
}

/** The marker module names of a page, without the extension. */
function markerNames(page: ComposedPage): string[] {
  return readdirSync(markersDir(page))
    .filter((file) => file.endsWith('.ts') && !file.endsWith('.test.ts'))
    .map((file) => file.slice(0, -'.ts'.length))
    .sort();
}

/** Every value a marker module exports. */
async function markerExports(page: ComposedPage, name: string): Promise<unknown[]> {
  const exported: Record<string, unknown> = await import(path.join(markersDir(page), `${name}.ts`));
  return Object.values(exported);
}

/**
 * Every page that keeps a `sections/` folder: read from the folders, so a copied Episode that keeps its `sections/` is
 * checked with no list to extend.
 */
const MARKED: readonly ComposedPage[] = [
  ...listEpisodes().flatMap(({ ref }) => (hasPage(ref) ? [ref] : [])),
  ...TOOLING_SLUGS.map(toolingRef),
].filter((page) => existsSync(markersDir(page)));

describe('success cases', () => {
  it.each(MARKED)('keeps one marker per Section of $id, named after its section slide', (page) => {
    // ARRANGE
    const expected = compositionOf(page)
      .sections.map(([opener]) => opener.slug)
      .sort();
    // ACT
    const names = markerNames(page);
    // ASSERT
    expect(names).toEqual(expected);
  });

  it.each(MARKED)('composes $id from its markers: each Section is the list its marker exports', async (page) => {
    // ARRANGE
    const record = compositionOf(page).sections;
    const expected = record.map(() => true);
    // ACT
    const fromMarker = await Promise.all(
      record.map(async (section) => (await markerExports(page, section[0].slug)).includes(section)),
    );
    // ASSERT
    expect(fromMarker).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('keeps no marker module whose name is not a Section of its record', () => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const strays = MARKED.flatMap((page) => {
      const openers = compositionOf(page).sections.map(([opener]) => opener.slug);
      return markerNames(page)
        .filter((name) => !openers.includes(name))
        .map((name) => `${page.id}/${MARKERS_DIR}/${name}.ts`);
    });
    // ASSERT
    expect(strays).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('lets every marker module export exactly one Slide list, its section slide first', async () => {
    // ARRANGE
    const markers = MARKED.flatMap((page) => markerNames(page).map((name) => ({ page, name })));
    const expected = markers.map(({ page, name }) => `${page.id}/${name}: ${name}`);
    // ACT
    const actual = await Promise.all(
      markers.map(async ({ page, name }) => {
        const lists = (await markerExports(page, name)).filter(Array.isArray) as { slug: string }[][];
        return `${page.id}/${name}: ${lists.map(([first]) => first?.slug).join(', ')}`;
      }),
    );
    // ASSERT
    expect(actual).toEqual(expected);
  });
});
