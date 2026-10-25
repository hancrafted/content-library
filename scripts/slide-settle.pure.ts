// Settling instances (design-ADR 0016, Slide reuse rule 3): the plan `npm run slides:settle` carries out at the end of
// a Run. An instance no edit has touched is deleted and its Episode lists the pool Slide again, so no unchanged
// instance outlives its Run; an edited one stays for Promotion. This file decides; it writes nothing.
import {
  copiedFiles,
  folderFiles,
  instanceFolderOf,
  poolFolderOf,
  repointedSection,
  sectionsImporting,
  type FileText,
  type Format,
  type InstanceNames,
  type InstanceRepoView,
} from './slide-instance.pure.ts';
import { aliasOf, EPISODES_DIR, exportedName } from './slide-reuse.pure.ts';

export interface SettlePlan {
  /** Instance folders to delete, each untouched since its copy. */
  readonly removals: readonly string[];
  /** Section files pointed back at the pool Slide. */
  readonly edits: readonly FileText[];
  /** Instances kept, each with why: edited, or its origin is gone. */
  readonly kept: readonly string[];
}

const MARKER = /copiedFrom:\s*\{\s*slug:\s*(['"])([a-z0-9-]+)\1,\s*commit:\s*(['"])([0-9a-f]+)\3,?\s*\}/;

/** An instance found in an Episode: its names and the commit its copy was made at. */
interface Found {
  readonly episode: string;
  readonly names: InstanceNames;
  readonly commit: string;
}

type Verdict = { readonly found: Found } | { readonly kept: string };

/** Every Slide folder of every Episode that carries a `copiedFrom` marker, judged findable or kept. */
function instancesIn(repo: InstanceRepoView): Verdict[] {
  return repo.folders(EPISODES_DIR).flatMap((episode) =>
    repo.folders(`${EPISODES_DIR}/${episode}/slides`).flatMap((as): Verdict[] => {
      const to = instanceFolderOf(episode, as);
      const entry = `${to}/slide.tsx`;
      const marker = repo.exists(entry) ? MARKER.exec(repo.read(entry)) : null;
      if (marker === null) return [];
      const [, , origin, , commit] = marker;
      const pool = `${poolFolderOf(origin)}/slide.tsx`;
      const from = repo.exists(pool) ? exportedName(repo.read(pool)) : undefined;
      return from === undefined
        ? [{ kept: `${to}: its origin ${poolFolderOf(origin)} is gone; Promotion decides.` }]
        : [{ found: { episode, names: { origin, from, as, to }, commit } }];
    }),
  );
}

/** Whether an instance holds exactly what its copy writes from the pool Slide as it is now, formatted alike. */
async function untouched({ names, commit }: Found, repo: InstanceRepoView, format: Format): Promise<boolean> {
  const instance = folderFiles(names.to, repo);
  const copy = copiedFiles(folderFiles(poolFolderOf(names.origin), repo), names, commit);
  if (typeof copy === 'string' || copy.length !== instance.length) return false;
  const expected = await Promise.all(
    copy.map(async ({ path, text, format: rewritten }) => ({
      path,
      text: rewritten ? await format(path, text) : text,
    })),
  );
  return expected.every(({ path, text }) => instance.some((file) => file.path === path && file.text === text));
}

/** The Episode's Section files pointed back at the pool Slide, under its binding and path, on top of earlier edits. */
function pointedBack({ episode, names }: Found, repo: InstanceRepoView, edits: Map<string, string>): void {
  const spec = `${aliasOf(poolFolderOf(names.origin))}/slide`;
  for (const { path, binding } of sectionsImporting(episode, names.to, repo)) {
    const text = edits.get(path) ?? repo.read(path);
    edits.set(path, repointedSection(text, { path, from: names.to, binding, name: names.from, spec }));
  }
}

/**
 * The plan for settling every instance. It compares against the pool Slide as it is now, which a Run never changes;
 * a pool Slide changed since the copy keeps the instance, so an edit is never lost.
 */
export async function planSettle(repo: InstanceRepoView, format: Format): Promise<SettlePlan> {
  const verdicts = instancesIn(repo);
  const kept = verdicts.flatMap((verdict) => ('kept' in verdict ? [verdict.kept] : []));
  const removals: string[] = [];
  const edits = new Map<string, string>();
  for (const verdict of verdicts) {
    if (!('found' in verdict)) continue;
    const { found } = verdict;
    if (!(await untouched(found, repo, format))) {
      kept.push(`${found.names.to}: edited since its copy from ${found.names.origin}; Promotion resolves it.`);
      continue;
    }
    removals.push(found.names.to);
    pointedBack(found, repo, edits);
  }
  return { removals, edits: [...edits].map(([path, text]) => ({ path, text })), kept };
}
