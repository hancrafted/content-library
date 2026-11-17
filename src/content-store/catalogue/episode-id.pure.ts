// decision: docs/decision-records/0016-content-data-model.md
export const EVENT_COPIES_FOLDER = 'by-event';

// decision: FE-004 §7
export const SLIDE_POOL_FOLDER = 'slide-pool';

// decision: docs/decision-records/0019-resources-overview.md
export const TEMPLATES_FOLDER = 'templates';

export const EXPLORABLE_PAGES_FOLDER = 'explorable-pages';

// decision: docs/decision-records/0019-resources-overview.md
export const GUIDES_FOLDER = 'guides';

export const RESERVED_FOLDER_NAMES: readonly string[] = [
  EVENT_COPIES_FOLDER,
  SLIDE_POOL_FOLDER,
  TEMPLATES_FOLDER,
  EXPLORABLE_PAGES_FOLDER,
  GUIDES_FOLDER,
  'components',
  'lib',
  'hooks',
];

const SEPARATOR = '__';

export type EpisodeRef<Id extends string = string> =
  | { readonly kind: 'standalone'; readonly id: Id; readonly slug: Id }
  | { readonly kind: 'event-copy'; readonly id: Id; readonly event: string; readonly slug: string };

export type StandaloneRef<Id extends string = string> = Extract<EpisodeRef<Id>, { readonly kind: 'standalone' }>;

export type EpisodeSlugOf<Id extends string> = Id extends `${string}${typeof SEPARATOR}${infer Slug}` ? Slug : Id;

export type EpisodeIdOf<Slug extends string, Event extends string | undefined> = Event extends string
  ? `${Event}${typeof SEPARATOR}${Slug}`
  : Slug;

export function episodeRef<Slug extends string>(slug: Slug): StandaloneRef<Slug>;
export function episodeRef<Slug extends string, Event extends string>(
  slug: Slug,
  event: Event,
): Extract<EpisodeRef<EpisodeIdOf<Slug, Event>>, { readonly kind: 'event-copy' }>;
export function episodeRef(slug: string, event?: string): EpisodeRef {
  if (event === undefined) return { kind: 'standalone', id: slug, slug };
  return { kind: 'event-copy', id: `${event}${SEPARATOR}${slug}`, event, slug };
}

export function episodeRefOf<Id extends string>(id: Id): EpisodeRef<Id> {
  const at = id.indexOf(SEPARATOR);
  if (at < 0) return { kind: 'standalone', id, slug: id };
  return { kind: 'event-copy', id, event: id.slice(0, at), slug: id.slice(at + SEPARATOR.length) };
}

export type EpisodeCases<Id extends string, R> = {
  readonly [K in EpisodeRef<Id>['kind']]: (episode: Extract<EpisodeRef<Id>, { readonly kind: K }>) => R;
};

export function matchEpisode<Id extends string, R>(episode: EpisodeRef<Id>, cases: EpisodeCases<Id, R>): R {
  return episode.kind === 'standalone' ? cases.standalone(episode) : cases['event-copy'](episode);
}

// decision: docs/decision-records/0019-resources-overview.md
export interface TemplateRef<Slug extends string = string> {
  readonly kind: 'template';
  readonly id: Slug;
  readonly slug: Slug;
}

export function templateRef<Slug extends string>(slug: Slug): TemplateRef<Slug> {
  return { kind: 'template', id: slug, slug };
}

export interface ExplorablePageRef<Slug extends string = string> {
  readonly kind: 'explorable-page';
  readonly id: Slug;
  readonly slug: Slug;
}

export function explorablePageRef<Slug extends string>(slug: Slug): ExplorablePageRef<Slug> {
  return { kind: 'explorable-page', id: slug, slug };
}

export interface GuideRef<Slug extends string = string> {
  readonly kind: 'guide';
  readonly id: Slug;
  readonly slug: Slug;
}

export function guideRef<Slug extends string>(slug: Slug): GuideRef<Slug> {
  return { kind: 'guide', id: slug, slug };
}

export function folderOf(page: EpisodeRef | TemplateRef | ExplorablePageRef | GuideRef): string {
  if (page.kind === 'template') return `${TEMPLATES_FOLDER}/${page.slug}`;
  if (page.kind === 'guide') return `${GUIDES_FOLDER}/${page.slug}`;
  if (page.kind === 'explorable-page') return `${EXPLORABLE_PAGES_FOLDER}/${page.slug}`;
  return matchEpisode(page, {
    standalone: ({ slug }) => slug,
    'event-copy': ({ event, slug }) => `${EVENT_COPIES_FOLDER}/${event}/${slug}`,
  });
}
