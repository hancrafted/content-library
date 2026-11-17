import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import {
  episodeRef,
  EVENT_COPIES_FOLDER,
  EXPLORABLE_PAGES_FOLDER,
  explorablePageRef,
  folderOf,
  guideRef,
  GUIDES_FOLDER,
  RESERVED_FOLDER_NAMES,
  SLIDE_POOL_FOLDER,
  templateRef,
  TEMPLATES_FOLDER,
  type EpisodeRef,
  type ExplorablePageRef,
  type GuideRef,
  type TemplateRef,
} from '../../content-store/catalogue/episode-id.pure.ts';

/*
 * The one folder walker (design-ADR 0016 decision 3): every page folder under the Episodes folder, an Episode no Event
 * owns at `<slug>/`, an Event's copy at `by-event/<event-slug>/<slug>/`, and the Templates at `templates/<slug>/`. It
 * skips the reserved folders. The registry generator and every test that reads the Episode folders walk with it, so a copy
 * is never missed by one of them. It also walks every Slide folder, a page's and the Slide pool's, so the Slide-folder
 * checks reach a pool Slide. Reads the disk, so only Node code (the generator, tests) imports it.
 */

export const EPISODES_DIR = 'src/episodes';

export const METADATA_FILE = 'episode-metadata.ts';
/** The test every page folder and the Slide pool carries, running `episode-checks.ts` on it (ARCH-003 §4.7). */
export const EPISODE_CHECKS_TEST = 'episode-checks.test.ts';

/**
 * Passed on for `tools/` and the tests inside an Episode's folder, which FE-007 lets reach `src/` only through an
 * area's `lib/` or the store's entry, never the store's catalogue (§2.8, §5.1): the folder the Templates sit in,
 * `templates/<slug>/`, and `episodeRef`, which names the Episode in a folder, `<slug>/` or `by-event/<event>/<slug>/`, so
 * a test never writes an Episode id out by hand. Every other test imports them from the catalogue itself.
 */
export { episodeRef, EXPLORABLE_PAGES_FOLDER, GUIDES_FOLDER, TEMPLATES_FOLDER };

export type PageFolder = (EpisodeRef | TemplateRef | ExplorablePageRef | GuideRef) & {
  readonly folder: string;
  readonly dir: string;
  readonly files: readonly string[];
};

function subfolders(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map(({ name }) => name)
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
}

function atFolder(episodesDir: string, page: EpisodeRef | TemplateRef | ExplorablePageRef | GuideRef): PageFolder {
  const folder = folderOf(page);
  const dir = path.join(episodesDir, folder);
  return { ...page, folder, dir, files: readdirSync(dir) };
}

/** Every Template folder, `templates/<slug>/`, in slug order: its id is its slug, and it holds no Episode metadata. */
export function templateFolders(root: string): PageFolder[] {
  const episodesDir = path.join(root, EPISODES_DIR);
  return subfolders(path.join(episodesDir, TEMPLATES_FOLDER)).map((slug) => atFolder(episodesDir, templateRef(slug)));
}

/** Every Explorable page folder, `explorable-pages/<slug>/`, in slug order: its id is its slug, and it holds no Episode metadata. */
export function explorablePageFolders(root: string): PageFolder[] {
  const episodesDir = path.join(root, EPISODES_DIR);
  return subfolders(path.join(episodesDir, EXPLORABLE_PAGES_FOLDER)).map((slug) =>
    atFolder(episodesDir, explorablePageRef(slug)),
  );
}

/** Every Guide folder, `guides/<slug>/`, in slug order: its id is its slug, and it holds no Episode metadata. */
export function guideFolders(root: string): PageFolder[] {
  const episodesDir = path.join(root, EPISODES_DIR);
  return subfolders(path.join(episodesDir, GUIDES_FOLDER)).map((slug) => atFolder(episodesDir, guideRef(slug)));
}

/**
 * Every page folder under `<root>/src/episodes/`, in folder-name order: the standalone Episodes, then each Event's
 * copies, Event by Event, then the Templates, the Explorable pages and the Guides. The reserved folders hold no page and are walked into, never listed.
 */
export function pageFolders(root: string): PageFolder[] {
  const episodesDir = path.join(root, EPISODES_DIR);
  const own = subfolders(episodesDir)
    .filter((name) => !RESERVED_FOLDER_NAMES.includes(name))
    .map((slug) => atFolder(episodesDir, episodeRef(slug)));
  const copies = subfolders(path.join(episodesDir, EVENT_COPIES_FOLDER)).flatMap((event) =>
    subfolders(path.join(episodesDir, EVENT_COPIES_FOLDER, event)).map((slug) =>
      atFolder(episodesDir, episodeRef(slug, event)),
    ),
  );
  return [...own, ...copies, ...templateFolders(root), ...explorablePageFolders(root), ...guideFolders(root)];
}

export function episodeFolders(root: string): PageFolder[] {
  return pageFolders(root).filter(({ files }) => files.includes(METADATA_FILE));
}

const SLIDES_DIR = 'slides';

export interface SlideFolder {
  readonly owner: string;
  readonly slug: string;
  readonly dir: string;
}

export function slideFolders(root: string): SlideFolder[] {
  const own = pageFolders(root).flatMap(({ id: owner, dir }) =>
    subfolders(path.join(dir, SLIDES_DIR)).map((slug) => ({ owner, slug, dir: path.join(dir, SLIDES_DIR, slug) })),
  );
  const poolDir = path.join(root, EPISODES_DIR, SLIDE_POOL_FOLDER);
  const pool = subfolders(poolDir).map((slug) => ({ owner: SLIDE_POOL_FOLDER, slug, dir: path.join(poolDir, slug) }));
  return [...own, ...pool];
}
