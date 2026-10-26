import { episodeRef } from '@/content-store/catalogue/episode-id.pure';
import { EPISODE_IDS, hasPage, isEpisodeId } from '@/content-store/catalogue/record-routes';
import { episodeFolders, METADATA_FILE } from '@/episodes/lib/episode-folders';
import { readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { FEATURED } from './featured';
import { episodePublishedOn, episodeStatus, listEpisodes } from './store';

/*
 * The store's Episode read API the Episode browser depends on (#40): one metadata
 * entry per Episode folder, an Event's copies included, so no Episode silently drops out. The
 * Episode registry derives the entries from the folders the one folder walker finds; the first test checks that
 * every Episode it finds, and only those, is in the store, by its Episode id.
 */

const ROOT = process.cwd();
const KEBAB_CASE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Every Episode folder the walker finds, by Episode id. */
const FOLDERS = new Map(episodeFolders(ROOT).map((folder) => [folder.id, folder]));

/** Every Episode with a page, its ref narrowed to a registered Episode's, as the getters take it. */
const WITH_PAGE = listEpisodes().flatMap((episode) => (hasPage(episode.ref) ? [{ ...episode, ref: episode.ref }] : []));

/** Only a date that survives a round trip is one: `2026-02-30` has the shape but is not a day. */
function isCalendarDate(value: string): boolean {
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

describe('success cases', () => {
  it('returns one entry per Episode folder, and no entry without a folder', () => {
    // ARRANGE
    const expected = [...FOLDERS.keys()].sort();
    // ACT
    const listed = listEpisodes()
      .map(({ ref }) => ref.id)
      .sort();
    // ASSERT
    expect(listed).toEqual(expected);
  });

  it.each(listEpisodes().map(({ ref }) => ref.id))('keeps the metadata of %s in its own folder', (id) => {
    // ARRANGE
    const folder = FOLDERS.get(id);
    // ACT
    const files = folder?.files ?? [];
    // ASSERT
    expect(files).toContain(METADATA_FILE);
  });

  it('registers never-too-early-sales as a published Episode led by the sales Tag, with its page', () => {
    // ARRANGE
    const slug = 'never-too-early-sales';
    const expected = {
      ref: episodeRef(slug),
      slug,
      status: 'published',
      visibility: 'public',
      format: 'foundations',
      tags: ['sales'],
      publishedOn: '2026-10-19',
      youtube: { en: 'lnr7T-IBHTw', de: 'lnr7T-IBHTw' },
    };
    // ACT
    const metadata = listEpisodes().find(({ ref }) => ref.id === slug);
    const page = isEpisodeId(slug);
    // ASSERT
    expect(metadata).toEqual(expected);
    expect(page).toBe(true);
  });

  it('registers onboard-ai-every-time as a published Episode led by context-engineering, with its page', () => {
    // ARRANGE
    const slug = 'onboard-ai-every-time';
    const expected = {
      ref: episodeRef(slug),
      slug,
      status: 'published',
      visibility: 'public',
      format: 'foundations',
      tags: ['context-engineering', 'agentic-ai', 'workflow'],
      publishedOn: '2026-10-20',
    };
    // ACT
    const metadata = listEpisodes().find(({ ref }) => ref.id === slug);
    const page = isEpisodeId(slug);
    // ASSERT
    expect(metadata).toEqual(expected);
    expect(page).toBe(true);
  });

  it('registers ai-attention-span as a published Episode led by context-engineering, with its page', () => {
    // ARRANGE
    const slug = 'ai-attention-span';
    const expected = {
      ref: episodeRef(slug),
      slug,
      status: 'published',
      visibility: 'public',
      format: 'foundations',
      tags: ['context-engineering', 'workflow'],
      publishedOn: '2026-10-21',
    };
    // ACT
    const metadata = listEpisodes().find(({ ref }) => ref.id === slug);
    const page = isEpisodeId(slug);
    // ASSERT
    expect(metadata).toEqual(expected);
    expect(page).toBe(true);
  });

  it('registers ai-gives-you-more-work as a published Episode led by agentic-ai, with its page', () => {
    // ARRANGE
    const slug = 'ai-gives-you-more-work';
    const expected = {
      ref: episodeRef(slug),
      slug,
      status: 'published',
      visibility: 'public',
      format: 'foundations',
      tags: ['agentic-ai', 'workflow'],
      publishedOn: '2026-10-21',
    };
    // ACT
    const metadata = listEpisodes().find(({ ref }) => ref.id === slug);
    const page = isEpisodeId(slug);
    // ASSERT
    expect(metadata).toEqual(expected);
    expect(page).toBe(true);
  });

  it.each(['episode-template', 'workshop-template', 'slide-master', 'explorable-explanations'])(
    'lists no tooling page in the overview or Upcoming Episodes: %s is no Episode',
    (slug) => {
      // ARRANGE
      const expected = { listed: false, page: false };
      // ACT
      const listed = listEpisodes().some(({ ref }) => ref.id === slug);
      const page = isEpisodeId(slug);
      // ASSERT
      expect({ listed, page }).toEqual(expected);
    },
  );

  it.each(WITH_PAGE)('reads the status of $ref.id from its metadata', (episode) => {
    // ARRANGE
    const expected = episode.status;
    // ACT
    const status = episodeStatus(episode.ref);
    // ASSERT
    expect(status).toBe(expected);
  });

  it.each(WITH_PAGE)('reads the release date of $ref.id from its metadata, none while it is upcoming', (episode) => {
    // ARRANGE
    const expected = episode.status === 'published' ? episode.publishedOn : undefined;
    // ACT
    const publishedOn = episodePublishedOn(episode.ref);
    // ASSERT
    expect(publishedOn).toBe(expected);
  });
});

describe('failure cases', () => {
  it('holds no upcoming Episode whose slug is not kebab-case', () => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const wrong = listEpisodes()
      .filter(({ status, slug }) => status === 'upcoming' && !KEBAB_CASE.test(slug))
      .map(({ slug }) => slug);
    // ASSERT
    expect(wrong).toEqual(expected);
  });

  it('dates every published Episode with a real calendar day', () => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const undated = listEpisodes().flatMap((episode) =>
      episode.status === 'published' && !isCalendarDate(episode.publishedOn) ? [episode.ref.id] : [],
    );
    // ASSERT
    expect(undated).toEqual(expected);
  });

  it('gives an upcoming Episode with no page a folder holding only its metadata', () => {
    // ARRANGE
    const registered: readonly string[] = EPISODE_IDS;
    const expected = listEpisodes()
      .filter(({ status, ref }) => status === 'upcoming' && !registered.includes(ref.id))
      .map(({ ref }) => [ref.id, [METADATA_FILE]]);
    // ACT
    const contents = expected.map(([id]) => [id, readdirSync(FOLDERS.get(id as string)?.dir ?? '')]);
    // ASSERT
    expect(contents).toEqual(expected);
  });

  it('fails loudly for a registered slug no metadata lists, never defaulting to published', () => {
    // ARRANGE
    const unlisted = episodeRef('not-an-episode');
    // ACT
    // @ts-expect-error -- an Episode the registry does not hold has no status to read
    const read = () => episodeStatus(unlisted);
    // ASSERT
    expect(read).toThrow(/not-an-episode/);
  });

  it('fails loudly for a release date of a registered slug no metadata lists, as the status read does', () => {
    // ARRANGE
    const unlisted = episodeRef('not-an-episode');
    // ACT
    // @ts-expect-error -- an Episode the registry does not hold has no release date to read
    const read = () => episodePublishedOn(unlisted);
    // ASSERT
    expect(read).toThrow(/not-an-episode/);
  });
});

