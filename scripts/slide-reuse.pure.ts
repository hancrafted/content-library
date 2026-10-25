// First reuse of a Slide (design-ADR 0016, Slide reuse rules 1 and 2): the plan `npm run slides:reuse` carries out.
// A Slide lives in its Episode's `slides/` until a second Episode reuses it; then its folder moves, unchanged, into
// the flat Slide pool, every import of it is re-pointed at the pool, and the reusing Episode's Section lists it by
// reference. Slug, text and anchors never change, so no published URL moves. This file decides; it reads through the
// view it is handed and writes nothing, so the command and its test share every rule.
import { posix } from 'node:path';

export const EPISODES_DIR = 'src/components/episodes';
export const SLIDE_POOL_DIR = 'src/components/slide-pool';

export interface ReuseRequest {
  /** The Slide's slug, which is its folder name. */
  readonly slug: string;
  /** The Episode that reuses the Slide. */
  readonly into: string;
  /** The Section of that Episode whose list the Slide joins, by its `sections/<section>.ts` file. */
  readonly section: string;
}

/** What the plan reads of the repository: paths relative to its root, forward slashes. */
export interface RepoView {
  readonly exists: (path: string) => boolean;
  readonly read: (path: string) => string;
  /** The folder names directly inside a directory, sorted; none when it does not exist. */
  readonly folders: (path: string) => readonly string[];
  /** Every TypeScript source file under `src/` and `tests/`, the ones that may import a Slide. */
  readonly sourceFiles: () => readonly string[];
}

export interface ReusePlan {
  /** The folder move, when the Slide still lives in its Episode; absent when it is already in the pool. */
  readonly move?: { readonly from: string; readonly to: string };
  /** Whole-file replacements, by the path the file has once the move is done. */
  readonly edits: readonly { readonly path: string; readonly text: string }[];
}

export type ReuseResult =
  { readonly ok: true; readonly plan: ReusePlan } | { readonly ok: false; readonly reasons: readonly string[] };

