// The page summaries (FE-004 §4): what `npm run registry` writes from every composition to
// `src/episodes/lib/page-summaries.generated.json`, one map per kind of composed page, keyed like the composition
// registries. Plain data only, so a page that lists another reads its words, minutes and outline without importing its
// Slides. The summaries are worked out by `src/episodes/lib/composition-summaries.ts`, which the registry script loads
// through Vitest, since a composition imports Slides plain `node` cannot run.
import type { RegistryFile } from './episode-registry.pure.ts';

/** A summary as the registry script hands it over: plain data, one value per locale. */
type Summary = Readonly<Record<string, unknown>>;

/** Every composed page's summary, by kind and then by id. */
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
