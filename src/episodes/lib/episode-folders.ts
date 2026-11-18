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

// decision: docs/decision-records/0016-content-data-model.md
export const EPISODES_DIR = 'src/episodes';

export const METADATA_FILE = 'episode-metadata.ts';
// decision: ARCH-003 §4.7
export const EPISODE_CHECKS_TEST = 'episode-checks.test.ts';

export { episodeRef, EXPLORABLE_PAGES_FOLDER, GUIDES_FOLDER, SLIDE_POOL_FOLDER, TEMPLATES_FOLDER };

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

export function templateFolders(root: string): PageFolder[] {
  const episodesDir = path.join(root, EPISODES_DIR);
  return subfolders(path.join(episodesDir, TEMPLATES_FOLDER)).map((slug) => atFolder(episodesDir, templateRef(slug)));
}

export function explorablePageFolders(root: string): PageFolder[] {
  const episodesDir = path.join(root, EPISODES_DIR);
  return subfolders(path.join(episodesDir, EXPLORABLE_PAGES_FOLDER)).map((slug) =>
    atFolder(episodesDir, explorablePageRef(slug)),
  );
}

export function guideFolders(root: string): PageFolder[] {
  const episodesDir = path.join(root, EPISODES_DIR);
  return subfolders(path.join(episodesDir, GUIDES_FOLDER)).map((slug) => atFolder(episodesDir, guideRef(slug)));
}

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
