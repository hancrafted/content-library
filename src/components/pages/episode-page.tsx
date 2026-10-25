import { EpisodePageContainer } from '@/components/episode-page/episode-page-container';
import { episodeSlugPublishedOn, episodeSlugStatus } from '@/components/episodes/episode-status';
import { episodeCopy, findEpisode } from '@/components/episodes/registry';
import { JsonLdScript } from '@/components/json-ld';
import type { Locale } from '@/lib/locale.pure';
import type { PageCopy } from '@/lib/page-metadata.pure';
import { episodePageRoute, isEpisodeSlug } from '@/lib/routes';
import { SITE_URL } from '@/lib/site-url';
import { episodeJsonLd } from '@/lib/structured-data.pure';

/**
 * Every Episode's page component (FE-007 §1): looks the Episode up and renders it through the container (FE-002),
 * with its structured data when published. An Event-scoped page passes its own `route`; its structured data stays on
 * the Episode's own page.
 */
export function EpisodePage({ slug, locale, route }: { slug: string; locale: Locale; route?: string }) {
  const episode = findEpisode(slug);
  const own = episode.slug;
  const { title, description } = episodeCopy(slug, locale);
  const data =
    route === undefined && isEpisodeSlug(own) && episodeSlugStatus(slug) === 'published'
      ? episodeJsonLd(SITE_URL, locale, {
          slug: own,
          title,
          description,
          publishedOn: episodeSlugPublishedOn(slug),
          youtube: episode.youtube?.[locale],
        })
      : undefined;
  return (
    <>
      {data && <JsonLdScript data={data} />}
      <EpisodePageContainer locale={locale} episode={episode} route={episodePageRoute(episode.slug, route)} />
    </>
  );
}

/** An Episode page's title, description, status and release date, read through the registry, for `pageMetadata` (FE-008); the status makes an upcoming page `noindex`. */
export function episodePageCopy(slug: string, locale: Locale): PageCopy {
  const { title, description } = episodeCopy(slug, locale);
  const publishedOn = episodeSlugPublishedOn(slug);
  return { title, description, status: episodeSlugStatus(slug), ...(publishedOn ? { publishedOn } : {}) };
}
