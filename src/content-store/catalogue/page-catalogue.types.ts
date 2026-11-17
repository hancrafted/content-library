import type { LoadedEpisode } from '../episode-refusals';
import type { ExplorablePage } from '../schemas/explorable-page.schema';
import type { TemplateType } from '../schemas/fields';
import type { Guide } from '../schemas/guide.schema';
import type { Template } from '../schemas/template.schema';
import type { PresentedEpisode, ServedEvent } from '../served-event';
import type {
  EpisodesPathPage,
  EpisodesPathSlug,
  EventSlug,
  ExplorablePageSlug,
  GuideSlug,
  PageOf,
  PageRef,
  TemplateSlug,
} from './record-routes';
import type { PageTreatment, TreatedPage } from './visibility.pure';

export interface EpisodesPathParams {
  readonly episode: EpisodesPathSlug;
}

export interface TemplateParams {
  readonly template: TemplateSlug;
}

export interface ExplorablePageParams {
  readonly slug: ExplorablePageSlug;
}

export interface ListedExplorablePage {
  readonly page: PageOf<'explorable-page'>;
  readonly tags: ExplorablePage['tags'];
}

export interface GuideParams {
  readonly slug: GuideSlug;
}

export interface ListedGuide {
  readonly page: PageOf<'guide'>;
  readonly tags: Guide['tags'];
}

export interface ListedTemplate {
  readonly page: PageOf<'template'>;
  readonly tags: Template['tags'];
}

export interface EventEpisodeParams {
  readonly event: EventSlug;
  readonly episode: string;
}

export type RouteParams<P> = { readonly [K in keyof P]: string };

export type EventEpisodePage = PageOf<'event-episode'> & { readonly presented: PresentedEpisode };

export interface PageCatalogue {
  readonly pages: readonly TreatedPage[];
  readonly treatmentOf: (page: PageRef) => PageTreatment;
  readonly episodesPathParams: () => EpisodesPathParams[];
  readonly episodesPathPageAt: (params: RouteParams<EpisodesPathParams>) => EpisodesPathPage | undefined;
  readonly explorablePageParams: () => ExplorablePageParams[];
  readonly explorablePageAt: (params: RouteParams<ExplorablePageParams>) => PageOf<'explorable-page'> | undefined;
  readonly guideParams: () => GuideParams[];
  readonly guideAt: (params: RouteParams<GuideParams>) => PageOf<'guide'> | undefined;
  readonly templateParams: (type: TemplateType) => TemplateParams[];
  readonly templatePageAt: (type: TemplateType, params: RouteParams<TemplateParams>) => PageOf<'template'> | undefined;
  readonly eventParams: () => { event: EventSlug }[];
  readonly eventEpisodeParams: () => EventEpisodeParams[];
  readonly eventEpisodePageAt: (params: RouteParams<EventEpisodeParams>) => EventEpisodePage | undefined;
  readonly listedEpisodes: () => readonly LoadedEpisode[];
  readonly listedEvents: () => readonly ServedEvent[];
  readonly listedExplorablePages: () => readonly ListedExplorablePage[];
  readonly listedGuides: () => readonly ListedGuide[];
  readonly listedTemplates: () => readonly ListedTemplate[];
}
