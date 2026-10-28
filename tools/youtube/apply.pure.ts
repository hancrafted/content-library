// The pure half of `npm run youtube:apply`: what to write to a video given the local `youtube.<lang>.md` and the
// remote description, the `.env` safety rule, and the credentials in `.env`. The shell is `apply.ts`, the
// YouTube client `youtube-client.ts`. Rationale: docs/adr/0020-post-production-writes-youtube-metadata-from-the-repo.md.
import { publishedDescription, type YoutubeFile } from './youtube-file.pure.ts';

export type DescriptionPlan = { readonly action: 'update'; readonly text: string } | { readonly action: 'none' };
export type CommentPlan =
  { readonly action: 'post'; readonly text: string } | { readonly action: 'none'; readonly reason: string };

export interface ApplyPlan {
  readonly description: DescriptionPlan;
  readonly comment: CommentPlan;
}

/** A description as YouTube compares it: line endings unified, outer whitespace dropped. */
function normalized(text: string): string {
  return text.replace(/\r\n/g, '\n').trim();
}

/** The writes that bring the video to the local copy: the description when it differs, the comment when not yet posted. */
export function planApply(file: YoutubeFile, remoteDescription: string): ApplyPlan {
  const local = normalized(publishedDescription(file));
  const description: DescriptionPlan =
    local === normalized(remoteDescription) ? { action: 'none' } : { action: 'update', text: local };
  const comment: CommentPlan =
    file.commentId !== ''
      ? { action: 'none', reason: `already posted (${file.commentId})` }
      : file.pinnedComment === ''
        ? { action: 'none', reason: 'no pinned comment text' }
        : { action: 'post', text: file.pinnedComment };
  return { description, comment };
}

/** What git and the disk say about the `.env` file. */
export interface EnvState {
  readonly exists: boolean;
  readonly tracked: boolean;
  readonly ignored: boolean;
}

/** Why the `.env` may not be used, or undefined when it is safe. */
export function envProblem(state: EnvState): string | undefined {
  if (!state.exists) return '.env is missing; see tools/youtube/AGENTS.md for the OAuth setup';
  if (state.tracked) return '.env is tracked by git; untrack it (git rm --cached .env) and rotate the credentials';
  if (!state.ignored) return '.env is not git-ignored; add it to .gitignore first';
  return undefined;
}

export interface Credentials {
  readonly clientId: string;
  readonly clientSecret: string;
  readonly refreshToken: string;
}

const CREDENTIAL_KEYS = {
  clientId: 'YOUTUBE_CLIENT_ID',
  clientSecret: 'YOUTUBE_CLIENT_SECRET',
  refreshToken: 'YOUTUBE_REFRESH_TOKEN',
} as const;

/** The credentials in `.env` text, or the names (never values) of the missing ones. */
export function parseCredentials(text: string): { value: Credentials } | { missing: string[] } {
  const entries = new Map<string, string>();
  for (const line of text.replace(/\r\n/g, '\n').split('\n')) {
    const match = /^\s*(?:export\s+)?([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
    if (match) entries.set(match[1] as string, (match[2] as string).replace(/^(["'])(.*)\1$/, '$2'));
  }
  const missing = Object.values(CREDENTIAL_KEYS).filter((key) => !entries.get(key));
  if (missing.length > 0) return { missing };
  const get = (key: string): string => entries.get(key) as string;
  return {
    value: {
      clientId: get(CREDENTIAL_KEYS.clientId),
      clientSecret: get(CREDENTIAL_KEYS.clientSecret),
      refreshToken: get(CREDENTIAL_KEYS.refreshToken),
    },
  };
}
