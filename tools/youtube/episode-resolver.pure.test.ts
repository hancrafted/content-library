import { describe, expect, it } from 'vitest';
import { resolveEpisode, videoIdsOf, youtubeVideoId, type EpisodeEntry } from './episode-resolver.pure.ts';

const EVENT = '2026-10-28-cyberforum';
const COPY_VIDEO = 'atPa8aTd-PQ';
const PUBLIC_VIDEO_EN = 'aaaaaaaaaaa';
const PUBLIC_VIDEO_DE = 'bbbbbbbbbbb';
const COPY: EpisodeEntry = {
  id: `${EVENT}__ai-attention-span`,
  slug: 'ai-attention-span',
  event: EVENT,
  folder: `by-event/${EVENT}/ai-attention-span`,
  videoIds: [COPY_VIDEO],
};
const PUBLIC: EpisodeEntry = {
  id: 'ai-attention-span',
  slug: 'ai-attention-span',
  folder: 'ai-attention-span',
  videoIds: [PUBLIC_VIDEO_EN, PUBLIC_VIDEO_DE],
};
const EPISODES = [PUBLIC, COPY];

function resolvedId(input: string): string | undefined {
  const result = resolveEpisode(input, EPISODES);
  return result.ok ? result.episode.id : undefined;
}

describe('success cases', () => {
  it('finds the Episode that declares a video ID', () => {
    // ARRANGE
    const expected = COPY.id;
    // ACT
    const id = resolvedId(COPY_VIDEO);
    // ASSERT
    expect(id).toBe(expected);
  });

  it.each([
    ['a watch URL', `https://www.youtube.com/watch?v=${COPY_VIDEO}&t=10s`],
    ['a short link', `https://youtu.be/${COPY_VIDEO}?si=x`],
    ['a shorts URL', `https://www.youtube.com/shorts/${COPY_VIDEO}`],
  ])('finds the Episode from %s', (_name, url) => {
    // ARRANGE
    const expected = COPY.id;
    // ACT
    const id = resolvedId(url);
    // ASSERT
    expect(id).toBe(expected);
  });

  it('finds a public Episode by the video of either locale', () => {
    // ARRANGE
    const expected = [PUBLIC.id, PUBLIC.id];
    // ACT
    const ids = [resolvedId(PUBLIC_VIDEO_EN), resolvedId(PUBLIC_VIDEO_DE)];
    // ASSERT
    expect(ids).toEqual(expected);
  });

  it.each([
    ['a relative folder', COPY.folder],
    ['a folder with a trailing slash', `${COPY.folder}/`],
    ['a folder under src/episodes', `src/episodes/${COPY.folder}`],
    ['an absolute folder', `/Users/han/content-library/src/episodes/${COPY.folder}/`],
  ])('finds the Episode from %s', (_name, folder) => {
    // ARRANGE
    const expected = COPY.id;
    // ACT
    const id = resolvedId(folder);
    // ASSERT
    expect(id).toBe(expected);
  });

  it.each([
    ['the English page on localhost', 'http://localhost:3000/episodes/ai-attention-span/'],
    ['the German page on localhost', 'http://localhost:3000/de/episodes/ai-attention-span/'],
    ['the English page on hancrafted.net', 'https://hancrafted.net/episodes/ai-attention-span/'],
    ['the German page on hancrafted.net', 'https://hancrafted.net/de/episodes/ai-attention-span/#intro'],
  ])('finds the public Episode from %s', (_name, url) => {
    // ARRANGE
    const expected = PUBLIC.id;
    // ACT
    const id = resolvedId(url);
    // ASSERT
    expect(id).toBe(expected);
  });

  it.each([
    ['English', `https://hancrafted.net/events/${EVENT}/episodes/ai-attention-span/`],
    ['German', `http://localhost:3000/de/events/${EVENT}/episodes/ai-attention-span`],
  ])('finds the Event copy from its Event-scoped %s page', (_name, url) => {
    // ARRANGE
    const expected = COPY.id;
    // ACT
    const id = resolvedId(url);
    // ASSERT
    expect(id).toBe(expected);
  });

  it('lists the video IDs of an Event recording and of a public Episode', () => {
    // ARRANGE
    const expected = [[COPY_VIDEO], [PUBLIC_VIDEO_EN, PUBLIC_VIDEO_DE], []];
    // ACT
    const ids = [
      videoIdsOf({ id: COPY_VIDEO, language: 'de' }),
      videoIdsOf({ en: PUBLIC_VIDEO_EN, de: PUBLIC_VIDEO_DE }),
      videoIdsOf(undefined),
    ];
    // ASSERT
    expect(ids).toEqual(expected);
  });
});

describe('failure cases', () => {
  it.each([
    ['an unknown video ID', 'zzzzzzzzzzz'],
    ['an unknown folder', 'no-such-episode'],
    ['an unknown page', 'https://hancrafted.net/episodes/no-such-episode/'],
    ['a page that is no Episode page', 'https://hancrafted.net/events/'],
    ['a foreign host', 'https://example.com/episodes/ai-attention-span/'],
    ['an empty input', ' '],
  ])('refuses %s', (_name, input) => {
    // ARRANGE
    const expected = false;
    // ACT
    const result = resolveEpisode(input, EPISODES);
    // ASSERT
    expect(result.ok).toBe(expected);
  });

  it('refuses a video that two Episodes declare', () => {
    // ARRANGE
    const twin: EpisodeEntry = { ...COPY, id: 'twin', folder: 'twin' };
    const expected = false;
    // ACT
    const result = resolveEpisode(COPY_VIDEO, [COPY, twin]);
    // ASSERT
    expect(result.ok).toBe(expected);
  });
});

describe('edge cases', () => {
  it('reads no video ID from a URL that is not YouTube', () => {
    // ARRANGE
    const expected = undefined;
    // ACT
    const id = youtubeVideoId(`https://example.com/watch?v=${COPY_VIDEO}`);
    // ASSERT
    expect(id).toBe(expected);
  });
});
