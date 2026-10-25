import { RESEARCH_ID, researchSchema, type ResearchFrontmatter } from './content-schemas.pure';
import { readFrontmatter, reasonsOf } from './frontmatter.pure';

/*
 * One research file read into a Research question: its id from the folder name, its frontmatter through the
 * research schema. A file that cannot be read yields a reason, never a throw.
 */

/** A Research question: its id from the folder name, where it lives and what its file says. */
export interface ResearchRecord extends ResearchFrontmatter {
  /** `AIE-0001`: the `<category>-<####>` part of the folder name. */
  readonly id: string;
  /** The file, relative to the repository root. */
  readonly path: string;
}

export type ResearchRead =
  | { readonly record: ResearchRecord; readonly reasons?: undefined }
  | { readonly record?: undefined; readonly reasons: readonly string[] };

/** The Research question a file holds, or why it holds none. */
export function readResearchFile(path: string, markdown: string): ResearchRead {
  const folder = path.split('/').at(-2) ?? '';
  const id = RESEARCH_ID.exec(folder)?.[1];
  if (id === undefined) return { reasons: [`the folder "${folder}" is not <category>-<####>__<slug>`] };
  const yaml = readFrontmatter(markdown);
  if ('reason' in yaml) return { reasons: [yaml.reason] };
  const result = researchSchema.safeParse(yaml.data);
  return result.success ? { record: { ...result.data, id, path } } : { reasons: reasonsOf(result.error.issues) };
}
