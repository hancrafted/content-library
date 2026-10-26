/*
 * The Episode id (GLOSSARY): every Episode's one name across all Episodes, derived from its folder and never written
 * in its record (design-ADR 0016 decision 3). An Episode no Event owns sits in `episodes/<slug>/` and its id is its
 * slug; an Event's copy sits in `episodes/by-event/<event-slug>/<slug>/` and its id is `<event-slug>__<slug>`. One path
 * segment, so it works as a folder, a DOM id or a key. Imports nothing, so the registry generator can load it too.
 */

/** The folder an Event's copies sit in, one folder per Event: `by-event/<event-slug>/<slug>/`. */
export const EVENT_COPIES_FOLDER = 'by-event';

/** Folder names under the Episodes folder that hold no Episode, so no Episode may take one as its slug. */
export const RESERVED_FOLDER_NAMES: readonly string[] = [EVENT_COPIES_FOLDER];

const SEPARATOR = '__';

/** An Episode as code passes it: no Event owns it, or one Event owns it as its copy. */
export type EpisodeRef<Id extends string = string> =
  | { readonly kind: 'standalone'; readonly id: Id; readonly slug: string }
  | { readonly kind: 'event-copy'; readonly id: Id; readonly event: string; readonly slug: string };

/** The slug an Episode id names: the id itself, or what follows its Event slug. Types a record against its key. */
export type EpisodeSlugOf<Id extends string> = Id extends `${string}${typeof SEPARATOR}${infer Slug}` ? Slug : Id;

/** The id of the Episode in folder `<slug>/`, or, when an Event owns it, in `by-event/<event>/<slug>/`. */
export function episodeIdOf(slug: string, event?: string): string {
  return event === undefined ? slug : `${event}${SEPARATOR}${slug}`;
}

/** The Episode an id names: a copy when it holds its Event's slug, else one no Event owns. */
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

/** The Episode's folder under the Episodes folder: `<slug>`, or `by-event/<event>/<slug>` for a copy. */
export function episodeFolderOf(episode: EpisodeRef): string {
  return matchEpisode(episode, {
    standalone: ({ slug }) => slug,
    'event-copy': ({ event, slug }) => `${EVENT_COPIES_FOLDER}/${event}/${slug}`,
  });
}
