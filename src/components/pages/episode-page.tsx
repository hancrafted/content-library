import { EpisodePageContainer } from '@/components/episode-page/episode-page-container';
import { episodeSlugPublishedOn, episodeSlugStatus } from '@/components/episodes/episode-status';
import { episodeFacts } from '@/components/episodes/page-facts';
import { episodeCopy, findEpisode } from '@/components/episodes/registry';
import { eventEpisodeChrome } from '@/components/events/event-episode-chrome';
import { JsonLdScript } from '@/components/json-ld';
import type { EpisodeRecord } from '@/components/slide-master/slide';
import type { Locale } from '@/lib/locale.pure';
import type { PageCopy } from '@/lib/page-metadata.pure';
import { episodePageRoute, eventEpisodeRoute, isAnyEpisodeSlug, isEpisodeSlug } from '@/lib/routes';
import { SITE_URL } from '@/lib/site-url';
import { episodeJsonLd } from '@/lib/structured-data.pure';

/** The Episode's structured data on its own page when published; none under an Event, where the article is not. */
function ownJsonLd(slug: string, locale: Locale, episode: EpisodeRecord) {
  const own = episode.slug;
  if (!isEpisodeSlug(own) || episodeSlugStatus(slug) !== 'published') return undefined;
  const { title, description } = episodeCopy(slug, locale);
  return episodeJsonLd(SITE_URL, locale, {
    slug: own,
    title,
    description,
    publishedOn: episodeSlugPublishedOn(slug),
    youtube: episode.youtube?.[locale],
  });
}

/**
 * Every Episode's page component (FE-007 §1): looks the Episode up and renders it through the container (FE-002),
 * with its structured data when published. An Event-scoped page names its `event`: the page is served under the
 * Event, carries the Event's breadcrumb, past notice and Playlist walk, and its structured data stays on the
 * Episode's own page.
 */
export async function EpisodePage({ slug, locale, event }: { slug: string; locale: Locale; event?: string }) {
  const episode = findEpisode(slug);
  if (event === undefined) {
    const data = ownJsonLd(slug, locale, episode);
    return (
      <>
        {data && <JsonLdScript data={data} />}
        <EpisodePageContainer locale={locale} episode={episode} route={episodePageRoute(episode.slug)} />
      </>
    );
  }
  const chrome = await eventEpisodeChrome(event, slug, locale);
  return (
    <EpisodePageContainer locale={locale} episode={episode} route={eventEpisodeRoute(event, slug)} event={chrome} />
  );
}

/**
 * An Episode page's title, description and release date, read through the registry, and the facts its treatment
 * turns on, for `pageMetadata` (FE-008). A tooling page has no facts: it is never indexed.
 */
export function episodePageCopy(slug: string, locale: Locale): PageCopy {
  const { title, description } = episodeCopy(slug, locale);
  const publishedOn = episodeSlugPublishedOn(slug);
  return {
    title,
    description,
    ...(isAnyEpisodeSlug(slug) ? { facts: episodeFacts(slug) } : {}),
    ...(publishedOn ? { publishedOn } : {}),
  };
}