const SPECIFIER = /(\bfrom\s*|\bimport\s*\(?\s*)(['"])([^'"\n]+)\2/g;
const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const IMPORT_LINE = /^import [^;]*;$/gm;

/** The repository path an import specifier names, or `undefined` for a package. */
function resolveSpecifier(file: string, spec: string): string | undefined {
  if (spec.startsWith('@/')) return `src/${spec.slice(2)}`;
  if (spec.startsWith('.')) return posix.normalize(posix.join(posix.dirname(file), spec));
  return undefined;
}

function inside(path: string, folder: string): boolean {
  return path === folder || path.startsWith(`${folder}/`);
}

function aliasOf(path: string): string {
  return path.startsWith('src/') ? `@/${path.slice('src/'.length)}` : path;
}

/** The files that import anything inside `folder`, apart from the folder's own files. */
function importersOf(folder: string, files: readonly string[], repo: RepoView): string[] {
  return files.filter(
    (file) =>
      !inside(file, folder) &&
      [...repo.read(file).matchAll(SPECIFIER)].some(([, , , spec]) => {
        const target = resolveSpecifier(file, spec);
        return target !== undefined && inside(target, folder);
      }),
  );
}

/** A folder's move: where it was and where it goes. */
interface Move {
  readonly from: string;
  readonly to: string;
}

/** The specifier as it reads after the move, or `undefined` when it stays as written. */
function movedSpecifier(file: string, spec: string, move: Move): string | undefined {
  const target = resolveSpecifier(file, spec);
  if (target === undefined) return undefined;
  if (inside(file, move.from)) return spec.startsWith('.') && !inside(target, move.from) ? aliasOf(target) : undefined;
  return inside(target, move.from) ? aliasOf(`${move.to}${target.slice(move.from.length)}`) : undefined;
}

/**
 * The file's text with every specifier that resolves into the moved folder re-pointed at its new place. A file moving
 * with the folder keeps its own relative imports and reaches everything outside the folder by the `@/` alias, as any
 * Slide may.
 */
function repointed(file: string, text: string, move: Move): string {
  return text.replace(SPECIFIER, (whole, ...[lead, quote, spec]: string[]) => {
    const next = movedSpecifier(file, spec, move);
    return next === undefined ? whole : `${lead}${quote}${next}${quote}`;
  });
}

/** Every file the move rewrites, by the path it has once moved: importers of the folder and the folder's own files. */
function repointedFiles(move: Move, files: readonly string[], repo: RepoView): ReusePlan['edits'] {
  return [...importersOf(move.from, files, repo), ...files.filter((file) => inside(file, move.from))]
    .map((file) => ({ file, text: repointed(file, repo.read(file), move) }))
    .filter(({ file, text }) => text !== repo.read(file))
    .map(({ file, text }) => ({
      path: inside(file, move.from) ? `${move.to}${file.slice(move.from.length)}` : file,
      text,
    }));
}

/** The name a Slide's `slide.tsx` exports its Slide under: `export const <name> = slide(`. */
function exportedName(entry: string): string | undefined {
  return /export const (\w+) = slide\(/.exec(entry)?.[1];
}

/** Whether an Episode's record holds this Slide folder as its Title slide (`title: <name>`, imported from it). */
function isTitleSlide(episode: string, slug: string, repo: RepoView): boolean {
  const record = `${EPISODES_DIR}/${episode}/${episode}.ts`;
  if (!repo.exists(record)) return false;
  const text = repo.read(record);
  const title = /\btitle:\s*(\w+)/.exec(text)?.[1];
  if (title === undefined) return false;
  return new RegExp(`import \\{[^}]*\\b${title}\\b[^}]*\\} from ['"]\\./slides/${slug}/slide['"]`).test(text);
}

/** The Section file with `name` imported from `spec` and appended to its list. */
function withReference(section: string, name: string, spec: string): string | undefined {
  const list = /(:\s*Section\s*=\s*\[)([\s\S]*?)(\]\s*;)/.exec(section);
  if (list === null) return undefined;
  const items = list[2].trimEnd().replace(/,$/, '');
  const appended = section.replace(list[0], `${list[1]}${items}, ${name}${list[3]}`);
  const imports = [...appended.matchAll(IMPORT_LINE)];
  const last = imports.at(-1);
  const at = last === undefined ? 0 : (last.index ?? 0) + last[0].length;
  const line = `import { ${name} } from '${spec}';`;
  return last === undefined ? `${line}\n${appended}` : `${appended.slice(0, at)}\n${line}${appended.slice(at)}`;
}

interface Origin {
  readonly folder: string;
  /** The Episode whose folder holds the Slide; absent when the Slide is already in the pool. */
  readonly owner?: string;
}

function findOrigin(slug: string, repo: RepoView): Origin | string {
  const pooled = `${SLIDE_POOL_DIR}/${slug}`;
  const owners = repo
    .folders(EPISODES_DIR)
    .filter((episode) => repo.exists(`${EPISODES_DIR}/${episode}/slides/${slug}`));
  const titled = owners.filter((episode) => isTitleSlide(episode, slug, repo));
  if (titled.length > 0) {
    return `"${slug}" is the Title slide of ${titled.join(', ')}; a Title slide's anchor stays per Episode, so it is never reused.`;
  }
  if (repo.exists(pooled)) {
    return owners.length === 0
      ? { folder: pooled }
      : `"${slug}" is in the Slide pool and also in ${owners.join(', ')}: Slide slugs are unique across every Episode and the pool.`;
  }
  if (owners.length === 0) return `No Slide folder is named "${slug}", in any Episode's slides/ or in the Slide pool.`;
  if (owners.length > 1) {
    return `"${slug}" names a Slide in ${owners.join(', ')}: Slide slugs are unique across every Episode and the pool.`;
  }
  return { folder: `${EPISODES_DIR}/${owners[0]}/slides/${slug}`, owner: owners[0] };
}

/** Why the reusing Episode cannot take the Slide, if it cannot: no such Episode or Section, or it holds it already. */
function targetRefusals(request: ReuseRequest, origin: Origin, repo: RepoView): string[] {
  const { slug, into } = request;
  const sectionFile = sectionFileOf(request);
  const holders = importersOf(origin.folder, repo.sourceFiles(), repo).filter((file) =>
    inside(file, `${EPISODES_DIR}/${into}`),
  );
  return [
    ...(repo.exists(`${EPISODES_DIR}/${into}`) ? [] : [`No Episode folder ${EPISODES_DIR}/${into}.`]),
    ...(repo.exists(sectionFile) ? [] : [`The Episode ${into} has no Section file ${sectionFile}.`]),
    ...(holders.length === 0 ? [] : [`The Episode ${into} already holds "${slug}" (${holders.join(', ')}).`]),
  ];
}

function sectionFileOf({ into, section }: ReuseRequest): string {
  return `${EPISODES_DIR}/${into}/sections/${section}.ts`;
}

/** The reusing Section file with the pool Slide imported and listed, or why it cannot be. */
function referenceEdit(request: ReuseRequest, origin: Origin, repo: RepoView): ReusePlan['edits'][number] | string {
  const sectionFile = sectionFileOf(request);
  const name = exportedName(repo.read(`${origin.folder}/slide.tsx`));
  if (name === undefined) return `${origin.folder}/slide.tsx exports no \`export const <name> = slide(\`.`;
  const section = repo.read(sectionFile);
  if (new RegExp(`import \\{[^}]*\\b${name}\\b`).test(section)) {
    return `${sectionFile} already imports a binding named ${name}.`;
  }
  const text = withReference(section, name, `${aliasOf(`${SLIDE_POOL_DIR}/${request.slug}`)}/slide`);
  return text === undefined ? `${sectionFile} holds no \`: Section = [ … ];\` list.` : { path: sectionFile, text };
}

/**
 * The plan for reusing a Slide in another Episode, or every reason it is refused. The Slide moves to the pool on its
 * first reuse only; a Slide already there gains one more reference and nothing else changes.
 */
export function planReuse(request: ReuseRequest, repo: RepoView): ReuseResult {
  const odd = [request.slug, request.into, request.section].find((name) => !KEBAB.test(name));
  if (odd !== undefined) {
    return { ok: false, reasons: [`"${odd}" is no slug: slide, Episode and Section are named in kebab-case.`] };
  }
  const origin = findOrigin(request.slug, repo);
  if (typeof origin === 'string') return { ok: false, reasons: [origin] };
  const refusals = targetRefusals(request, origin, repo);
  if (refusals.length > 0) return { ok: false, reasons: refusals };
  const reference = referenceEdit(request, origin, repo);
  if (typeof reference === 'string') return { ok: false, reasons: [reference] };
  if (origin.owner === undefined) return { ok: true, plan: { edits: [reference] } };
  const move = { from: origin.folder, to: `${SLIDE_POOL_DIR}/${request.slug}` };
  return { ok: true, plan: { move, edits: [...repointedFiles(move, repo.sourceFiles(), repo), reference] } };
}
