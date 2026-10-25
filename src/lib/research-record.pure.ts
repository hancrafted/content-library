import { parse } from 'yaml';
import { z } from 'zod';
import { RESEARCH_ID, researchSchema, type ResearchFrontmatter } from './content-schemas.pure';

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

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/;

const reasonsOf = (issues: readonly z.core.$ZodIssue[]) =>
  issues.map((issue) => `${issue.path.length > 0 ? `${issue.path.join('.')}: ` : ''}${issue.message}`);

function yamlOf(markdown: string): { data: unknown } | { reason: string } {
  const front = FRONTMATTER.exec(markdown)?.[1];
  if (front === undefined) return { reason: 'the file has no frontmatter' };
  try {
    return { data: parse(front) };
  } catch (error) {
    const reason = error instanceof Error ? error.message.split('\n')[0] : 'unreadable';
    return { reason: `the frontmatter is not valid YAML: ${reason}` };
  }
}

/** The Research question a file holds, or why it holds none. */
export function readResearchFile(path: string, markdown: string): ResearchRead {
  const folder = path.split('/').at(-2) ?? '';
  const id = RESEARCH_ID.exec(folder)?.[1];
  if (id === undefined) return { reasons: [`the folder "${folder}" is not <category>-<####>__<slug>`] };
  const yaml = yamlOf(markdown);
  if ('reason' in yaml) return { reasons: [yaml.reason] };
  const result = researchSchema.safeParse(yaml.data);
  return result.success ? { record: { ...result.data, id, path } } : { reasons: reasonsOf(result.error.issues) };
}
