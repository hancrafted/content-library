// The Episode resolver of the post-production tools (`npm run youtube:*`): turns what Han pastes — a video ID or
// YouTube URL, an Episode folder, or a page URL of the site — into the one Episode it names, or refuses. Pure: the
// shell (`episode-index.ts`) lists the Episodes, so every later `youtube` entry point resolves the same way.

/** One Episode the resolver can match: standalone or Event copy, where it sits, the videos it declares. */
export interface EpisodeEntry {
  /** The Episode id: `<slug>`, or `<event>__<slug>` for an Event copy. */
  readonly id: string;
  readonly slug: string;
  /** The Event slug, for an Event copy only. */
  readonly event?: string;
  /** Its path under the Episodes folder: `<slug>` or `by-event/<event>/<slug>`. */
  readonly folder: string;
  /** Every YouTube video ID its metadata declares, whatever the locale. */
  readonly videoIds: readonly string[];
}

export type Resolution =
  { readonly ok: true; readonly episode: EpisodeEntry } | { readonly ok: false; readonly reason: string };

/** The `youtube` field of an Episode's metadata: an Event recording `{id, language}`, or a public `{locale: id}` map. */
export type YoutubeMetadata = { readonly id: string } | Readonly<Record<string, string>>;

const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;
const YOUTUBE_HOSTS = ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com'];
const ID_PATH_PREFIXES = ['shorts', 'embed', 'live', 'v'];
const SHORT_HOST = 'youtu.be';
const SITE_HOSTS = ['localhost', '127.0.0.1', 'hancrafted.net', 'www.hancrafted.net'];
const LOCALE_PREFIX = /^\/de(?=\/|$)/;
const EPISODES_FOLDER = 'src/episodes';
const EVENT_COPIES_FOLDER = 'by-event';

/** The video IDs an Episode's `youtube` metadata declares. */
export function videoIdsOf(youtube: YoutubeMetadata | undefined): string[] {
  if (!youtube) return [];
  if (typeof youtube.id === 'string') return [youtube.id];
  return Object.values(youtube).filter((value) => VIDEO_ID.test(value));
}

/** The video ID a YouTube URL carries (watch, short link, shorts, embed, live), or undefined. */
function idInUrl(url: URL): string | undefined {
  const parts = url.pathname.split('/').filter(Boolean);
  if (url.hostname === SHORT_HOST) return parts[0];
  if (!YOUTUBE_HOSTS.includes(url.hostname)) return undefined;
  return ID_PATH_PREFIXES.includes(parts[0] ?? '') ? parts[1] : (url.searchParams.get('v') ?? undefined);
}

/** The video ID in a bare ID or a YouTube URL, or undefined. */
export function youtubeVideoId(input: string): string | undefined {
  if (VIDEO_ID.test(input)) return input;
  const url = parseUrl(input);
  const candidate = url ? idInUrl(url) : undefined;
  return candidate && VIDEO_ID.test(candidate) ? candidate : undefined;
}

function parseUrl(input: string): URL | undefined {
  try {
    return new URL(input);
  } catch {
    return undefined;
  }
}

/** The folder under the Episodes folder an input path names, or undefined when it is no such path. */
function folderFromPath(input: string): string | undefined {
  const normalized = input.replace(/\\/g, '/').replace(/\/+$/, '');
  const at = normalized.lastIndexOf(`${EPISODES_FOLDER}/`);
  const relative = at === -1 ? normalized.replace(/^\.\//, '') : normalized.slice(at + EPISODES_FOLDER.length + 1);
  return relative.length > 0 ? relative : undefined;
}

/** The folder a site page URL names: `/episodes/<slug>/` or `/events/<event>/episodes/<slug>/`, in either locale. */
function folderFromPageUrl(url: URL): string | undefined {
  const parts = url.pathname.replace(LOCALE_PREFIX, '').split('/').filter(Boolean);
  if (parts.length === 2 && parts[0] === 'episodes') return parts[1];
  if (parts.length === 4 && parts[0] === 'events' && parts[2] === 'episodes') {
    return `${EVENT_COPIES_FOLDER}/${parts[1]}/${parts[3]}`;
  }
  return undefined;
}

function byFolder(folder: string | undefined, episodes: readonly EpisodeEntry[], input: string): Resolution {
  const match = folder === undefined ? undefined : episodes.find((episode) => episode.folder === folder);
  return match ? { ok: true, episode: match } : { ok: false, reason: `no Episode matches ${input}` };
}

/**
 * The Episode `input` names: a video ID or YouTube URL (the Episode that declares the video), an Episode folder
 * (relative or absolute), or a page URL on localhost or hancrafted.net, in either locale, own or Event-scoped.
 * Refuses an input that matches no Episode, or a video that more than one Episode declares.
 */
export function resolveEpisode(input: string, episodes: readonly EpisodeEntry[]): Resolution {
  const text = input.trim();
  const videoId = youtubeVideoId(text);
  if (videoId) {
    const matches = episodes.filter((episode) => episode.videoIds.includes(videoId));
    if (matches.length === 1) return { ok: true, episode: matches[0] as EpisodeEntry };
    if (matches.length === 0) return { ok: false, reason: `no Episode declares the video ${videoId}` };
    return { ok: false, reason: `the video ${videoId} is declared by ${matches.map(({ id }) => id).join(', ')}` };
  }
  const url = parseUrl(text);
  if (url) {
    if (!SITE_HOSTS.includes(url.hostname)) return { ok: false, reason: `no Episode matches ${text}: unknown host` };
    return byFolder(folderFromPageUrl(url), episodes, text);
  }
  return byFolder(folderFromPath(text), episodes, text);
}
