import { EpisodePageContainer } from '@/components/episode-page/episode-page-container';
import { episodeCopy, findEpisode } from '@/components/episodes/registry';
import { findPageRecord } from '@/components/episodes/tooling-pages';
import { JsonLdScript } from '@/components/json-ld';
import { episodePublishedOn, episodeStatus, episodeVideo, pageFacts } from '@/content-store/store';
import type { Locale } from '@/lib/locale.pure';
import type { PageCopy } from '@/lib/page-metadata.pure';
import { EPISODES_PATH_SLUGS, episodesPathPage, isEpisodesPathSlug, type EpisodesPathSlug } from '@/lib/routes';
import { SITE_URL } from '@/lib/site-url';
import { episodeJsonLd } from '@/lib/structured-data.pure';
import { isToolingSlug } from '@/lib/tooling-pages';
import { pageTreatment } from '@/lib/visibility.pure';
import { notFound } from 'next/navigation';

/** Whether the visibility predicate exports a page at `/episodes/<slug>/`: every tooling page and public Episode, no unlisted one. */
function isExported(slug: EpisodesPathSlug): boolean {
  const page = episodesPathPage(slug);
  return pageTreatment(page, pageFacts(page)).exported;
}

/**
 * One static param per page under `/episodes/` (FE-005): every tooling page and every Episode the visibility
 * predicate exports there, so an unlisted Episode has no `/episodes/` page, only its Event's. The `/episodes/` routes
 * and the legacy `/episode/` stubs export exactly these.
 */
export function episodePageParams(): { episode: EpisodesPathSlug }[] {
  return EPISODES_PATH_SLUGS.filter(isExported).map((episode) => ({ episode }));
}

/**
 * Every page under `/episodes/<slug>/` (FE-007 §1): looks the Episode up and renders it through the container
 * (FE-002), with its structured data when published. A tooling page renders through the same container, with none.
 */
export function EpisodePage({ slug, locale }: { slug: string; locale: Locale }) {
  if (isToolingSlug(slug)) return <EpisodePageContainer locale={locale} episode={findPageRecord(slug)} />;
  if (!isEpisodesPathSlug(slug) || !isExported(slug)) notFound();
  const episode = findEpisode(slug);
  const { title, description } = episodeCopy(slug, locale);
  const youtube = episodeVideo(episode.slug, locale);
  const data =
    episodeStatus(episode.slug) === 'published'
      ? episodeJsonLd(SITE_URL, locale, {
          slug: episode.slug,
          title,
          description,
          publishedOn: episodePublishedOn(episode.slug),
          youtube,
        })
      : undefined;
  return (
    <>
      {data && <JsonLdScript data={data} />}
      <EpisodePageContainer locale={locale} episode={episode} youtubeId={youtube} />
    </>
  );
}

/**
 * A page's title, description, facts and release date under `/episodes/`, for `pageMetadata` (FE-008): an
 * Episode's read through the registry and the content store, whose visibility and status the predicate turns into
 * robots and canonical; a tooling page's from its own record, with no facts, since it is `noindex` as a tooling page.
 */
export function episodePageCopy(slug: string, locale: Locale): PageCopy {
  if (isToolingSlug(slug)) {
    const { title, description } = findPageRecord(slug).messages[locale];
    return { title, description };
  }
  const { slug: episodeSlug } = findEpisode(slug);
  const { title, description } = episodeCopy(episodeSlug, locale);
  const publishedOn = episodePublishedOn(episodeSlug);
  return { title, description, facts: pageFacts({ episode: episodeSlug }), ...(publishedOn ? { publishedOn } : {}) };
}
