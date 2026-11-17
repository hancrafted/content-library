const LIMIT = 3;

interface Candidate {
  readonly slug: string;
  readonly ref: { readonly kind: string };
  readonly status: string;
  readonly visibility: string;
  readonly tags: readonly string[];
  readonly publishedOn?: string;
}

interface EventWithTags {
  readonly tags: readonly string[];
  readonly playlist: { readonly episodes: readonly { readonly episode: { readonly slug: string } }[] };
}

// decision: docs/adr/0016-content-data-model.md
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
