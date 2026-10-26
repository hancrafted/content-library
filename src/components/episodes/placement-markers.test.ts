import { pageFolders, type PageFolder } from '@/lib/episode-folders';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { findPageRecord } from './tooling-pages';

/*
 * Placement markers (FE-004 Decision 3, design-ADR-0008 Decision 7):
 * an Episode built Section by Section in parallel keeps one module per Section,
 * `<ep>/sections/<section-slug>.ts`, exporting that Section's ordered Slide
 * list, section slide first. The record imports them into `sections` in order,
 * so each Section job edits its own module and no two jobs edit one line. Which pages keep such a folder is read
 * from the folders the one folder walker finds, an Event's copies included: an Episode or tooling page with
 * `sections/`, its order fixed by `registry.test.ts`'s `COMPOSITION`.
 */

const ROOT = process.cwd();
const MARKERS_DIR = 'sections';

/** Every page folder that keeps a `sections/` folder, by Episode id: the pages built at placement markers. */
const FOLDERS = new Map(
  pageFolders(ROOT)
    .filter(({ files }) => files.includes(MARKERS_DIR))
    .map((folder): [string, PageFolder] => [folder.id, folder]),
);

/** The folder of a marked Episode. */
function folderOf(episode: string): string {
  const folder = FOLDERS.get(episode);
  if (folder === undefined) throw new Error(`No page folder keeps ${MARKERS_DIR}/ for "${episode}"`);
  return folder.dir;
}

/** The marker module names of an Episode, without the extension; none when it keeps no `sections/` folder. */
function markerNames(episode: string): string[] {
  const folder = path.join(folderOf(episode), MARKERS_DIR);
  if (!existsSync(folder)) return [];
  return readdirSync(folder)
    .filter((file) => file.endsWith('.ts') && !file.endsWith('.test.ts'))
    .map((file) => file.slice(0, -'.ts'.length))
    .sort();
}

/** Every value a marker module exports. */
async function markerExports(episode: string, name: string): Promise<unknown[]> {
  const exported: Record<string, unknown> = await import(path.join(folderOf(episode), MARKERS_DIR, `${name}.ts`));
  return Object.values(exported);
}

/** Every page that keeps a `sections/` folder, by Episode id. */
function markedEpisodes(): string[] {
  return [...FOLDERS.keys()].sort();
}

/** Read from the folders, so a copied Episode that keeps its `sections/` is checked with no list to extend. */
const MARKED = markedEpisodes();

describe('success cases', () => {
  it.each(MARKED)('keeps one marker per Section of %s, named after its section slide', (slug) => {
    // ARRANGE
    const expected = findPageRecord(slug)
      .sections.map(([opener]) => opener.slug)
      .sort();
    // ACT
    const names = markerNames(slug);
    // ASSERT
    expect(names).toEqual(expected);
  });

  it.each(MARKED)('composes %s from its markers: each Section is the list its marker exports', async (slug) => {
    // ARRANGE
    const record = findPageRecord(slug).sections;
    const expected = record.map(() => true);
    // ACT
    const fromMarker = await Promise.all(
      record.map(async (section) => (await markerExports(slug, section[0].slug)).includes(section)),
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
    const strays = markedEpisodes().flatMap((episode) => {
      const openers = findPageRecord(episode).sections.map(([opener]) => opener.slug);
      return markerNames(episode)
        .filter((name) => !openers.includes(name))
        .map((name) => `${episode}/${MARKERS_DIR}/${name}.ts`);
    });
    // ASSERT
    expect(strays).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('lets every marker module export exactly one Slide list, its section slide first', async () => {
    // ARRANGE
    const markers = markedEpisodes().flatMap((episode) => markerNames(episode).map((name) => ({ episode, name })));
    const expected = markers.map(({ episode, name }) => `${episode}/${name}: ${name}`);
    // ACT
    const actual = await Promise.all(
      markers.map(async ({ episode, name }) => {
        const lists = (await markerExports(episode, name)).filter(Array.isArray) as { slug: string }[][];
        return `${episode}/${name}: ${lists.map(([first]) => first?.slug).join(', ')}`;
      }),
    );
    // ASSERT
    expect(actual).toEqual(expected);
  });
});
