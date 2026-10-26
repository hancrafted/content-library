import type { IsoDate } from '../content-store/schemas/fields';
import { TRANSLATIONS } from '../i18n/translations';
import type { Locale } from './locale.pure';
import { OG_IMAGE } from './page-metadata.pure';
import { episodeRoute, ROUTES, servedUrl, type EpisodeId } from './routes';
import { SOCIAL_LINKS } from './social-links';

/*
 * schema.org JSON-LD as plain data (FE-008 §6): the landing page's Person and WebSite, an Episode's Article and,
 * where a recording exists, its VideoObject. A component renders the result; nothing here knows React.
 */

type Node = Record<string, unknown> & { readonly '@type': string };
export interface JsonLd {
  readonly '@context': 'https://schema.org';
  readonly '@graph': readonly Node[];
}

/** What an Episode page hands in: its copy, its release date and its recording in this locale. */
export interface EpisodeLdInput {
  readonly slug: EpisodeId;
  readonly title: string;
  readonly description: string;
  readonly publishedOn?: IsoDate;
  readonly youtube?: string;
}

function person(siteUrl: string, locale: Locale): Node {
  return {
    '@type': 'Person',
    '@id': `${siteUrl}/#person`,
    name: TRANSLATIONS[locale].landing.about.identity.name,
    url: `${siteUrl}/`,
    sameAs: SOCIAL_LINKS.map((link) => link.href),
  };
}

export function landingJsonLd(siteUrl: string, locale: Locale): JsonLd {
  const url = servedUrl(siteUrl, ROUTES.home, locale);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      person(siteUrl, locale),
      {
        '@type': 'WebSite',
        '@id': url,
        url,
        name: TRANSLATIONS[locale].brand.name,
        description: TRANSLATIONS[locale].meta.home.description,
        inLanguage: locale,
        publisher: { '@id': `${siteUrl}/#person` },
      },
    ],
  };
}

/** The VideoObject of an Episode's recording, embedded through the no-cookie player. */
function videoNode(
  episode: EpisodeLdInput & { youtube: string; publishedOn: IsoDate },
  locale: Locale,
  author: Node,
): Node {
  return {
    '@type': 'VideoObject',
    name: episode.title,
    description: episode.description,
    inLanguage: locale,
    uploadDate: episode.publishedOn,
    thumbnailUrl: `https://i.ytimg.com/vi/${episode.youtube}/hqdefault.jpg`,
    embedUrl: `https://www.youtube-nocookie.com/embed/${episode.youtube}`,
    author,
  };
}

/** An Episode's Article and VideoObject; undefined without a release date: an upcoming Episode has none. */
export function episodeJsonLd(siteUrl: string, locale: Locale, episode: EpisodeLdInput): JsonLd | undefined {
  const { publishedOn, youtube } = episode;
  if (publishedOn === undefined) return undefined;
  const url = servedUrl(siteUrl, episodeRoute(episode.slug), locale);
  const author = { '@type': 'Person', name: TRANSLATIONS[locale].landing.about.identity.name, url: `${siteUrl}/` };
  const article: Node = {
    '@type': 'Article',
    '@id': url,
    headline: episode.title,
    description: episode.description,
    inLanguage: locale,
    datePublished: publishedOn,
    url,
    mainEntityOfPage: url,
    author,
    image: `${siteUrl}${OG_IMAGE.url}`,
  };
  const video = youtube === undefined ? [] : [videoNode({ ...episode, youtube, publishedOn }, locale, author)];
  return { '@context': 'https://schema.org', '@graph': [article, ...video] };
}
