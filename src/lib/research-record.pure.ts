import { RESEARCH_ID, researchSchema, type ResearchFrontmatter } from './content-schemas.pure';
import { readFrontmatter, reasonsOf } from './frontmatter.pure';
import { confirmedByHan } from './han-confirmation.pure';

/*
 * One research file read into a Research question: its id from the folder name, its frontmatter through the
 * research schema, its body as written. A file that cannot be read yields a reason, never a throw.
 */

/** Where the wiki keeps promoted research; anything else is an Episode's Staging. */
const WIKI = 'docs/llm-wiki/research/';

/** A Research question: its id from the folder name, where it lives and what its file says. */
export interface ResearchRecord extends ResearchFrontmatter {
  /** `AIE-0001`: the `<category>-<####>` part of the folder name. */
  readonly id: string;
  /** The file, relative to the repository root. */
  readonly path: string;
  /** Whether the file is still in an Episode's Staging: citable by that Run, but with no page until promoted. */
  readonly staged: boolean;
  /**
   * Whether Han has confirmed `confidence` and `informs`: a `verified` entry by `human:han` at or after
   * `generated.at`. Until then both are the writer's proposal, and a re-run that moves `generated.at` makes them one
   * again (design-ADR 0016, Citations rule 5).
   */
  readonly confirmed: boolean;
  /** The Markdown after the frontmatter: the question, Context, Answer, Findings, Caveats and link definitions. */
  readonly body: string;
}

export type ResearchRead =
  | { readonly record: ResearchRecord; readonly reasons?: undefined }
  | { readonly record?: undefined; readonly reasons: readonly string[] };

/** The Research question a file holds, or why it holds none. */
export function readResearchFile(path: string, markdown: string): ResearchRead {
  const folder = path.split('/').at(-2) ?? '';
  const id = RESEARCH_ID.exec(folder)?.[1];
  if (id === undefined) return { reasons: [`the folder "${folder}" is not <category>-<####>__<slug>`] };
  const front = readFrontmatter(markdown);
  if ('reason' in front) return { reasons: [front.reason] };
  const result = researchSchema.safeParse(front.data);
  if (!result.success) return { reasons: reasonsOf(result.error.issues) };
  const record: ResearchRecord = {
    ...result.data,
    id,
    path,
    staged: !path.startsWith(WIKI),
    confirmed: confirmedByHan(result.data),
    body: front.body.trim(),
  };
  return { record };
}
