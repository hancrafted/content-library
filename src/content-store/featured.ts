import type { EpisodeId } from './catalogue/routes';
import type { LoadedEpisode } from './episode-refusals';

/*
 * The Featured slots (design-ADR 0016): the three Episodes the landing page and the Episode overview lead with, lead
 * first. Re-ranking is this one edit. The store refuses slots that are not three distinct published public Episodes,
 * so a slot never names an upcoming, unlisted or missing one.
 */

/** The Featured slots, lead first. */
export const FEATURED = [
  'onboard-ai-every-time',
  'ai-attention-span',
  'ai-gives-you-more-work',
] as const satisfies readonly [EpisodeId, EpisodeId, EpisodeId];

/** How many slots Featured fills. */
const SLOTS = 3;

/** Why one slot cannot be Featured, or nothing: it names a published public Episode. */
function slotRefusal(id: string, episodes: ReadonlyMap<string, LoadedEpisode>): string | undefined {
  const episode = episodes.get(id);
  if (episode === undefined) return `slot "${id}" names no Episode`;
  if (episode.visibility !== 'public') return `slot "${id}" is ${episode.visibility}, but a Featured Episode is public`;
  if (episode.status !== 'published') return `slot "${id}" is ${episode.status}, but a Featured Episode is published`;
  return undefined;
}

/** Every refusal of the Featured slots: not three, one named twice, or one that is no published public Episode. */
export function featuredRefusals(featured: readonly string[], episodes: ReadonlyMap<string, LoadedEpisode>): string[] {
  const twice = featured.filter((id, index) => featured.indexOf(id) !== index);
  return [
    ...(featured.length === SLOTS ? [] : [`names ${featured.length} slots, but Featured fills ${SLOTS}`]),
    ...twice.map((id) => `slot "${id}" is named twice`),
    ...featured.flatMap((id) => slotRefusal(id, episodes) ?? []),
  ].map((sentence) => `Featured: ${sentence}`);
}
