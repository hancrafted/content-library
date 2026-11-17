import { EPISODES_DIR } from '../../src/episodes/lib/episode-folders.ts';
import { DEFAULT_SPOKEN_LANGUAGE, SPOKEN_LANGUAGES } from './transcript.pure.ts';

export interface EpisodeEntry {
  readonly id: string;
  readonly slug: string;
  readonly event?: string;
  readonly folder: string;
  readonly videoIds: readonly string[];
  readonly videosByLanguage?: Readonly<Record<string, string>>;
}

export type Resolution =
  | { readonly ok: true; readonly episode: EpisodeEntry }
  | { readonly ok: false; readonly reason: string };

export type YoutubeMetadata = { readonly id: string } | Readonly<Record<string, string>>;

const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;
const YOUTUBE_HOSTS = ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com'];
const ID_PATH_PREFIXES = ['shorts', 'embed', 'live', 'v'];
const SHORT_HOST = 'youtu.be';
const SITE_HOSTS = ['localhost', '127.0.0.1', 'hancrafted.net', 'www.hancrafted.net'];
const LOCALE_PREFIX = new RegExp(
  `^/(?:${SPOKEN_LANGUAGES.filter((language) => language !== DEFAULT_SPOKEN_LANGUAGE).join('|')})(?=/|$)`,
);
const EPISODES_FOLDER = EPISODES_DIR;
const EVENT_COPIES_FOLDER = 'by-event';

export function videoIdsOf(youtube: YoutubeMetadata | undefined): string[] {
  return [...new Set(Object.values(videosByLanguageOf(youtube)))];
}

export function videosByLanguageOf(youtube: YoutubeMetadata | undefined): Record<string, string> {
  if (!youtube) return {};
  if (typeof youtube.id === 'string') {
    const language = (youtube as { language?: unknown }).language;
    return typeof language === 'string' ? { [language]: youtube.id } : { '': youtube.id };
  }
  return Object.fromEntries(Object.entries(youtube).filter(([, value]) => VIDEO_ID.test(value)));
}

export function pickVideo(
  episode: EpisodeEntry,
  language: string,
  pasted: string | undefined,
): { ok: true; videoId: string } | { ok: false; reason: string } {
  if (pasted !== undefined) {
    return episode.videoIds.includes(pasted)
      ? { ok: true, videoId: pasted }
      : { ok: false, reason: `${episode.id} does not declare the video ${pasted}` };
  }
  const [only, ...others] = episode.videoIds;
  if (only === undefined)
    return { ok: false, reason: `${episode.id} declares no video; run /episode-add-youtube first` };
  if (others.length === 0) return { ok: true, videoId: only };
  const declared = episode.videosByLanguage?.[language];
  if (declared !== undefined) return { ok: true, videoId: declared };
  return {
    ok: false,
    reason: `${episode.id} declares several videos (${episode.videoIds.join(', ')}) and none for ${language}; pass the video's YouTube URL`,
  };
}

function idInUrl(url: URL): string | undefined {
  const parts = url.pathname.split('/').filter(Boolean);
  if (url.hostname === SHORT_HOST) return parts[0];
  if (!YOUTUBE_HOSTS.includes(url.hostname)) return undefined;
  return ID_PATH_PREFIXES.includes(parts[0] ?? '') ? parts[1] : (url.searchParams.get('v') ?? undefined);
}

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

function folderFromPath(input: string): string | undefined {
  const normalized = input.replace(/\\/g, '/').replace(/\/+$/, '');
  const at = normalized.lastIndexOf(`${EPISODES_FOLDER}/`);
  const relative = at === -1 ? normalized.replace(/^\.\//, '') : normalized.slice(at + EPISODES_FOLDER.length + 1);
  return relative.length > 0 ? relative : undefined;
}

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

function ambiguousSlug(text: string, episodes: readonly EpisodeEntry[]): Resolution | undefined {
  const sharing = text.includes('/') ? [] : episodes.filter((episode) => episode.slug === text);
  if (sharing.length < 2) return undefined;
  const ids = sharing.map(({ id }) => id).join(', ');
  return { ok: false, reason: `${text} is ambiguous: it names ${ids}; pass the Episode folder or the page URL` };
}

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
  return ambiguousSlug(text, episodes) ?? byFolder(folderFromPath(text), episodes, text);
}
