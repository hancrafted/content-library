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

// decision: docs/adr/0016-content-data-model.md
// decision: FE-005 §1
// decision: FE-008 §5
export type * from './page-catalogue.types';

const NO_FACTS: PageFacts = {};

function episodeFactsOf({ ref, visibility, status }: LoadedEpisode): PageFacts {
  const copy = matchEpisode(ref, { standalone: () => false, 'event-copy': () => true });
  return { visibility, status, ...(copy && { copy }) };
}

interface Entry<P extends PageRef = PageRef, R = unknown> {
  readonly page: P;
  readonly record: R;
  readonly facts: PageFacts;
  readonly treatment: PageTreatment;
}

function entryOf<P extends PageRef, R>(page: P, record: R, facts: PageFacts): Entry<P, R> {
  return { page, record, facts, treatment: pageTreatment(page, facts) };
}

function ownPageOf({ ref }: LoadedEpisode): PageOf<'episode'>[] {
  if (!hasPage(ref)) return [];
  return matchEpisode(ref, {
    standalone: (episode) => [{ kind: 'episode', episode }],
    'event-copy': () => [],
  });
}

function pageOfExplorablePage({ slug: slugKeyedByRegistryEntry }: ExplorablePage): PageOf<'explorable-page'> {
  return { kind: 'explorable-page', explorablePage: explorablePageRef(slugKeyedByRegistryEntry as ExplorablePageSlug) };
}

function pageOfGuide({ slug: slugKeyedByRegistryEntry }: Guide): PageOf<'guide'> {
  return { kind: 'guide', guide: guideRef(slugKeyedByRegistryEntry as GuideSlug) };
}

function pageOfTemplate({ type, slug: slugKeyedByRegistryEntry }: Template): PageOf<'template'> {
  return { kind: 'template', type, template: templateRef(slugKeyedByRegistryEntry as TemplateSlug) };
}

function eventEpisodePagesIn(content: Content): EventEpisodePage[] {
  return content.events.flatMap((event) =>
    event.playlist.episodes.flatMap(({ page: episode, place, repeat }) =>
      episode === undefined || repeat === true
        ? []
        : [{ kind: 'event-episode', event: event.slug, episode, presented: { event, episode, place } } as const],
    ),
  );
}

function entriesBySlug<R extends { visibility: PageFacts['visibility'] }, P extends PageRef>(
  of: readonly R[],
  page: (record: R) => P,
) {
  return of.map((record) => entryOf(page(record), record, { visibility: record.visibility }));
}

function entriesIn(content: Content) {
  const kinds = ['home', 'dashboard', 'episodes', 'events', 'explorables', 'guides', 'resources'] as const;
  const lists = kinds.map((kind) => entryOf({ kind }, undefined, NO_FACTS));
  const episodeOf = (id: EpisodeId) => content.episodes.find(({ ref }) => ref.id === id);
  const episodeEntry = <P extends PageRef>(page: P, record: LoadedEpisode | undefined) =>
    entryOf(page, record, record === undefined ? NO_FACTS : episodeFactsOf(record));
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

export function episodesPathParamsOf({ episode }: EpisodesPathPage): EpisodesPathParams {
  return { episode: episode.slug };
}

export function eventEpisodeParamsOf({ event, episode }: PageOf<'event-episode'>): EventEpisodeParams {
  return { event, episode: episode.slug };
}
type Entries = ReturnType<typeof entriesIn>;

const exportedOf = <E extends Entry>(of: readonly E[]) => of.filter(({ treatment }) => treatment.exported);

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
