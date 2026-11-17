// decision: FE-004 §4
import type { RegistryFile } from './episode-registry.pure.ts';

type Summary = Readonly<Record<string, unknown>>;

export interface Summaries {
  readonly episodes: Readonly<Record<string, Summary>>;
  readonly templates: Readonly<Record<string, Summary>>;
  readonly explorablePages: Readonly<Record<string, Summary>>;
  readonly guides: Readonly<Record<string, Summary>>;
}

const PAGE_SUMMARIES_PATH = 'src/episodes/lib/page-summaries.generated.json';

/** The one generated summaries file: JSON, since a comment cannot say "generated", its name does. */
export function pageSummariesFile(summaries: Summaries): RegistryFile {
  return { path: PAGE_SUMMARIES_PATH, text: `${JSON.stringify(summaries)}\n` };
}
