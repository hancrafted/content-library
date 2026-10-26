import {
  episodeRefOf,
  EVENT_COPIES_FOLDER,
  RESERVED_FOLDER_NAMES,
  type EpisodeRef,
} from '@/content-store/catalogue/episode-id.pure';
import { LOCALES } from '@/shared/lib/locale.pure';
import type { Episode } from './schemas/episode.schema';

/*
 * The store's refusals of one Episode (FE-013 Decision 3, design-ADR 0016 decisions 3, 4 and 9): where it lives, its
 * tags, whether an Event gives it an address, and its Video. Each sentence names the Episode by its Episode id. The
 * cross-record rules that call them sit in `refusals.ts`.
 */

/** An Episode's record as the store serves it: with its Episode id, derived from its folder, never written in it. */
export type LoadedEpisode = Episode & { readonly id: string };

/** Each item listed more than once, once. */
export function duplicates(items: readonly string[]): string[] {
  return [...new Set(items.filter((item, index) => items.indexOf(item) !== index))];
}

const LOCALE_LIST: readonly string[] = LOCALES;
const NOT_A_LOCALE = `is not one of the site's locales (${LOCALE_LIST.join(', ')})`;

/** Why an unlisted Episode's per-locale `youtube` is refused: it holds more than one Video, or the wrong shape. */
function unlistedPerLocale(keys: readonly string[]): string {
  if (keys.length > 1)
    return `youtube holds ${keys.length} videos (${keys.join(', ')}), but an unlisted Episode carries at most one Video, its Event recording with its language`;
  return 'youtube is one video per locale, but an unlisted Episode carries one recording with its language';
}

/** What is wrong with an Episode's Video for its visibility: one recording if unlisted, one per locale if public. */
function videoRefusals({ visibility, youtube }: Episode): string[] {
  if (youtube === undefined) return [];
  if ('language' in youtube)
    return [
      ...(visibility === 'public'
        ? ['youtube is one recording with its language, but a public Episode keeps one video per locale']
        : []),
      ...(LOCALE_LIST.includes(youtube.language) ? [] : [`youtube.language "${youtube.language}" ${NOT_A_LOCALE}`]),
    ];
  const keys = Object.keys(youtube);
  return [
    ...(visibility === 'unlisted' ? [unlistedPerLocale(keys)] : []),
    ...keys.filter((key) => !LOCALE_LIST.includes(key)).map((key) => `youtube names "${key}", which ${NOT_A_LOCALE}`),
  ];
}

/** What is wrong with where an Episode lives: a reserved slug, a slug its folder does not carry, an Event that is not. */
function folderRefusals({ slug, visibility }: LoadedEpisode, ref: EpisodeRef, events: ReadonlySet<string>): string[] {
  const owner = ref.kind === 'event-copy' ? ref.event : undefined;
  const checks: readonly (readonly [boolean, string])[] = [
    [RESERVED_FOLDER_NAMES.includes(slug), `slug "${slug}" is a reserved folder name of the Episodes folder`],
    [slug !== ref.slug, `slug "${slug}" is not its folder's name "${ref.slug}"`],
    [owner !== undefined && !events.has(owner), `its folder ${EVENT_COPIES_FOLDER}/${owner}/ names no Event`],
    [
      owner === undefined && visibility === 'unlisted',
      `visibility is unlisted, but it lives outside ${EVENT_COPIES_FOLDER}/: an unlisted Episode lives in its Event's folder`,
    ],
  ];
  return checks.flatMap(([refused, sentence]) => (refused ? [sentence] : []));
}

/** Every refusal of one Episode on its own: where it lives, its tags, its address and its Video. */
export function episodeRefusals(
  episode: LoadedEpisode,
  listedByEvents: ReadonlySet<string>,
  events: ReadonlySet<string>,
): string[] {
  const tags: readonly string[] = episode.tags;
  const orphan = episode.visibility === 'unlisted' && !listedByEvents.has(episode.id);
  return [
    ...folderRefusals(episode, episodeRefOf(episode.id), events),
    ...duplicates(tags).map((tag) => `tags lists ${tag} twice`),
    ...(orphan ? ['visibility is unlisted, but no Event presents a Playlist listing it, so it has no address'] : []),
    ...videoRefusals(episode),
  ].map((sentence) => `Episode ${episode.id}: ${sentence}`);
}
