import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import {
  episodeFolderOf,
  episodeIdOf,
  episodeRefOf,
  EVENT_COPIES_FOLDER,
  RESERVED_FOLDER_NAMES,
  SLIDE_POOL_FOLDER,
  TOOLING_FOLDER,
  type EpisodeRef,
} from '../../content-store/catalogue/episode-id.pure.ts';

/*
 * The one folder walker (design-ADR 0016 decision 3): every page folder under the Episodes folder, an Episode no Event
 * owns at `<slug>/`, an Event's copy at `by-event/<event-slug>/<slug>/`, and the tooling pages at `tooling/<slug>/`. It
 * skips the reserved folders. The registry generator and every test that reads the Episode folders walk with it, so a copy
 * is never missed by one of them. It also walks every Slide folder, a page's and the Slide pool's, so the Slide-folder
 * checks reach a pool Slide. Reads the disk, so only Node code (the generator, tests) imports it.
 */

/** The Episodes folder, from the repository root. */
export const EPISODES_DIR = 'src/episodes';

/** The file that makes a page folder an Episode: its metadata record. */
export const METADATA_FILE = 'episode-metadata.ts';

/** The folder the tooling pages sit in, `tooling/<slug>/`, passed on for tools, which reach `src/` only through an area's `lib/`. */
export { TOOLING_FOLDER };

/** A tooling page, which is no Episode: named by its slug, which is also its id. */
interface ToolingRef {
  readonly kind: 'tooling';
  readonly id: string;
  readonly slug: string;
}

/** One page folder: the Episode it holds, as code passes an Episode, or a tooling page; where it sits; what it holds. */
export type PageFolder = (EpisodeRef | ToolingRef) & {
  /** Its path under the Episodes folder: `<slug>`, `by-event/<event>/<slug>`, or `tooling/<slug>` for a tooling page. */
  readonly folder: string;
  /** Its absolute path. */
  readonly dir: string;
  /** Its entries, by name. */
  readonly files: readonly string[];
};

function subfolders(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map(({ name }) => name)
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
}

function pageFolder(episodesDir: string, slug: string, event?: string): PageFolder {
  const episode = episodeRefOf(episodeIdOf(slug, event));
  return atFolder(episodesDir, episodeFolderOf(episode), episode);
}

function atFolder(episodesDir: string, folder: string, page: EpisodeRef | ToolingRef): PageFolder {
  const dir = path.join(episodesDir, folder);
  return { ...page, folder, dir, files: readdirSync(dir) };
}

/** Every tooling page folder, `tooling/<slug>/`, in slug order: its id is its slug, and it holds no Episode metadata. */
export function toolingFolders(root: string): PageFolder[] {
  const episodesDir = path.join(root, EPISODES_DIR);
  return subfolders(path.join(episodesDir, TOOLING_FOLDER)).map((slug) =>
    atFolder(episodesDir, `${TOOLING_FOLDER}/${slug}`, { kind: 'tooling', id: slug, slug }),
  );
}

/**
 * Every page folder under `<root>/src/episodes/`, in folder-name order: the standalone Episodes, then each Event's
 * copies, Event by Event, then the tooling pages. The reserved folders hold no page and are walked into, never listed.
 */
export function pageFolders(root: string): PageFolder[] {
  const episodesDir = path.join(root, EPISODES_DIR);
  const own = subfolders(episodesDir)
    .filter((name) => !RESERVED_FOLDER_NAMES.includes(name))
    .map((slug) => pageFolder(episodesDir, slug));
  const copies = subfolders(path.join(episodesDir, EVENT_COPIES_FOLDER)).flatMap((event) =>
    subfolders(path.join(episodesDir, EVENT_COPIES_FOLDER, event)).map((slug) => pageFolder(episodesDir, slug, event)),
  );
  return [...own, ...copies, ...toolingFolders(root)];
}

/** Every Episode folder, standalone and Event copy alike: a page folder holding its metadata record. */
export function episodeFolders(root: string): PageFolder[] {
  return pageFolders(root).filter(({ files }) => files.includes(METADATA_FILE));
}

const SLIDES_DIR = 'slides';

/** One Slide folder: who owns it, its slug (the folder's name) and its absolute path. */
export interface SlideFolder {
  /** The page that owns it, by Episode id (a tooling page's slug), or `slide-pool` for a pool Slide. */
  readonly owner: string;
  readonly slug: string;
  readonly dir: string;
}

/**
 * Every Slide folder under `<root>/src/episodes/`: each page's `slides/<slide>/`, page by page, then each
 * Slide of the Slide pool, `slide-pool/<slide>/`, owned by the pool.
 */
export function slideFolders(root: string): SlideFolder[] {
  const own = pageFolders(root).flatMap(({ id: owner, dir }) =>
    subfolders(path.join(dir, SLIDES_DIR)).map((slug) => ({ owner, slug, dir: path.join(dir, SLIDES_DIR, slug) })),
  );
  const poolDir = path.join(root, EPISODES_DIR, SLIDE_POOL_FOLDER);
  const pool = subfolders(poolDir).map((slug) => ({ owner: SLIDE_POOL_FOLDER, slug, dir: path.join(poolDir, slug) }));
  return [...own, ...pool];
}
