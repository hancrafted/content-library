import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { episodeIdOf, EVENT_COPIES_FOLDER, RESERVED_FOLDER_NAMES } from './episode-id.pure.ts';

/*
 * The one folder walker (design-ADR 0016 decision 3): every page folder under the Episodes folder, an Episode no Event
 * owns at `<slug>/`, an Event's copy at `by-event/<event-slug>/<slug>/`, and the tooling pages beside them. It skips
 * the reserved folders. The registry generator and every test that reads the Episode folders walk with it, so a copy
 * is never missed by one of them. Reads the disk, so only Node code (the generator, tests) imports it.
 */

/** The Episodes folder, from the repository root. */
export const EPISODES_DIR = 'src/components/episodes';

const METADATA_FILE = 'episode-metadata.ts';

/** One page folder: its Episode id (a tooling page's slug), its slug, its Event, where it sits, and what it holds. */
export interface PageFolder {
  readonly id: string;
  readonly slug: string;
  /** The Event that owns it, by slug: set only on an Event's copy. */
  readonly event?: string;
  /** Its path under the Episodes folder: `<slug>`, or `by-event/<event>/<slug>`. */
  readonly folder: string;
  /** Its absolute path. */
  readonly dir: string;
  /** Its entries, by name. */
  readonly files: readonly string[];
}

function subfolders(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map(({ name }) => name)
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
}

function pageFolder(episodesDir: string, slug: string, event?: string): PageFolder {
  const folder = event === undefined ? slug : `${EVENT_COPIES_FOLDER}/${event}/${slug}`;
  const dir = path.join(episodesDir, folder);
  return {
    id: episodeIdOf(slug, event),
    slug,
    ...(event === undefined ? {} : { event }),
    folder,
    dir,
    files: readdirSync(dir),
  };
}

/**
 * Every page folder under `<root>/src/components/episodes/`, in folder-name order: the standalone Episodes and
 * tooling pages, then each Event's copies, Event by Event. The reserved folders hold no page and are walked into, never
 * listed.
 */
export function pageFolders(root: string): PageFolder[] {
  const episodesDir = path.join(root, EPISODES_DIR);
  const own = subfolders(episodesDir)
    .filter((name) => !RESERVED_FOLDER_NAMES.includes(name))
    .map((slug) => pageFolder(episodesDir, slug));
  const copies = subfolders(path.join(episodesDir, EVENT_COPIES_FOLDER)).flatMap((event) =>
    subfolders(path.join(episodesDir, EVENT_COPIES_FOLDER, event)).map((slug) => pageFolder(episodesDir, slug, event)),
  );
  return [...own, ...copies];
}

/** Every Episode folder, standalone and Event copy alike: a page folder holding its metadata record. */
export function episodeFolders(root: string): PageFolder[] {
  return pageFolders(root).filter(({ files }) => files.includes(METADATA_FILE));
}
