import { EpisodePageContainer } from '@/components/episode-page/episode-page-container';
import { episodeCopy, findEpisode } from '@/components/episodes/registry';
import { findEpisodesPathPage, findToolingPage } from '@/components/episodes/tooling-pages';
import { JsonLdScript } from '@/components/json-ld';
import { episodePublishedOn, episodeStatus, episodeVideo, pageFacts } from '@/content-store/store';
import type { Locale } from '@/lib/locale.pure';
import type { PageCopy } from '@/lib/page-metadata.pure';
import {
  EPISODES_PATH_SLUGS,
  episodesPathPage,
  matchPage,
  type EpisodeSlug,
  type EpisodesPathPage,
  type EpisodesPathSlug,
} from '@/lib/routes';
import { SITE_URL } from '@/lib/site-url';
import { episodeJsonLd } from '@/lib/structured-data.pure';
import { pageTreatment } from '@/lib/visibility.pure';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

/** Whether the visibility predicate exports a page at `/episodes/<slug>/`: every tooling page and public Episode, no unlisted one. */
function isExported(page: EpisodesPathPage): boolean {
  return pageTreatment(page, pageFacts(page)).exported;
}

/** The page a slug under `/episodes/` names, when the visibility predicate exports one there; else no page. */
function exportedPage(slug: string): EpisodesPathPage {
  const page = findEpisodesPathPage(slug);
  if (!isExported(page)) notFound();
  return page;
}

/**
 * One static param per page under `/episodes/` (FE-005): every tooling page and every Episode the visibility
 * predicate exports there, so an unlisted Episode has no `/episodes/` page, only its Event's. The `/episodes/` routes
 * and the legacy `/episode/` stubs export exactly these.
 */
export function episodePageParams(): { episode: EpisodesPathSlug }[] {
  return EPISODES_PATH_SLUGS.filter((slug) => isExported(episodesPathPage(slug))).map((episode) => ({ episode }));
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
 * A page's title, description, facts and release date under `/episodes/`, for `pageMetadata` (FE-008): an
 * Episode's read through the registry and the content store, whose visibility and status the predicate turns into
 * robots and canonical; a tooling page's from its own record, with no facts, since it is `noindex` as a tooling page.
 */
export function episodePageCopy(slug: string, locale: Locale): PageCopy {
  return matchPage<EpisodesPathPage, PageCopy>(findEpisodesPathPage(slug), {
    tooling: ({ tooling }) => {
      const { title, description } = findToolingPage(tooling).messages[locale];
      return { title, description };
    },
    episode: (own) => {
      const { title, description } = episodeCopy(own.episode, locale);
      const publishedOn = episodePublishedOn(own.episode);
      return { title, description, facts: pageFacts(own), ...(publishedOn ? { publishedOn } : {}) };
    },
  });
}
