import type { Confidence } from './confidence.pure';
import type { SlideSource } from './slide-source.pure';

/*
 * Speaker note citations read across records (design-ADR 0016, Citations rules 7 and 12): a cited Research question
 * exists, a published Episode cites none still in Staging, and a Research page finds the notes that cite it.
 */

/** What the checks need of a Research question: its id and whether it is still in an Episode's Staging. */
interface CitableResearch {
  readonly id: string;
  readonly staged: boolean;
}

/** What a Speaker note shows of a Research question it cites: its title and confidence, and whether it has a page. */
export interface CitedResearch extends CitableResearch {
  readonly title: string;
  readonly confidence: Confidence;
}

/** What the checks need of an Episode: its slug and whether it is published. */
interface CitingEpisode {
  readonly slug: string;
  readonly status: string;
}

/** The name a refusal gives a source item: where it sits, down to its slug. */
export function sourceRecord({ episode, slide, note, slug }: SlideSource): string {
  return `${episode}/${slide}/${note}/${slug}`;
}

function problemOf(
  source: SlideSource & { readonly research: string },
  research: readonly CitableResearch[],
  published: ReadonlySet<string>,
): string | undefined {
  const cited = research.filter(({ id }) => id === source.research);
  if (cited.length === 0) return `research names ${source.research}, which is no Research question`;
  // A staged refresh may shadow a wiki id; only an id that lives nowhere but Staging blocks publishing.
  if (published.has(source.episode) && cited.every(({ staged }) => staged))
    return `the published Episode cites ${source.research}, which is still in Staging: promote it before publishing`;
  return undefined;
}

/**
 * One problem per `research` source item that names no Research question, or that a published Episode cites while
 * the question exists only in Staging. A Run's notes may cite staged research until the Episode is published.
 */
export function citationProblems(
  sources: readonly SlideSource[],
  research: readonly CitableResearch[],
  episodes: readonly CitingEpisode[],
): { kind: 'slide-source'; record: string; message: string }[] {
  const published = new Set(episodes.filter(({ status }) => status === 'published').map(({ slug }) => slug));
  return sources.flatMap((source) => {
    if (source.research === undefined) return [];
    const message = problemOf(source, research, published);
    return message === undefined ? [] : [{ kind: 'slide-source' as const, record: sourceRecord(source), message }];
  });
}
