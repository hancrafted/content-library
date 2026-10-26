import { EpisodePageContainer } from '@/components/episode-page/episode-page-container';
import { episodeCopy, findEpisode } from '@/components/episodes/registry';
import { findEpisodesPathPage, findToolingPage } from '@/components/episodes/tooling-pages';
import { JsonLdScript } from '@/components/json-ld';
import { episodePublishedOn, episodeStatus, episodeVideo, treatmentOf } from '@/content-store/store';
import type { Locale } from '@/lib/locale.pure';
import type { PageCopy } from '@/lib/page-metadata.pure';
import { matchPage, type EpisodeSlug, type EpisodesPathPage } from '@/lib/routes';
import { SITE_URL } from '@/lib/site-url';
import { episodeJsonLd } from '@/lib/structured-data.pure';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

/** The page a slug under `/episodes/` names, when the page catalogue builds one there; else no page. */
function exportedPage(slug: string): EpisodesPathPage {
  const page = findEpisodesPathPage(slug);
  if (!treatmentOf(page).exported) notFound();
  return page;
}

/**
 * Every page under `/episodes/<slug>/` (FE-007 §1): looks the Episode up and renders it through the container
 * (FE-002), with its structured data when published. A tooling page renders through the same container, with none.
 */
export function EpisodePage({ slug, locale }: { slug: string; locale: Locale }) {
  const page = exportedPage(slug);
  return matchPage<EpisodesPathPage, ReactNode>(page, {
    tooling: ({ tooling }) => <EpisodePageContainer locale={locale} episode={findToolingPage(tooling)} />,
    episode: ({ episode }) => <OwnEpisodePage slug={episode} locale={locale} />,
  });
}

/** An Episode's own page: the container, with its recording, and its structured data once published. */
function OwnEpisodePage({ slug, locale }: { slug: EpisodeSlug; locale: Locale }) {
  const episode = findEpisode(slug);
  const { title, description } = episodeCopy(slug, locale);
  const video = episodeVideo(slug, locale);
  const data =
    episodeStatus(slug) === 'published'
      ? episodeJsonLd(SITE_URL, locale, {
          slug,
          title,
          description,
          publishedOn: episodePublishedOn(slug),
          youtube: video?.id,
        })
      : undefined;
  return (
    <>
      {data && <JsonLdScript data={data} />}
      <EpisodePageContainer locale={locale} episode={episode} video={video} />
    </>
  );
}

/**
 * A page's title, description, treatment and release date under `/episodes/`, for `pageMetadata` (FE-008): an
 * Episode's read through the registry and the content store, a tooling page's from its own record; the treatment,
 * which decides robots and canonical, is the page catalogue's.
 */
export function episodePageCopy(slug: string, locale: Locale): PageCopy {
  const page = findEpisodesPathPage(slug);
  const treatment = treatmentOf(page);
  return matchPage<EpisodesPathPage, PageCopy>(page, {
    tooling: ({ tooling }) => {
      const { title, description } = findToolingPage(tooling).messages[locale];
      return { title, description, treatment };
    },
    episode: ({ episode }) => {
      const { title, description } = episodeCopy(episode, locale);
      const publishedOn = episodePublishedOn(episode);
      return { title, description, treatment, ...(publishedOn ? { publishedOn } : {}) };
    },
  });
}
