import { EpisodePageContainer } from '@/components/episode-page/episode-page-container';
import { episodeCopy, findEpisode } from '@/components/episodes/registry';
import { findPageRecord } from '@/components/episodes/tooling-pages';
import { JsonLdScript } from '@/components/json-ld';
import { episodePublishedOn, episodeStatus, episodeVideo } from '@/content-store/store';
import type { Locale } from '@/lib/locale.pure';
import type { PageCopy } from '@/lib/page-metadata.pure';
import { SITE_URL } from '@/lib/site-url';
import { episodeJsonLd } from '@/lib/structured-data.pure';
import { isToolingSlug } from '@/lib/tooling-pages';

/**
 * Every page under `/episodes/<slug>/` (FE-007 §1): looks the Episode up and renders it through the container
 * (FE-002), with its structured data when published. A tooling page renders through the same container, with none.
 */
export function EpisodePage({ slug, locale }: { slug: string; locale: Locale }) {
  if (isToolingSlug(slug)) return <EpisodePageContainer locale={locale} episode={findPageRecord(slug)} />;
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
 * A page's title, description, status and release date under `/episodes/`, for `pageMetadata` (FE-008): an
 * Episode's read through the registry and the content store, whose status makes an upcoming page `noindex`; a tooling page's from its own
 * record, with no status, since it is `noindex` as a tooling page.
 */
export function episodePageCopy(slug: string, locale: Locale): PageCopy {
  if (isToolingSlug(slug)) {
    const { title, description } = findPageRecord(slug).messages[locale];
    return { title, description };
  }
  const { slug: episodeSlug } = findEpisode(slug);
  const { title, description } = episodeCopy(episodeSlug, locale);
  const publishedOn = episodePublishedOn(episodeSlug);
  return { title, description, status: episodeStatus(episodeSlug), ...(publishedOn ? { publishedOn } : {}) };
}
