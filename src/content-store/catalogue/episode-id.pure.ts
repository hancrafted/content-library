/*
 * The Episode id (GLOSSARY): every Episode's one name across all Episodes, derived from its folder and never written
 * in its record (design-ADR 0016 decision 3). An Episode no Event owns sits in `src/episodes/<slug>/` and its id is its
 * slug; an Event's copy sits in `episodes/by-event/<event-slug>/<slug>/` and its id is `<event-slug>__<slug>`. One path
 * segment, so it works as a folder, a DOM id or a key. Imports nothing, so the registry generator can load it too.
 *
 * This module alone knows that format; code passes an EpisodeRef (GLOSSARY). `episodeRef` builds one from its parts,
 * `episodeRefOf` parses an id, and `folderOf` gives any page's folder.
 */

/** The folder an Event's copies sit in, one folder per Event: `by-event/<event-slug>/<slug>/`. */
export const EVENT_COPIES_FOLDER = 'by-event';

/** The Slide pool: one folder of content Slides several Episodes compose, `slide-pool/<slide>/` (FE-004). */
export const SLIDE_POOL_FOLDER = 'slide-pool';

/** The Templates' compositions: pages that are no Episode, one folder each, `templates/<slug>/` (design-ADR 0019). */
export const TEMPLATES_FOLDER = 'templates';

/** The Explorable pages' compositions: Episode-shaped pages about one Explorable, one folder each, `explorable-pages/<slug>/`. */
export const EXPLORABLE_PAGES_FOLDER = 'explorable-pages';

/** The Guides' compositions: step-by-step pages, one folder each, `guides/<slug>/` (design-ADR 0019, #450). */
export const GUIDES_FOLDER = 'guides';

/**
 * Folder names under the Episodes folder that hold no Episode, so no Episode may take one as its slug: the Event copies,
 * the Slide pool, the Templates, and the area's code (`components/`, `lib/`, `hooks/`).
 */
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

/** An Episode as code passes it: no Event owns it, so its slug is its id, or one Event owns it as its copy. */
export type EpisodeRef<Id extends string = string> =
  | { readonly kind: 'standalone'; readonly id: Id; readonly slug: Id }
  | { readonly kind: 'event-copy'; readonly id: Id; readonly event: string; readonly slug: string };

/** An Episode no Event owns: the only kind with a page of its own under `/episodes/`. */
export type StandaloneRef<Id extends string = string> = Extract<EpisodeRef<Id>, { readonly kind: 'standalone' }>;

/** The slug an Episode id names: the id itself, or what follows its Event slug. Types a record against its key. */
export type EpisodeSlugOf<Id extends string> = Id extends `${string}${typeof SEPARATOR}${infer Slug}` ? Slug : Id;

/** The id `episodeRef` gives a slug, alone or under the Event that owns it. */
export type EpisodeIdOf<Slug extends string, Event extends string | undefined> = Event extends string
  ? `${Event}${typeof SEPARATOR}${Slug}`
  : Slug;

/**
 * The Episode in folder `<slug>/`, or, when an Event owns it, in `by-event/<event>/<slug>/`: built from its parts, never
 * parsed. The folder walker names each Episode it finds this way, and a test names an Episode this way, so no caller
 * writes an id out by hand.
 */
export function episodeRef<Slug extends string>(slug: Slug): StandaloneRef<Slug>;
export function episodeRef<Slug extends string, Event extends string>(
  slug: Slug,
  event: Event,
): Extract<EpisodeRef<EpisodeIdOf<Slug, Event>>, { readonly kind: 'event-copy' }>;
export function episodeRef(slug: string, event?: string): EpisodeRef {
  if (event === undefined) return { kind: 'standalone', id: slug, slug };
  return { kind: 'event-copy', id: `${event}${SEPARATOR}${slug}`, event, slug };
}

/** The Episode an id names: a copy when it holds its Event's slug, else one no Event owns. Only the store calls it. */
export function episodeRefOf<Id extends string>(id: Id): EpisodeRef<Id> {
  const at = id.indexOf(SEPARATOR);
  if (at < 0) return { kind: 'standalone', id, slug: id };
  return { kind: 'event-copy', id, event: id.slice(0, at), slug: id.slice(at + SEPARATOR.length) };
}

/** One case per kind of Episode, each handed the Episode narrowed to that kind. */
export type EpisodeCases<Id extends string, R> = {
  readonly [K in EpisodeRef<Id>['kind']]: (episode: Extract<EpisodeRef<Id>, { readonly kind: K }>) => R;
};

/** The one way to branch on an Episode's kind, as `matchPage` is for a page's: a new kind fails `tsc` at each site. */
export function matchEpisode<Id extends string, R>(episode: EpisodeRef<Id>, cases: EpisodeCases<Id, R>): R {
  return episode.kind === 'standalone' ? cases.standalone(episode) : cases['event-copy'](episode);
}

/** A Template's composition (design-ADR 0019): a page that is no Episode, named by its slug, which is its id. */
export interface TemplateRef<Slug extends string = string> {
  readonly kind: 'template';
  readonly id: Slug;
  readonly slug: Slug;
}

/** The Template composition in folder `templates/<slug>/`. */
export function templateRef<Slug extends string>(slug: Slug): TemplateRef<Slug> {
  return { kind: 'template', id: slug, slug };
}

/** An Explorable page's composition: Episode-shaped, named by its slug, which is also its primary Explorable's folder slug. */
export interface ExplorablePageRef<Slug extends string = string> {
  readonly kind: 'explorable-page';
  readonly id: Slug;
  readonly slug: Slug;
}

/** The Explorable page composition in folder `explorable-pages/<slug>/`. */
export function explorablePageRef<Slug extends string>(slug: Slug): ExplorablePageRef<Slug> {
  return { kind: 'explorable-page', id: slug, slug };
}

/** A Guide's composition: a step-by-step page, named by its slug, which is its id. */
export interface GuideRef<Slug extends string = string> {
  readonly kind: 'guide';
  readonly id: Slug;
  readonly slug: Slug;
}

/** The Guide composition in folder `guides/<slug>/`. */
export function guideRef<Slug extends string>(slug: Slug): GuideRef<Slug> {
  return { kind: 'guide', id: slug, slug };
}

/**
 * A page's folder under the Episodes folder, the one place the folder layout is written: `<slug>` for an Episode no
 * Event owns, `by-event/<event>/<slug>` for an Event's copy, `templates/<slug>` for a Template, `explorable-pages/<slug>`
 * for an Explorable page, `guides/<slug>` for a Guide.
 */
export function folderOf(page: EpisodeRef | TemplateRef | ExplorablePageRef | GuideRef): string {
  if (page.kind === 'template') return `${TEMPLATES_FOLDER}/${page.slug}`;
  if (page.kind === 'guide') return `${GUIDES_FOLDER}/${page.slug}`;
  if (page.kind === 'explorable-page') return `${EXPLORABLE_PAGES_FOLDER}/${page.slug}`;
  return matchEpisode(page, {
    standalone: ({ slug }) => slug,
    'event-copy': ({ event, slug }) => `${EVENT_COPIES_FOLDER}/${event}/${slug}`,
  });
}
