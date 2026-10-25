// Resolving an instance at the Promotion Gate (design-ADR 0016, Slide reuse rule 4): the plan `npm run slides:promote`
// carries out, one decision per instance, Han deciding.
// - `update`: the instance's content replaces the pool Slide, the instance folder goes, and its Episode lists the pool
//   Slide again under a Pinned anchor, the retired instance slug, so that Episode's anchor does not move. Every Episode
//   holding the pool Slide is listed. A pool Slide changed since the copy is refused until Han has reconciled it.
// - `own`: the `copiedFrom` marker goes; slug, folder and anchors stay.
// This file decides; it reads through the view it is handed and writes nothing.
import {
  camelOf,
  folderFiles,
  instanceFolderOf,
  MARKER,
  poolFolderOf,
  repointedSection,
  sectionsImporting,
  type CopiedFile,
  type FileText,
  type InstanceNames,
  type InstanceRepoView,
} from './slide-instance.pure.ts';
import { pinnedSection } from './slide-pin.pure.ts';
import { aliasOf, EPISODES_DIR, exportedName, type RepoView } from './slide-reuse.pure.ts';

export interface PromoteRequest {
  /** The instance's slug. */
  readonly instance: string;
  readonly outcome: 'update' | 'own';
  /** Han has carried the pool Slide's changes since the copy into the instance by hand. */
  readonly reconciled?: boolean;
}

/** The commits, or uncommitted work, that changed a pool Slide folder since a commit; none when it is unchanged. */
export type ChangedSince = (folder: string, commit: string) => readonly string[];

export interface PromotePlan {
  /** Folders deleted before the writes. */
  readonly removals: readonly string[];
  /** Files written whole; `format` marks one the plan rewrote. */
  readonly writes: readonly CopiedFile[];
  /** Whole-file replacements of Section files, each formatted. */
  readonly edits: readonly FileText[];
  /** Every Episode the update changes the shared Slide in; none for `own`. */
  readonly affected: readonly string[];
}

export type PromoteResult =
  { readonly ok: true; readonly plan: PromotePlan } | { readonly ok: false; readonly reasons: readonly string[] };

/** An instance found in an Episode: its names and the commit its copy was made at. */
export interface FoundInstance {
  readonly episode: string;
  readonly names: InstanceNames;
  readonly commit: string;
}

/** The instance of that slug, with its marker, or why there is none. */
export function findInstance(slug: string, repo: RepoView): FoundInstance | string {
  const episode = repo.folders(EPISODES_DIR).find((each) => repo.exists(`${instanceFolderOf(each, slug)}/slide.tsx`));
  const to = episode === undefined ? '' : instanceFolderOf(episode, slug);
  const marker = episode === undefined ? null : MARKER.exec(repo.read(`${to}/slide.tsx`));
  if (episode === undefined || marker === null) {
    return `"${slug}" is no instance: no Episode's slides/${slug}/slide.tsx carries a copiedFrom marker.`;
  }
  const [, , origin, , commit] = marker;
  const pool = `${poolFolderOf(origin)}/slide.tsx`;
  const from = repo.exists(pool) ? exportedName(repo.read(pool)) : undefined;
  return { episode, names: { origin, from: from ?? camelOf(origin), as: slug, to }, commit };
}

/** The instance's `slide.tsx` without its marker. */
function unmarked(text: string): string {
  return text.replace(new RegExp(`\\s*${MARKER.source},?`), '');
}

/** Every Episode whose Sections hold the pool Slide by reference, the instance's own among them. */
function affectedEpisodes({ episode, names }: FoundInstance, repo: RepoView): string[] {
  const holding = repo
    .folders(EPISODES_DIR)
    .filter((each) => sectionsImporting(each, poolFolderOf(names.origin), repo).length > 0);
  return [...new Set([...holding, episode])].sort();
}

/** Every instance one Episode holds, each with every Episode an update would change the shared Slide in. */
export function instancesOf(
  episode: string,
  repo: RepoView,
): { readonly instance: FoundInstance; readonly affected: readonly string[] }[] {
  return repo.folders(`${EPISODES_DIR}/${episode}/slides`).flatMap((slug) => {
    const found = findInstance(slug, repo);
    return typeof found === 'string' || found.episode !== episode
      ? []
      : [{ instance: found, affected: affectedEpisodes(found, repo) }];
  });
}

