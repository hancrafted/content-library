import type { EpisodeId } from './catalogue/record-routes';
import { duplicates } from './duplicates';
import type { LoadedEpisode } from './episode-refusals';

// decision: docs/decision-records/0016-content-data-model.md
export const FEATURED = [
  'onboard-ai-every-time',
  'ai-attention-span',
  'ai-gives-you-more-work',
] as const satisfies readonly [EpisodeId, EpisodeId, EpisodeId];

const SLOTS = FEATURED.length;

function slotRefusal(id: string, episodes: ReadonlyMap<string, LoadedEpisode>): string | undefined {
  const episode = episodes.get(id);
  if (episode === undefined) return `slot "${id}" names no Episode`;
  if (episode.visibility !== 'public') return `slot "${id}" is ${episode.visibility}, but a Featured Episode is public`;
  if (episode.status !== 'published') return `slot "${id}" is ${episode.status}, but a Featured Episode is published`;
  return undefined;
}

export function featuredRefusals(featured: readonly string[], episodes: ReadonlyMap<string, LoadedEpisode>): string[] {
  return [
    ...(featured.length === SLOTS ? [] : [`names ${featured.length} slots, but Featured fills ${SLOTS}`]),
    ...duplicates(featured).map((id) => `slot "${id}" is named twice`),
    ...featured.flatMap((id) => slotRefusal(id, episodes) ?? []),
  ].map((sentence) => `Featured: ${sentence}`);
}