describe('edge cases', () => {
  it('gives a published Episode a publishedOn and an upcoming one none, with or without a page', () => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const wrong = listEpisodes().filter((episode) => 'publishedOn' in episode !== (episode.status === 'published'));
    // ASSERT
    expect(wrong.map(({ slug }) => slug)).toEqual(expected);
  });

  it('features published Episodes only', () => {
    // ARRANGE
    const expected = FEATURED.map((slug) => [slug, 'published']);
    // ACT
    const featured = FEATURED.map((slug) => [slug, listEpisodes().find(({ ref }) => ref.id === slug)?.status]);
    // ASSERT
    expect(featured).toEqual(expected);
  });

  it('keeps every Tag atomic: kebab-case and once per Episode', () => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const faulty = listEpisodes().flatMap(({ slug, tags }) =>
      tags.filter((tag, index) => !KEBAB_CASE.test(tag) || tags.indexOf(tag) !== index).map((tag) => `${slug}: ${tag}`),
    );
    // ASSERT
    expect(faulty).toEqual(expected);
  });

  it('holds ids only, so no title or caption sneaks into the metadata', () => {
    // ARRANGE
    const forbidden = ['title', 'caption', 'accent', 'icon', 'featuredRank'];
    // ACT
    const keys = new Set(listEpisodes().flatMap((episode) => Object.keys(episode)));
    // ASSERT
    forbidden.forEach((key) => expect(keys).not.toContain(key));
  });
});
