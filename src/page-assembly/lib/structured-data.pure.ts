import { episodeRoute, type EpisodeId } from '@/content-store/catalogue/record-routes';
import type { IsoDate } from '@/content-store/schemas/fields';
import type { Locale } from '@/shared/lib/locale.pure';
import { SOCIAL_LINKS } from '@/shared/lib/social-links';
import { ROUTES, servedUrl } from '@/shared/lib/static-routes';
import { OG_IMAGE } from './page-metadata.pure';
import { PAGE_WORDS } from './page-words';

// decision: FE-008 §6
type Node = Record<string, unknown> & { readonly '@type': string };
export interface JsonLd {
  readonly '@context': 'https://schema.org';
  readonly '@graph': readonly Node[];
}

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
    name: PAGE_WORDS[locale].person.name,
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
        name: PAGE_WORDS[locale].brand.name,
        description: PAGE_WORDS[locale].meta.home.description,
        inLanguage: locale,
        publisher: { '@id': `${siteUrl}/#person` },
      },
    ],
  };
}

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

export function episodeJsonLd(siteUrl: string, locale: Locale, episode: EpisodeLdInput): JsonLd | undefined {
  const { publishedOn, youtube } = episode;
  if (publishedOn === undefined) return undefined;
  const url = servedUrl(siteUrl, episodeRoute(episode.slug), locale);
  const author = { '@type': 'Person', name: PAGE_WORDS[locale].person.name, url: `${siteUrl}/` };
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
