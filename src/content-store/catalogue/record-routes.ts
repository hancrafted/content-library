import { LOCALES, type Locale } from '@/shared/lib/locale.pure';
import { ROUTES } from '@/shared/lib/static-routes';
import type { TemplateType } from '../schemas/fields';
import type { EpisodeRef, ExplorablePageRef, GuideRef, StandaloneRef, TemplateRef } from './episode-id.pure';
import { EPISODE_IDS, EXPLORABLE_PAGE_SLUGS, GUIDE_SLUGS, TEMPLATE_SLUGS } from './episode-ids.generated';
import { EVENT_SLUGS } from './event-slugs.generated';

/*
 * The record routes (spec #348, the content store's delivery policy): the Episode and Event slug lists and their
 * types, each record's logical path, and the page reference every page is known by. The static paths they build on,
 * `ROUTES`, are domain-free and sit in `src/shared/lib/static-routes.ts`.
 */

export const LEGACY_EPISODE_PREFIX = '/episode';

/**
 * Every Episode with a page, public or unlisted, by its Episode id (GLOSSARY): one folder each,
 * `src/episodes/<slug>/`, or `…/by-event/<event-slug>/<slug>/` for an Event's copy, whose id is
 * `<event-slug>__<slug>`. Listed by the generated Episode registry. Which of them has an `/episodes/` page is the page
 * catalogue's (`treatmentOf` in the content store): an Event's copy lives only under its Event. The Templates
 * served beside them are no Episodes: `TEMPLATE_SLUGS`.
 */
export { EPISODE_IDS };

export type EpisodeId = (typeof EPISODE_IDS)[number];

export function isEpisodeId(id: string): id is EpisodeId {
  return (EPISODE_IDS as readonly string[]).includes(id);
}

/** Whether the Episode a ref names has a page: its id is a registered one. */
export function hasPage(episode: EpisodeRef): episode is EpisodeRef<EpisodeId> {
  return isEpisodeId(episode.id);
}

/**
 * Templates: pages that are no Episode (design-ADR 0019), one composition folder each, `src/episodes/templates/<slug>/`,
 * listed by the generated registry; each also has a record in `src/content-store/templates/<slug>.ts`. They are served at
 * `/<type plural>/<slug>/`, public and indexed, and no Episode list shows them.
 */
export { TEMPLATE_SLUGS };

export type TemplateSlug = (typeof TEMPLATE_SLUGS)[number];

/**
 * Explorable pages: Episode-shaped pages about one primary Explorable, one composition folder each,
 * `src/episodes/explorable-pages/<slug>/`, listed by the generated registry; each also has a record in
 * `src/content-store/explorable-pages/<slug>.ts`. They are served at `/explorables/<slug>/`, public and indexed.
 */
export { EXPLORABLE_PAGE_SLUGS };

export type ExplorablePageSlug = (typeof EXPLORABLE_PAGE_SLUGS)[number];

/**
 * Guides: step-by-step pages that are no Episode (design-ADR 0019, #450), one composition folder each,
 * `src/episodes/guides/<slug>/`, listed by the generated registry; each also has a record in
 * `src/content-store/guides/<slug>.ts`. They are served at `/guides/<slug>/`, public and indexed.
 */
export { GUIDE_SLUGS };

export type GuideSlug = (typeof GUIDE_SLUGS)[number];

/** A page served at `/episodes/<slug>/`: an Episode's own. An Event's copy, whose id holds its Event's slug, and an unlisted Episode are never exported there. */
export type EpisodesPathSlug = EpisodeId;

/** The id of any page the Episode container renders: an Episode's id, a Template's, an Explorable page's or a Guide's slug; what `data-episode` names. */
export type ComposedId = EpisodeId | TemplateSlug | ExplorablePageSlug | GuideSlug;

export function isEpisodesPathSlug(slug: string): slug is EpisodesPathSlug {
  return isEpisodeId(slug);
}

/** The logical path of one Episode. */
export function episodeRoute(slug: EpisodesPathSlug): string {
  return `${ROUTES.episodes}/${slug}`;
}

/**
 * The path a page is served at on its own, `/episodes/<slug>/` for an Episode. A Template's path depends on its type,
 * which its slug does not carry, so a Template's page hands its route in (`templateRoute`); asking for it here throws.
 */
export function ownRouteOf(id: ComposedId): string {
  if (!isEpisodeId(id)) throw new Error(`The page "${id}" hands in its own route`);
  return episodeRoute(id);
}

