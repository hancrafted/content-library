// Adapting a reused Slide (design-ADR 0016, Slide reuse rules 3, 6 and 7): the plan `npm run slides:adapt` carries
// out. The pool Slide is copied into one Episode's own `slides/` under a slug of its own, marked
// `copiedFrom: { slug, commit }`, and that Episode lists the copy in place of its reference, so every other Episode
// keeps the pool Slide. Public and unlisted Episodes are treated alike: nothing here reads visibility. This file
// decides; it reads through the view it is handed and writes nothing.
import {
  camelOf,
  copiedFiles,
  folderFiles,
  foldersNamed,
  instanceFolderOf,
  poolFolderOf,
  repointedSection,
  sectionsImporting,
  type CopiedFile,
  type FileText,
  type InstanceRepoView,
} from './slide-instance.pure.ts';
import { EPISODES_DIR, exportedName, KEBAB, withReference, type RepoView } from './slide-reuse.pure.ts';

export interface AdaptRequest {
  /** The pool Slide's slug. */
  readonly origin: string;
  /** The instance's own slug, which names its folder: never the origin's. */
  readonly as: string;
  /** The Episode the instance belongs to. */
  readonly into: string;
  /** The Section to add the instance to, only when the Episode does not hold the pool Slide yet. */
  readonly section?: string;
  /** The commit the pool Slide is copied at, as `git rev-parse HEAD` gives it. */
  readonly commit: string;
}

export interface AdaptPlan {
  /** The instance's files, all new. */
  readonly copies: readonly CopiedFile[];
  /** Whole-file replacements of the Episode's Section file. */
  readonly edits: readonly FileText[];
}

export type AdaptResult =
  { readonly ok: true; readonly plan: AdaptPlan } | { readonly ok: false; readonly reasons: readonly string[] };

function originRefusals({ origin }: AdaptRequest, repo: RepoView): string[] {
  if (repo.exists(poolFolderOf(origin))) return [];
  return foldersNamed(origin, repo).length > 0
    ? [`"${origin}" is not in the Slide pool yet: run npm run slides:reuse first, then adapt it.`]
    : [`No Slide folder is named "${origin}".`];
}

function nameRefusals(request: AdaptRequest): string[] {
  const names = [request.origin, request.as, request.into, request.section ?? request.into];
  const odd = names.find((name) => !KEBAB.test(name));
  if (odd !== undefined) return [`"${odd}" is no slug: Slide, Episode and Section are named in kebab-case.`];
  return request.as === request.origin
    ? [`"${request.as}" is the origin's slug: an instance takes a slug of its own, so its anchor is its own.`]
    : [];
}

function adaptRefusals(request: AdaptRequest, repo: RepoView): string[] {
  const named = nameRefusals(request);
  if (named.length > 0) return named;
  const taken = foldersNamed(request.as, repo);
  const episode = `${EPISODES_DIR}/${request.into}`;
  return [
    ...originRefusals(request, repo),
    ...(taken.length === 0
      ? []
      : [`"${request.as}" is already the slug of ${taken.join(', ')}: Slide slugs are unique.`]),
    ...(repo.exists(episode) ? [] : [`No Episode folder ${episode}.`]),
  ];
}

function importsBinding(text: string, name: string): boolean {
  return new RegExp(`import \\{[^}]*\\b${name}\\b`).test(text);
}

/** The instance appended to the named Section, when the Episode does not hold the pool Slide yet. */
function appendedEdit(request: AdaptRequest, repo: RepoView): FileText | string {
  if (request.section === undefined) {
    return `The Episode ${request.into} does not hold "${request.origin}": name the Section to add the instance to with --section.`;
  }
  const path = `${EPISODES_DIR}/${request.into}/sections/${request.section}.ts`;
  const name = camelOf(request.as);
  if (!repo.exists(path)) return `The Episode ${request.into} has no Section file ${path}.`;
  if (importsBinding(repo.read(path), name)) return `${path} already imports a binding named ${name}.`;
  const text = withReference(repo.read(path), name, `../slides/${request.as}/slide`);
  return text === undefined ? `${path} holds no \`: Section = [ … ];\` list.` : { path, text };
}

/** The Section edit that lists the instance: in place of the Episode's reference, or appended to the named Section. */
function sectionEdit(request: AdaptRequest, repo: RepoView): FileText | string {
  const from = poolFolderOf(request.origin);
  const [held] = sectionsImporting(request.into, from, repo);
  if (held === undefined) return appendedEdit(request, repo);
  if (request.section !== undefined) {
    return `The Episode ${request.into} already holds "${request.origin}" in ${held.path}: drop --section, the instance takes its place.`;
  }
  const name = camelOf(request.as);
  const text = repo.read(held.path);
  if (importsBinding(text, name)) return `${held.path} already imports a binding named ${name}.`;
  const spec = `../slides/${request.as}/slide`;
  return { path: held.path, text: repointedSection(text, { ...held, from, name, spec }) };
}

/** The plan for adapting a pool Slide in one Episode, or every reason it is refused. */
export function planAdapt(request: AdaptRequest, repo: InstanceRepoView): AdaptResult {
  const refusals = adaptRefusals(request, repo);
  if (refusals.length > 0) return { ok: false, reasons: refusals };
  const folder = poolFolderOf(request.origin);
  const from = exportedName(repo.read(`${folder}/slide.tsx`));
  if (from === undefined)
    return { ok: false, reasons: [`${folder}/slide.tsx exports no \`export const <name> = slide(\`.`] };
  const names = { origin: request.origin, from, as: request.as, to: instanceFolderOf(request.into, request.as) };
  const copies = copiedFiles(folderFiles(folder, repo), names, request.commit);
  if (typeof copies === 'string') return { ok: false, reasons: [copies] };
  const edit = sectionEdit(request, repo);
  if (typeof edit === 'string') return { ok: false, reasons: [edit] };
  return { ok: true, plan: { copies, edits: [edit] } };
}
