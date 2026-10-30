import { explorablePageRef, guideRef, matchEpisode, templateRef } from '@/content-store/catalogue/episode-id.pure';
import {
  hasPage,
  pageKeyOf,
  type EpisodeId,
  type EpisodesPathPage,
  type ExplorablePageSlug,
  type GuideSlug,
  type PageOf,
  type PageRef,
  type TemplateSlug,
} from '@/content-store/catalogue/record-routes';
import { pageTreatment, type PageFacts, type PageTreatment } from '@/content-store/catalogue/visibility.pure';
import type { LoadedEpisode } from '../episode-refusals';
import type { Content } from '../refusals';
import type { ExplorablePage } from '../schemas/explorable-page.schema';
import type { Guide } from '../schemas/guide.schema';
import type { Template } from '../schemas/template.schema';
import type { EpisodesPathParams, EventEpisodePage, EventEpisodeParams, PageCatalogue } from './page-catalogue.types';

/*
 * The page catalogue (GLOSSARY, FE-005, FE-008): every page the site has, read from the records, each with its
 * treatment from the one visibility predicate (design-ADR 0016, Routes and visibility). Pages, routes, the sitemap,
 * page metadata and the site's own lists ask it "treatment of this page"; none fetches the facts of what a page
 * presents and pairs them with the predicate itself. It also maps each built page to its route's params and back
 * (GLOSSARY, page catalogue). The store serves one catalogue over its records (`store.ts`).
 */

export type * from './page-catalogue.types';

const NO_FACTS: PageFacts = {};

/** What an Episode presents, as the predicate reads it: visibility, status, and whether it is an Event's copy. */
function episodeFactsOf({ ref, visibility, status }: LoadedEpisode): PageFacts {
  const copy = matchEpisode(ref, { standalone: () => false, 'event-copy': () => true });
  return { visibility, status, ...(copy && { copy }) };
}

/**
 * A page, its record, the facts the predicate reads from it and the treatment those give, paired once. `record` is
 * undefined for a site list or a page whose record is not held (no facts, so it fails closed).
 */
interface Entry<P extends PageRef = PageRef, R = unknown> {
  readonly page: P;
  readonly record: R;
  readonly facts: PageFacts;
  readonly treatment: PageTreatment;
}

function entryOf<P extends PageRef, R>(page: P, record: R, facts: PageFacts): Entry<P, R> {
  return { page, record, facts, treatment: pageTreatment(page, facts) };
}

/** The page an Episode has at `/episodes/<slug>/`: one no Event owns, with a page; an Event's copy has none there. */
function ownPageOf({ ref }: LoadedEpisode): PageOf<'episode'>[] {
  if (!hasPage(ref)) return [];
  return matchEpisode(ref, {
    standalone: (episode) => [{ kind: 'episode', episode }],
    'event-copy': () => [],
  });
}

/** Each Explorable page's page reference, in record order: its slug names its composition folder. */
function pageOfExplorablePage({ slug }: ExplorablePage): PageOf<'explorable-page'> {
  // Every Explorable page the store loads is an entry of the generated registry, keyed by its slug (`tsc` holds key =
  // slug, and the load refuses a record without a composition folder), so its slug names a composition.
  return { kind: 'explorable-page', explorablePage: explorablePageRef(slug as ExplorablePageSlug) };
}

/** Each Guide's page reference, in record order: its slug names its composition folder. */
function pageOfGuide({ slug }: Guide): PageOf<'guide'> {
  // Every Guide the store loads is an entry of the generated Guide registry, keyed by its slug (`tsc` holds key = slug,
  // and the load refuses a record without a composition folder), so its slug names a composition.
  return { kind: 'guide', guide: guideRef(slug as GuideSlug) };
}

/** Each Template's page, in record order: its type from its record, its slug naming the composition folder. */
function pageOfTemplate({ type, slug }: Template): PageOf<'template'> {
  // Every Template the store loads is an entry of the generated Template registry, keyed by its slug (`tsc` holds key
  // = slug, and the load refuses a record without a composition folder), so its slug names a composition.
  return { kind: 'template', type, template: templateRef(slug as TemplateSlug) };
}

/**
 * Each Episode every Event's Playlist presents with a page, in record order, with its page under the Event: one page
 * per Episode, placed by its first entry; an entry the served Event marks `repeat` gets none.
 */
function eventEpisodePagesIn(content: Content): EventEpisodePage[] {
  return content.events.flatMap((event) =>
    event.playlist.episodes.flatMap(({ page: episode, place, repeat }) =>
      episode === undefined || repeat === true
        ? []
        : [{ kind: 'event-episode', event: event.slug, episode, presented: { event, episode, place } } as const],
    ),
  );
}

/** The entries of a kind served by slug, each with the visibility its record states. */
function entriesBySlug<R extends { visibility: PageFacts['visibility'] }, P extends PageRef>(
  of: readonly R[],
  page: (record: R) => P,
) {
  return of.map((record) => entryOf(page(record), record, { visibility: record.visibility }));
}

