import type { GlobEntries, NamedCheck } from '@/shared/lib/folder-check';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import type { ComposedPage } from './composed-page';
import { composedPageChecks } from './composed-page-checks';
import { exportsCarrying, readPage } from './composed-page-context';
import { pageFolders } from './episode-folders';

// decision: ARCH-003 §4.7
// decision: ARCH-003 §4.6
export interface EpisodeChecks {
  readonly slides: readonly NamedCheck[];
  readonly folder: readonly NamedCheck[];
}

const ENTRY = 'slide.tsx';
const SLIDES_DIR = 'slides';
const ROOT = path.resolve(import.meta.dirname, '../../..');
// decision: FE-004 §3
const EPISODE_CODE_FOLDERS = ['parts', 'client'];

interface DeclaringSlide {
  slug: string;
  notes: { slug: string }[];
  messages: Record<string, { notes?: Record<string, unknown> }>;
}

function subfolders(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map(({ name }) => name)
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
}

function slidesOf(module: unknown): { slug: string; messages: unknown }[] {
  return exportsCarrying(module, ['slug', 'messages']);
}

function slugCheck(shown: string, slug: string, load: () => Promise<unknown>): NamedCheck {
  return {
    name: `${shown} names its folder after the one Slide slug its server entry declares`,
    findings: async () => {
      const declared = slidesOf(await load()).map((slide) => slide.slug);
      return declared.length === 1 && declared[0] === slug
        ? []
        : [`${shown} declares [${declared.join(', ')}], not [${slug}]`];
    },
  };
}

// decision: FE-010 §3.1
function notesCheck(shown: string, load: () => Promise<unknown>): NamedCheck {
  return {
    name: `${shown} keeps under notes.* only the Speaker notes its Slide declares, in every locale (FE-010 §3.1)`,
    findings: async () =>
      exportsCarrying<DeclaringSlide>(await load(), ['slug', 'notes', 'messages']).flatMap(
        ({ slug, notes, messages }) => {
          const declared = new Set(notes.map((note) => note.slug));
          return Object.entries(messages).flatMap(([locale, strings]) =>
            Object.keys(strings.notes ?? {})
              .filter((key) => !declared.has(key))
              .map((key) => `${slug} ${locale}: notes.${key} is no declared Speaker note`),
          );
        },
      ),
  };
}

function slideFolderChecks(slidesDir: string, prefix: string, entries: GlobEntries): EpisodeChecks {
  const loaders = new Map(Object.entries(entries).map(([key, load]) => [path.basename(path.dirname(key)), load]));
  const folders = subfolders(slidesDir);
  const slides = folders.flatMap((slug) => {
    const load = loaders.get(slug);
    return load === undefined ? [] : [slugCheck(`${prefix}${slug}`, slug, load), notesCheck(`${prefix}${slug}`, load)];
  });
  const entryCheck: NamedCheck = {
    name: `gives every Slide folder a ${ENTRY}, so no folder holds a Slide under another name`,
    findings: async () =>
      folders.filter((slug) => !loaders.has(slug)).map((slug) => `${prefix}${slug} has no ${ENTRY}`),
  };
  return { slides, folder: [entryCheck] };
}

function pageChecks(dir: string, page: GlobEntries): NamedCheck[] {
  const load = Object.values(page)[0];
  if (load === undefined) return [];
  const found = pageFolders(ROOT).find((folder) => folder.dir === path.resolve(dir));
  if (found !== undefined) {
    const ref = found as ComposedPage;
    return composedPageChecks(ref, () => readPage(found.dir, ref, load));
  }
  return [
    {
      name: 'sits where the folder walker finds a page folder, so its composition is checked',
      findings: async () => [`${dir} is no page folder under ${path.join(ROOT, 'src/episodes')}`],
    },
  ];
}

export function episodeChecks(dir: string, entries: GlobEntries, page: GlobEntries): EpisodeChecks {
  const { slides, folder } = slideFolderChecks(path.join(dir, SLIDES_DIR), `${SLIDES_DIR}/`, entries);
  const codeFolders: NamedCheck = {
    name: 'keeps no Episode-level parts/ or client/ folder: Slide code lives only in its Slide folder',
    findings: async () => EPISODE_CODE_FOLDERS.filter((kind) => existsSync(path.join(dir, kind))),
  };
  return { slides, folder: [...folder, codeFolders, ...pageChecks(dir, page)] };
}

export function slidePoolChecks(dir: string, entries: GlobEntries): EpisodeChecks {
  return slideFolderChecks(dir, '', entries);
}
