// The thin YouTube Data API adapter of `youtube:apply`: refresh the access token, read a video's snippet, update its
// description, insert a top-level comment. No logic beyond the HTTP calls; the decisions are in `apply.pure.ts`.
import type { Credentials } from './apply.pure.ts';

const API = 'https://www.googleapis.com/youtube/v3';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';

/** The writable snippet fields; `videos.update` replaces the snippet, so all of it is sent back. */
export type Snippet = Record<string, unknown> & { description: string };

async function call(url: string, init: RequestInit): Promise<Record<string, unknown>> {
  const response = await fetch(url, init);
  const body = (await response.json()) as Record<string, unknown>;
  if (!response.ok) throw new Error(`${init.method ?? 'GET'} ${new URL(url).pathname} failed: HTTP ${response.status}`);
  return body;
}

export interface YoutubeClient {
  readSnippet(videoId: string): Promise<Snippet>;
  updateDescription(videoId: string, snippet: Snippet, description: string): Promise<void>;
  postComment(videoId: string, text: string): Promise<string>;
}

async function accessToken(credentials: Credentials): Promise<string> {
  const token = await call(TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: credentials.clientId,
      client_secret: credentials.clientSecret,
      refresh_token: credentials.refreshToken,
      grant_type: 'refresh_token',
    }),
  });
  return String(token.access_token);
}

/** A client authorised with a refresh token. */
export async function connect(credentials: Credentials): Promise<YoutubeClient> {
  const headers = { authorization: `Bearer ${await accessToken(credentials)}`, 'content-type': 'application/json' };
  return {
    async readSnippet(videoId) {
      const body = await call(`${API}/videos?part=snippet&id=${encodeURIComponent(videoId)}`, { headers });
      const item = (body.items as { snippet: Snippet }[] | undefined)?.[0];
      if (!item) throw new Error(`video ${videoId} not found or not visible to this channel`);
      return item.snippet;
    },
    async updateDescription(videoId, snippet, description) {
      const body = JSON.stringify({ id: videoId, snippet: { ...snippet, description } });
      await call(`${API}/videos?part=snippet`, { method: 'PUT', headers, body });
    },
    async postComment(videoId, text) {
      const snippet = { videoId, topLevelComment: { snippet: { textOriginal: text } } };
      const body = await call(`${API}/commentThreads?part=snippet`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ snippet }),
      });
      return String(body.id);
    },
  };
}
