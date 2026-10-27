/** The most Episodes an Event page suggests. */
const LIMIT = 3;

/** What the suggestion reads of an Episode record. */
interface Candidate {
  readonly slug: string;
  readonly ref: { readonly kind: string };
  readonly status: string;
  readonly visibility: string;
  readonly tags: readonly string[];
  readonly publishedOn?: string;
}

/** What it reads of an Event: its Tags and the Episodes its Playlist lists (a copy keeps its original's slug). */
interface EventWithTags {
  readonly tags: readonly string[];
  readonly playlist: { readonly episodes: readonly { readonly episode: { readonly slug: string } }[] };
}

/**
 * The Episodes an Event page suggests (design-ADR 0016, Event page): public, published Episodes no Event owns that
 * share a Tag with the Event, without the originals of the Episodes its Playlist lists, newest release first, at most
 * three. None leaves nothing to show.
 */
export function relatedEpisodes<Episode extends Candidate>(
  event: EventWithTags,
  episodes: readonly Episode[],
): Episode[] {
  const taught = new Set(event.playlist.episodes.map(({ episode }) => episode.slug));
  return episodes
    .filter(
      (episode) =>
        episode.ref.kind === 'standalone' &&
        episode.visibility === 'public' &&
        episode.status === 'published' &&
        !taught.has(episode.slug) &&
        episode.tags.some((tag) => event.tags.includes(tag)),
    )
    .sort((a, b) => (b.publishedOn ?? '').localeCompare(a.publishedOn ?? ''))
    .slice(0, LIMIT);
}
