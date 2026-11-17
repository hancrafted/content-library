import { LOCALES, type Locale } from '@/shared/lib/locale.pure';
import { ROUTES } from '@/shared/lib/static-routes';
import type { TemplateType } from '../schemas/fields';
import type { EpisodeRef, ExplorablePageRef, GuideRef, StandaloneRef, TemplateRef } from './episode-id.pure';
import { EPISODE_IDS, EXPLORABLE_PAGE_SLUGS, GUIDE_SLUGS, TEMPLATE_SLUGS } from './episode-ids.generated';
import { EVENT_SLUGS } from './event-slugs.generated';

export const LEGACY_EPISODE_PREFIX = '/episode';

export { EPISODE_IDS };

export type EpisodeId = (typeof EPISODE_IDS)[number];

export function isEpisodeId(id: string): id is EpisodeId {
  return (EPISODE_IDS as readonly string[]).includes(id);
}

export function hasPage(episode: EpisodeRef): episode is EpisodeRef<EpisodeId> {
  return isEpisodeId(episode.id);
}

// decision: docs/decision-records/0019-resources-overview.md
export { TEMPLATE_SLUGS };

export type TemplateSlug = (typeof TEMPLATE_SLUGS)[number];

export { EXPLORABLE_PAGE_SLUGS };

export type ExplorablePageSlug = (typeof EXPLORABLE_PAGE_SLUGS)[number];

// decision: docs/decision-records/0019-resources-overview.md
export { GUIDE_SLUGS };

export type GuideSlug = (typeof GUIDE_SLUGS)[number];

export type EpisodesPathSlug = EpisodeId;

export type ComposedId = EpisodeId | TemplateSlug | ExplorablePageSlug | GuideSlug;

export function isEpisodesPathSlug(slug: string): slug is EpisodesPathSlug {
  return isEpisodeId(slug);
}

export function episodeRoute(slug: EpisodesPathSlug): string {
  return `${ROUTES.episodes}/${slug}`;
}

export function ownRouteOf(id: ComposedId): string {
  if (!isEpisodeId(id)) throw new Error(`The page "${id}" hands in its own route`);
  return episodeRoute(id);
}

export function legacyEpisodeRoute(slug: EpisodesPathSlug): string {
  return `${LEGACY_EPISODE_PREFIX}/${slug}`;
}

export function explorablePageRoute(slug: ExplorablePageSlug): string {
  return `${ROUTES.explorables}/${slug}`;
}

export function guideRoute(slug: GuideSlug): string {
  return `${ROUTES.guides}/${slug}`;
}

export const TEMPLATE_TYPE_PATHS: Readonly<Record<TemplateType, string>> = {
  'episode-template': 'episode-templates',
  'master-slide': 'master-slides',
  theme: 'themes',
};

export function templateRoute(type: TemplateType, slug: TemplateSlug): string {
  return `/${TEMPLATE_TYPE_PATHS[type]}/${slug}`;
}

export { EVENT_SLUGS };

export type EventSlug = (typeof EVENT_SLUGS)[number];

export function isEventSlug(slug: string): slug is EventSlug {
  return (EVENT_SLUGS as readonly string[]).includes(slug);
}

export function eventRoute(slug: EventSlug): string {
  return `${ROUTES.events}/${slug}`;
}

export function eventEpisodeRoute(event: EventSlug, episode: Pick<EpisodeRef, 'slug'>): string {
  return `${eventRoute(event)}${ROUTES.episodes}/${episode.slug}`;
}

export type PageRef =
  | { readonly kind: 'home' }
  | { readonly kind: 'dashboard' }
  | { readonly kind: 'episodes' }
  | { readonly kind: 'events' }
  | { readonly kind: 'explorables' }
  | { readonly kind: 'guides' }
  | { readonly kind: 'resources' }
  | { readonly kind: 'episode'; readonly episode: StandaloneRef<EpisodeId> }
  | { readonly kind: 'explorable-page'; readonly explorablePage: ExplorablePageRef<ExplorablePageSlug> }
  | { readonly kind: 'guide'; readonly guide: GuideRef<GuideSlug> }
  | { readonly kind: 'template'; readonly type: TemplateType; readonly template: TemplateRef<TemplateSlug> }
  | { readonly kind: 'event'; readonly event: EventSlug }
  | { readonly kind: 'event-episode'; readonly event: EventSlug; readonly episode: EpisodeRef<EpisodeId> };

export type PageKind = PageRef['kind'];

export type PageOf<K extends PageKind> = Extract<PageRef, { readonly kind: K }>;

export type ListPage = PageOf<'home' | 'dashboard' | 'episodes' | 'events' | 'explorables' | 'guides' | 'resources'>;

export type RecordPage = PageOf<'episode' | 'explorable-page' | 'guide' | 'template' | 'event' | 'event-episode'>;

export type EpisodesPathPage = PageOf<'episode'>;

export type PageCases<P extends PageRef, R> = {
  readonly [K in P['kind']]: (page: Extract<P, { readonly kind: K }>) => R;
};

export function matchPage<P extends PageRef, R>(page: P, cases: PageCases<P, R>, otherwise?: () => R): R {
  const kind: P['kind'] = page.kind;
  if (Object.hasOwn(cases, kind)) return (cases[kind] as (page: P) => R)(page);
  if (otherwise) return otherwise();
  throw new Error(`No case for page kind "${String(kind)}"`);
}

export function pageKeyOf(page: PageRef): string {
  const ids = matchPage<PageRef, readonly string[]>(page, {
    home: () => [],
    dashboard: () => [],
    episodes: () => [],
    events: () => [],
    explorables: () => [],
    guides: () => [],
    resources: () => [],
    episode: ({ episode }) => [episode.id],
    'explorable-page': ({ explorablePage }) => [explorablePage.slug],
    guide: ({ guide }) => [guide.slug],
    template: ({ template }) => [template.slug],
    event: ({ event }) => [event],
    'event-episode': ({ event, episode }) => [event, episode.id],
  });
  return [page.kind, ...ids].join(':');
}

const LOCALES_BY_KIND: Readonly<Record<PageKind, readonly Locale[]>> = {
  home: LOCALES,
  dashboard: ['en'],
  episodes: LOCALES,
  events: LOCALES,
  explorables: LOCALES,
  guides: LOCALES,
  resources: LOCALES,
  episode: LOCALES,
  'explorable-page': LOCALES,
  guide: LOCALES,
  template: LOCALES,
  event: LOCALES,
  'event-episode': LOCALES,
};

export function pageLocales(page: PageRef): readonly Locale[] {
  return LOCALES_BY_KIND[page.kind];
}

export function routeOf(page: PageRef): string {
  return matchPage(page, {
    home: () => ROUTES.home,
    dashboard: () => ROUTES.dashboard,
    episodes: () => ROUTES.episodes,
    events: () => ROUTES.events,
    explorables: () => ROUTES.explorables,
    guides: () => ROUTES.guides,
    resources: () => ROUTES.resources,
    episode: ({ episode }) => episodeRoute(episode.slug),
    'explorable-page': ({ explorablePage }) => explorablePageRoute(explorablePage.slug),
    guide: ({ guide }) => guideRoute(guide.slug),
    template: ({ type, template }) => templateRoute(type, template.slug),
    event: ({ event }) => eventRoute(event),
    'event-episode': ({ event, episode }) => eventEpisodeRoute(event, episode),
  });
}