/** The logical path of a legacy Episode stub. */
export function legacyEpisodeRoute(slug: EpisodesPathSlug): string {
  return `${LEGACY_EPISODE_PREFIX}/${slug}`;
}

/** The logical path of one Explorable page: `/explorables/<slug>`. */
export function explorablePageRoute(slug: ExplorablePageSlug): string {
  return `${ROUTES.explorables}/${slug}`;
}

/** The logical path of one Guide: `/guides/<slug>`. */
export function guideRoute(slug: GuideSlug): string {
  return `${ROUTES.guides}/${slug}`;
}

/** The URL path segment each Template type is served under, its plural: the one place the rule is written. */
export const TEMPLATE_TYPE_PATHS: Readonly<Record<TemplateType, string>> = {
  'episode-template': 'episode-templates',
  'master-slide': 'master-slides',
};

/** The logical path of one Template's page, worked out from its type and slug and never stored: `/<type plural>/<slug>`. */
export function templateRoute(type: TemplateType, slug: TemplateSlug): string {
  return `/${TEMPLATE_TYPE_PATHS[type]}/${slug}`;
}

/**
 * Every Event, by slug: each one file, `src/content-store/events/<slug>.ts`, listed by the generated Event registry
 * (`npm run registry`), so a record and its page cannot drift apart.
 */
export { EVENT_SLUGS };

export type EventSlug = (typeof EVENT_SLUGS)[number];

export function isEventSlug(slug: string): slug is EventSlug {
  return (EVENT_SLUGS as readonly string[]).includes(slug);
}

/** The logical path of one Event's page. */
export function eventRoute(slug: EventSlug): string {
  return `${ROUTES.events}/${slug}`;
}

/** The logical path of one Episode of an Event's Playlist, shown under the Event at its slug, an Event's copy's too. */
export function eventEpisodeRoute(event: EventSlug, episode: Pick<EpisodeRef, 'slug'>): string {
  return `${eventRoute(event)}${ROUTES.episodes}/${episode.slug}`;
}

/**
 * A page with its own metadata and a closed set of exported locales, told apart by its `kind`. Every site that
 * branches on the kind does so through `matchPage` or a table keyed by `PageKind`, so a new kind fails `tsc` at each.
 * An Episode's page carries the EpisodeRef the store served, so its slug and owning Event are fields, never a parse;
 * its own page under `/episodes/` only one no Event owns. A Template's page carries its type and its TemplateRef.
 * Which pages exist, and how each is treated, is the page catalogue's (`PAGES` in the content store): it reads them
 * from the records, which lib cannot.
 */
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

/** A page's kind: what every site that treats pages differently branches on. */
export type PageKind = PageRef['kind'];

/** A page of one kind. */
export type PageOf<K extends PageKind> = Extract<PageRef, { readonly kind: K }>;

/** A page that presents no record: its copy is `meta.<kind>` of the Translation file. */
export type ListPage = PageOf<'home' | 'dashboard' | 'episodes' | 'events' | 'explorables' | 'guides' | 'resources'>;

/** A page that presents a record, so its route hands in its copy and facts. */
export type RecordPage = PageOf<'episode' | 'explorable-page' | 'guide' | 'template' | 'event' | 'event-episode'>;

/** A page served at `/episodes/<slug>/`: an Episode's own. */
export type EpisodesPathPage = PageOf<'episode'>;

/** One case per kind of the pages `P`, each handed its page narrowed to that kind. */
export type PageCases<P extends PageRef, R> = {
  readonly [K in P['kind']]: (page: Extract<P, { readonly kind: K }>) => R;
};

/**
 * The one way to branch on a page's kind: hands the page to its kind's case. The cases are typed against every kind
 * of `P`, so a new kind fails `tsc` at each site until it has a case there. `otherwise` answers a kind no case names
 * (a page built around the types); left out, such a page throws.
 */
export function matchPage<P extends PageRef, R>(page: P, cases: PageCases<P, R>, otherwise?: () => R): R {
  const kind: P['kind'] = page.kind;
  if (Object.hasOwn(cases, kind)) return (cases[kind] as (page: P) => R)(page);
  if (otherwise) return otherwise();
  throw new Error(`No case for page kind "${String(kind)}"`);
}

/** A page's identity: its kind and the ids its reference names, so two references to one page share it. */
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

/** The locales each kind of page is exported in: the English-only dashboard has no German counterpart. */
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

/** The locales a page is exported in. */
export function pageLocales(page: PageRef): readonly Locale[] {
  return LOCALES_BY_KIND[page.kind];
}

/** The logical path a page is exported at. */
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
