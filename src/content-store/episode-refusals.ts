import {
  EVENT_COPIES_FOLDER,
  matchEpisode,
  RESERVED_FOLDER_NAMES,
  type EpisodeRef,
} from '@/content-store/catalogue/episode-id.pure';
import { LOCALES } from '@/shared/lib/locale.pure';
import { duplicates } from './duplicates';
import type { Episode } from './schemas/episode.schema';

// decision: FE-013 §3
// decision: docs/adr/0016-content-data-model.md
export type LoadedEpisode = Episode & { readonly ref: EpisodeRef };

const LOCALE_LIST: readonly string[] = LOCALES;
const NOT_A_LOCALE = `is not one of the site's locales (${LOCALE_LIST.join(', ')})`;

function unlistedPerLocale(keys: readonly string[]): string {
  if (keys.length > 1)
    return `youtube holds ${keys.length} videos (${keys.join(', ')}), but an unlisted Episode carries at most one Video, its Event recording with its language`;
  return 'youtube is one video per locale, but an unlisted Episode carries one recording with its language';
}

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

function folderRefusals({ slug, visibility, ref }: LoadedEpisode, events: ReadonlySet<string>): string[] {
  const owner = matchEpisode(ref, { standalone: () => undefined, 'event-copy': ({ event }) => event });
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

export function episodeRefusals(
  episode: LoadedEpisode,
  listedByEvents: ReadonlySet<string>,
  events: ReadonlySet<string>,
): string[] {
  const tags: readonly string[] = episode.tags;
  const orphan = episode.visibility === 'unlisted' && !listedByEvents.has(episode.ref.id);
  return [
    ...folderRefusals(episode, events),
    ...duplicates(tags).map((tag) => `tags lists ${tag} twice`),
    ...(orphan ? ['visibility is unlisted, but no Event presents a Playlist listing it, so it has no address'] : []),
    ...videoRefusals(episode),
  ].map((sentence) => `Episode ${episode.ref.id}: ${sentence}`);
}
