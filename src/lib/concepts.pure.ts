import { readConceptFile, type ConceptFile } from './concept-record.pure';
import { themeSchema } from './content-schemas.pure';
import type { ThemeLook } from './episode-overview';
import { reasonsOf } from './frontmatter.pure';
import { KEBAB } from './kebab.pure';

/*
 * The Concept hierarchy (SKOS): what the Concepts say about each other. Every id they name resolves, `broader` has
 * no cycle, and a theme belongs to a top Concept (`broader: []`) and every top Concept has one. The store derives
 * `narrower`, the inverse of `broader`, and mirrors `related`, so neither is kept by hand on two sides.
 */

/** A Concept as the store holds it: its file, plus the links the store derives. */
export interface Concept extends Omit<ConceptFile, 'related'> {
  /** SKOS narrower: every Concept whose `broader` names this one, derived, in Concept order. */
  readonly narrower: readonly string[];
  /** SKOS related, mirrored: every Concept either side names, in Concept order. */
  readonly related: readonly string[];
}

/** One problem with the hierarchy: the Concept or theme it concerns and one sentence on what is wrong. */
export interface ConceptProblem {
  readonly kind: 'concept' | 'theme';
  readonly record: string;
  readonly message: string;
}

/** Records read from their raw form, with a problem for each one that could not be read. */
export interface ConceptReads<T> {
  readonly value: T;
  readonly refusals: readonly ConceptProblem[];
}

export function isRecord(raw: unknown): raw is Record<string, unknown> {
  return typeof raw === 'object' && raw !== null && !Array.isArray(raw);
}

/** The theme record read through the theme schema: one look per top Concept id. */
export function readThemes(raw: unknown): ConceptReads<Record<string, ThemeLook>> {
  const value: Record<string, ThemeLook> = {};
  if (!isRecord(raw)) {
    const message = 'the themes are one record keyed by top Concept id';
    return { value, refusals: [{ kind: 'theme', record: '(themes)', message }] };
  }
  const refusals: ConceptProblem[] = [];
  for (const [id, look] of Object.entries(raw)) {
    const result = themeSchema.safeParse(look);
    if (!KEBAB.test(id)) refusals.push({ kind: 'theme', record: id, message: 'the Concept id must be kebab-case' });
    if (result.success) value[id] = result.data;
    else
      refusals.push(
        ...reasonsOf(result.error.issues).map((message) => ({ kind: 'theme' as const, record: id, message })),
      );
  }
  return { value, refusals };
}

/** Every Concept file read into a Concept, each one that cannot be read named by its path. */
export function readConcepts(files: readonly { path: string; markdown: string }[]): ConceptReads<ConceptFile[]> {
  const reads = files.map((file) => ({ file, read: readConceptFile(file.path, file.markdown) }));
  return {
    value: reads.flatMap(({ read }) => (read.concept ? [read.concept] : [])),
    refusals: reads.flatMap(({ file, read }) =>
      (read.reasons ?? []).map((message) => ({ kind: 'concept' as const, record: file.path, message })),
    ),
  };
}

/** Whether a Concept has no parent: a top Concept, the only kind that carries a theme. */
export function isTopConcept(concept: Pick<ConceptFile, 'broader'>): boolean {
  return concept.broader.length === 0;
}

function dangling(concepts: readonly ConceptFile[], known: ReadonlySet<string>): ConceptProblem[] {
  return concepts.flatMap(({ id, broader, related = [] }) => [
    ...broader
      .filter((parent) => !known.has(parent))
      .map((parent) => ({
        kind: 'concept' as const,
        record: id,
        message: `broader names ${parent}, which is no Concept`,
      })),
    ...related
      .filter((other) => !known.has(other))
      .map((other) => ({
        kind: 'concept' as const,
        record: id,
        message: `related names ${other}, which is no Concept`,
      })),
  ]);
}

/** The Concepts that reach themselves by following `broader`, each named once. */
function cycles(concepts: readonly ConceptFile[]): ConceptProblem[] {
  const parents = new Map(concepts.map(({ id, broader }) => [id, broader]));
  const reachesItself = (start: string): boolean => {
    const seen = new Set<string>();
    const queue = [...(parents.get(start) ?? [])];
    while (queue.length > 0) {
      const next = queue.shift() as string;
      if (next === start) return true;
      if (seen.has(next)) continue;
      seen.add(next);
      queue.push(...(parents.get(next) ?? []));
    }
    return false;
  };
  return concepts
    .filter(({ id }) => reachesItself(id))
    .map(({ id }) => ({ kind: 'concept', record: id, message: 'broader leads back to this Concept: a cycle' }));
}

function themeProblems(concepts: readonly ConceptFile[], themed: readonly string[]): ConceptProblem[] {
  const byId = new Map(concepts.map((concept) => [concept.id, concept]));
  return [
    ...themed.flatMap((id): ConceptProblem[] => {
      const concept = byId.get(id);
      if (concept === undefined) return [{ kind: 'theme', record: id, message: 'the theme names no Concept' }];
      if (isTopConcept(concept)) return [];
      return [{ kind: 'theme', record: id, message: 'a Concept with a parent carries no theme' }];
    }),
    ...concepts
      .filter((concept) => isTopConcept(concept) && !themed.includes(concept.id))
      .map(({ id }) => ({
        kind: 'concept' as const,
        record: id,
        message: 'a top Concept needs a theme: a new top Concept is a design decision, not a content edit',
      })),
  ];
}

/** What is wrong with the Concepts and the themes keyed by Concept id; none when they are sound. */
export function conceptProblems(concepts: readonly ConceptFile[], themed: readonly string[]): ConceptProblem[] {
  const known = new Set(concepts.map(({ id }) => id));
  return [...dangling(concepts, known), ...cycles(concepts), ...themeProblems(concepts, themed)];
}

/** The Concepts with `narrower` derived and `related` mirrored. Call it on Concepts without problems. */
export function linkConcepts(concepts: readonly ConceptFile[]): Concept[] {
  const order = concepts.map(({ id }) => id);
  const inOrder = (ids: ReadonlySet<string>) => order.filter((id) => ids.has(id));
  return concepts.map((concept) => {
    const narrower = new Set(concepts.filter(({ broader }) => broader.includes(concept.id)).map(({ id }) => id));
    const related = new Set([
      ...(concept.related ?? []),
      ...concepts.filter(({ related = [] }) => related.includes(concept.id)).map(({ id }) => id),
    ]);
    return { ...concept, narrower: inOrder(narrower), related: inOrder(related) };
  });
}