function updateRefusals(found: FoundInstance, repo: InstanceRepoView, changes: readonly string[]): string[] {
  const { names, episode, commit } = found;
  const pool = poolFolderOf(names.origin);
  if (!repo.exists(`${pool}/slide.tsx`)) return [`The pool Slide ${pool} is gone: promote "${names.as}" as its own.`];
  const leaving = folderFiles(names.to, repo).filter(
    ({ path, text }) => /\.tsx?$/.test(path) && /\bfrom\s*['"]\.\.\//.test(text),
  );
  return [
    ...leaving.map(({ path }) => `${path} imports from outside its folder, which the pool Slide cannot reach.`),
    ...(sectionsImporting(episode, pool, repo).length > 0
      ? [`${episode} holds "${names.origin}" beside its instance: promote "${names.as}" as its own.`]
      : []),
    ...(changes.length > 0
      ? [
          `${pool} changed since the copy at ${commit}: ${changes.join('; ')}. Carry those changes into ${names.to} by hand, then rerun with --reconciled.`,
        ]
      : []),
  ];
}

/** The instance's files as the pool Slide's: origin slug, origin binding, no marker. */
function poolWrites({ names }: FoundInstance, repo: InstanceRepoView): CopiedFile[] {
  const pool = poolFolderOf(names.origin);
  const slug = new RegExp(`slug:\\s*(['"])${names.as}\\1`);
  const binding = new RegExp(`\\b${camelOf(names.as)}\\b`, 'g');
  return folderFiles(names.to, repo).map(({ path, text }) => {
    const target = `${pool}${path.slice(names.to.length)}`;
    if (!/\.tsx?$/.test(path)) return { path: target, text, format: false };
    const entry = path === `${names.to}/slide.tsx` ? unmarked(text).replace(slug, `slug: '${names.origin}'`) : text;
    const renamed = entry.replace(binding, names.from);
    return { path: target, text: renamed, format: renamed !== text };
  });
}

/** The instance's Episode's Section files, listing the pool Slide under the instance's slug as a Pinned anchor. */
function pinnedEdits({ episode, names }: FoundInstance, repo: RepoView): FileText[] | string {
  const spec = `${aliasOf(poolFolderOf(names.origin))}/slide`;
  const listing = sectionsImporting(episode, names.to, repo);
  if (listing.length === 0) return `No Section of ${episode} lists "${names.as}".`;
  const edits = listing.map(({ path, binding }) => {
    const repointed = repointedSection(repo.read(path), { path, from: names.to, binding, name: names.from, spec });
    return { path, text: pinnedSection(repointed, names.from, names.as) };
  });
  const unlisted = edits.find(({ text }) => text === undefined);
  if (unlisted !== undefined) return `${unlisted.path} holds no \`: Section = [ … ];\` list naming ${names.from}.`;
  return edits.map(({ path, text }) => ({ path, text: text ?? '' }));
}

function planUpdate(found: FoundInstance, repo: InstanceRepoView): PromoteResult {
  const edits = pinnedEdits(found, repo);
  if (typeof edits === 'string') return { ok: false, reasons: [edits] };
  return {
    ok: true,
    plan: {
      removals: [poolFolderOf(found.names.origin), found.names.to],
      writes: poolWrites(found, repo),
      edits,
      affected: affectedEpisodes(found, repo),
    },
  };
}

function planOwn({ names }: FoundInstance, repo: RepoView): PromoteResult {
  const path = `${names.to}/slide.tsx`;
  const write = { path, text: unmarked(repo.read(path)), format: true };
  return { ok: true, plan: { removals: [], writes: [write], edits: [], affected: [] } };
}

/** The plan for resolving one instance at the Promotion Gate, or every reason it is refused. */
export function planPromote(request: PromoteRequest, repo: InstanceRepoView, changed: ChangedSince): PromoteResult {
  const found = findInstance(request.instance, repo);
  if (typeof found === 'string') return { ok: false, reasons: [found] };
  if (request.outcome === 'own') return planOwn(found, repo);
  const changes = request.reconciled === true ? [] : changed(poolFolderOf(found.names.origin), found.commit);
  const refusals = updateRefusals(found, repo, changes);
  return refusals.length > 0 ? { ok: false, reasons: refusals } : planUpdate(found, repo);
}
