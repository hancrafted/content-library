import { conceptSchema, type ConceptFrontmatter } from './content-schemas.pure';
import { readFrontmatter, reasonsOf } from './frontmatter.pure';
import { KEBAB } from './kebab.pure';

/*
 * One Concept file read into a Concept: its id from the folder name (`docs/llm-wiki/concepts/<id>/concept.md`), its
 * frontmatter through the Concept schema, its body (definition first) as written. A file that cannot be read yields
 * a reason, never a throw.
 */

/** A Concept as its own file states it, before the store derives `narrower` and mirrors `related`. */
export interface ConceptFile extends ConceptFrontmatter {
  /** The kebab-case English name: the folder, the `/concepts/<id>` route and the reference value everywhere. */
  readonly id: string;
  /** The file, relative to the repository root. */
  readonly path: string;
  /** The Markdown after the frontmatter: the definition first, then the longer explanation. */
  readonly body: string;
}

export type ConceptRead =
  | { readonly concept: ConceptFile; readonly reasons?: undefined }
  | { readonly concept?: undefined; readonly reasons: readonly string[] };

const NARROWER = 'narrower is derived from every broader that names this Concept; do not write it';

function writesNarrower(data: unknown): boolean {
  return typeof data === 'object' && data !== null && 'narrower' in data;
}

/** The Concept a file holds, or why it holds none. */
export function readConceptFile(path: string, markdown: string): ConceptRead {
  const id = path.split('/').at(-2) ?? '';
  if (!KEBAB.test(id)) return { reasons: [`the folder "${id}" is not a kebab-case Concept id`] };
  const front = readFrontmatter(markdown);
  if ('reason' in front) return { reasons: [front.reason] };
  if (writesNarrower(front.data)) return { reasons: [NARROWER] };
  const result = conceptSchema.safeParse(front.data);
  if (!result.success) return { reasons: reasonsOf(result.error.issues) };
  return { concept: { ...result.data, id, path, body: front.body.trim() } };
}