/** Every page the records give, in the catalogue's order, each read once with its record, facts and treatment. */
function entriesIn(content: Content) {
  const kinds = ['home', 'dashboard', 'episodes', 'events', 'explorables', 'guides', 'resources'] as const;
  const lists = kinds.map((kind) => entryOf({ kind }, undefined, NO_FACTS));
  const episodeOf = (id: EpisodeId) => content.episodes.find(({ ref }) => ref.id === id);
  const episodeEntry = <P extends PageRef>(page: P, record: LoadedEpisode | undefined) =>
    entryOf(page, record, record === undefined ? NO_FACTS : episodeFactsOf(record));
  // Every Episode record, for the site's lists; only one with a page at `/episodes/` is a page of its own.
  const records = content.episodes.map((record) => {
    const [page] = ownPageOf(record);
    const standIn = page ?? ({ kind: 'episode', episode: record.ref } as PageOf<'episode'>);
    return { ...entryOf(standIn, record, episodeFactsOf(record)), hasOwnPage: page !== undefined };
  });
  const episodes = records.filter(({ hasOwnPage }) => hasOwnPage);
  const explorablePages = entriesBySlug(content.explorablePages, pageOfExplorablePage);
  const guides = entriesBySlug(content.guides, pageOfGuide);
  const templates = entriesBySlug(content.templates, pageOfTemplate);
  const events = content.events.map((record) =>
    entryOf({ kind: 'event', event: record.slug } as const, record, { visibility: record.playlist.visibility }),
  );
  const underEvents = eventEpisodePagesIn(content).map((page) => ({
    ...episodeEntry(
      { kind: page.kind, event: page.event, episode: page.episode } as PageOf<'event-episode'>,
      episodeOf(page.episode.id),
    ),
    presenting: page,
  }));
  return { lists, records, episodes, explorablePages, guides, templates, events, underEvents };
}

/** The params a page under `/episodes/` is built at: an Episode's own page at its slug. */
export function episodesPathParamsOf({ episode }: EpisodesPathPage): EpisodesPathParams {
  return { episode: episode.slug };
}

/** The params an Episode's page under its Event is built at: the Event's slug and the Episode's slug. */
export function eventEpisodeParamsOf({ event, episode }: PageOf<'event-episode'>): EventEpisodeParams {
  return { event, episode: episode.slug };
}
type Entries = ReturnType<typeof entriesIn>;

const exportedOf = <E extends Entry>(of: readonly E[]) => of.filter(({ treatment }) => treatment.exported);

/** The params and lookups of the kinds served at `/<kind plural>/<slug>/`: the Explorable pages and the Guides. */
function slugRoutesOf(
  explorablePages: Entries['explorablePages'],
  guides: Entries['guides'],
): Pick<PageCatalogue, 'explorablePageParams' | 'explorablePageAt' | 'guideParams' | 'guideAt'> {
  return {
    explorablePageParams: () => exportedOf(explorablePages).map(({ page }) => ({ slug: page.explorablePage.slug })),
    explorablePageAt: ({ slug }) =>
      exportedOf(explorablePages).find(({ page }) => page.explorablePage.slug === slug)?.page,
    guideParams: () => exportedOf(guides).map(({ page }) => ({ slug: page.guide.slug })),
    guideAt: ({ slug }) => exportedOf(guides).find(({ page }) => page.guide.slug === slug)?.page,
  };
}

/** The static params and page lookups of the built pages: the entries whose treatment exports. */
function routesOf({
  episodes,
  explorablePages,
  guides,
  templates,
  events,
  underEvents,
}: Entries): Omit<PageCatalogue, 'pages' | 'treatmentOf' | `listed${string}`> {
  return {
    episodesPathParams: () => exportedOf(episodes).map(({ page }) => episodesPathParamsOf(page)),
    episodesPathPageAt: ({ episode }) =>
      exportedOf(episodes).find(({ page }) => episodesPathParamsOf(page).episode === episode)?.page,
    ...slugRoutesOf(explorablePages, guides),
    templateParams: (type) =>
      exportedOf(templates)
        .filter(({ page }) => page.type === type)
        .map(({ page }) => ({ template: page.template.slug })),
    templatePageAt: (type, { template }) =>
      exportedOf(templates).find(({ page }) => page.type === type && page.template.slug === template)?.page,
    eventParams: () => exportedOf(events).map(({ page }) => ({ event: page.event })),
    eventEpisodeParams: () => exportedOf(underEvents).map(({ page }) => eventEpisodeParamsOf(page)),
    eventEpisodePageAt: (params) =>
      exportedOf(underEvents).find(({ page }) => {
        const { event, episode } = eventEpisodeParamsOf(page);
        return event === params.event && episode === params.episode;
      })?.presenting,
  };
}

/** The catalogue of the pages these records give: what the store serves over its own records. */
export function catalogueOf(content: Content): PageCatalogue {
  const all = entriesIn(content);
  const { lists, records, episodes, explorablePages, guides, templates, events, underEvents } = all;
  const entries: readonly Entry[] = [
    ...lists,
    ...episodes,
    ...explorablePages,
    ...guides,
    ...templates,
    ...events,
    ...underEvents,
  ];
  const listed = <E extends Entry>(of: readonly E[]) => of.filter(({ treatment }) => treatment.listed);
  const byKey = new Map([...records, ...entries].map((entry) => [pageKeyOf(entry.page), entry]));
  return {
    pages: entries.map(({ page, treatment }) => ({ page, treatment })),
    treatmentOf: (page) => byKey.get(pageKeyOf(page))?.treatment ?? pageTreatment(page, NO_FACTS),
    ...routesOf(all),
    listedEpisodes: () => listed(records).map(({ record }) => record),
    listedEvents: () => listed(events).map(({ record }) => record),
    listedExplorablePages: () => listed(explorablePages).map(({ page, record }) => ({ page, tags: record.tags })),
    listedGuides: () => listed(guides).map(({ page, record }) => ({ page, tags: record.tags })),
    listedTemplates: () => listed(templates).map(({ page, record }) => ({ page, tags: record.tags })),
  };
}
