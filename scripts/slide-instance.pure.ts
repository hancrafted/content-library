// What `slides:adapt` and `slides:settle` share about an instance (design-ADR 0016, Slide reuse rule 3): where it
// lives, what its copy from the pool Slide writes, and how an Episode's Section is pointed at it or back at the pool.
// Reads through the view it is handed; writes nothing.
import {
  EPISODES_DIR,
  inside,
  resolveSpecifier,
  SLIDE_POOL_DIR,
  SPECIFIER,
  type RepoView,
} from './slide-reuse.pure.ts';

/** The view the instance commands need: the reuse view plus every file under a folder, to copy or compare it whole. */
export interface InstanceRepoView extends RepoView {
  /** Every file under a folder, by repository path, sorted; none when it does not exist. */
  readonly filesUnder: (path: string) => readonly string[];
}

export interface FileText {
  readonly path: string;
  readonly text: string;
}

/** A file of an instance as the copy writes it; `format` marks one the copy rewrote, which the adapter formats. */
export interface CopiedFile extends FileText {
  readonly format: boolean;
}

/** An instance's names: its origin's slug and binding, its own slug, and the folder it lives in. */
export interface InstanceNames {
  readonly origin: string;
  /** The binding the pool Slide's `slide.tsx` exports. */
  readonly from: string;
  readonly as: string;
  readonly to: string;
}

/** How the adapter formats a file the plan rewrote; settling formats the copy it compares against the same way. */
export type Format = (path: string, text: string) => Promise<string>;

/** The exported binding a slug gives an instance: `default-alive-for-founders` → `defaultAliveForFounders`. */
export function camelOf(slug: string): string {
  return slug.replace(/-([a-z0-9])/g, (_, next: string) => next.toUpperCase());
}

export function poolFolderOf(slug: string): string {
  return `${SLIDE_POOL_DIR}/${slug}`;
}

export function instanceFolderOf(episode: string, slug: string): string {
  return `${EPISODES_DIR}/${episode}/slides/${slug}`;
}

function escape(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Every file of a folder, read. */
export function folderFiles(folder: string, repo: InstanceRepoView): FileText[] {
  return repo.filesUnder(folder).map((path) => ({ path, text: repo.read(path) }));
}

/**
 * The instance's files as the copy writes them, from the pool Slide's: `slide.tsx` takes the new slug and the
 * `copiedFrom` marker, and the exported binding is renamed in every source file of the folder so it cannot clash with
 * the pool Slide's. Every other file is copied as it is. A string names why it cannot be copied.
 */
export function copiedFiles(pool: readonly FileText[], names: InstanceNames, commit: string): CopiedFile[] | string {
  const folder = poolFolderOf(names.origin);
  const entry = pool.find(({ path }) => path === `${folder}/slide.tsx`);
  const slugField = new RegExp(`slug:\\s*(['"])${escape(names.origin)}\\1,?`);
  if (entry === undefined || !slugField.test(entry.text)) {
    return `${folder}/slide.tsx declares no \`slug: '${names.origin}'\` to copy from.`;
  }
  const marker = `slug: '${names.as}', copiedFrom: { slug: '${names.origin}', commit: '${commit}' },`;
  const binding = new RegExp(`\\b${escape(names.from)}\\b`, 'g');
  return pool.map(({ path, text }) => {
    const target = `${names.to}${path.slice(folder.length)}`;
    if (!/\.tsx?$/.test(path)) return { path: target, text, format: false };
    const marked = path === entry.path ? text.replace(slugField, marker) : text;
    const renamed = marked.replace(binding, camelOf(names.as));
    return { path: target, text: renamed, format: renamed !== text };
  });
}

/** Where a slug is already a Slide folder, in any Episode's `slides/` or in the pool. */
export function foldersNamed(slug: string, repo: RepoView): string[] {
  return [
    ...repo
      .folders(EPISODES_DIR)
      .map((episode) => instanceFolderOf(episode, slug))
      .filter((folder) => repo.exists(folder)),
    ...(repo.exists(poolFolderOf(slug)) ? [poolFolderOf(slug)] : []),
  ];
}

const NAMED_IMPORT = /import \{ (\w+) \} from (['"])([^'"\n]+)\2;/g;

/** An Episode's Section files that import from `folder`, each with the binding it imports under. */
export function sectionsImporting(
  episode: string,
  folder: string,
  repo: RepoView,
): { path: string; binding: string }[] {
  const dir = `${EPISODES_DIR}/${episode}/sections`;
  return repo
    .sourceFiles()
    .filter((file) => inside(file, dir))
    .flatMap((path) => {
      const found = [...repo.read(path).matchAll(NAMED_IMPORT)].find(([, , , spec]) => {
        const target = resolveSpecifier(path, spec);
        return target !== undefined && inside(target, folder);
      });
      return found === undefined ? [] : [{ path, binding: found[1] }];
    });
}

/** A re-pointing of one Section file: its import of `from`, bound to `binding`, becomes `spec`, bound to `name`. */
export interface Repoint {
  readonly path: string;
  readonly from: string;
  readonly binding: string;
  readonly name: string;
  readonly spec: string;
}

/** The Section file's text re-pointed, its list entry renamed with its import. */
export function repointedSection(text: string, repoint: Repoint): string {
  const specified = text.replace(SPECIFIER, (whole, ...[lead, quote, spec]: string[]) => {
    const target = resolveSpecifier(repoint.path, spec);
    return target !== undefined && inside(target, repoint.from) ? `${lead}${quote}${repoint.spec}${quote}` : whole;
  });
  return specified.replace(new RegExp(`\\b${escape(repoint.binding)}\\b`, 'g'), repoint.name);
}
