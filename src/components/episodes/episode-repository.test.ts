import { FEATURED, LAYOUT_REFERENCES } from '@/lib/episode-overview';
import { EPISODE_SLUGS } from '@/lib/routes';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { episodeStatus, hasPage, listEpisodes } from './episode-repository';

/*
 * The read API the Episode overview depends on (#40): one metadata entry per
 * Episode folder, so no Episode silently drops out of the overview.
 */

const EPISODES_DIR = path.join(process.cwd(), 'src/components/episodes');
const METADATA_FILE = 'episode-metadata.ts';
const KEBAB_CASE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Every Episode folder on disk, layout references left out: what the overview must list. */
function episodeFolders(): string[] {
  const layout: readonly string[] = LAYOUT_REFERENCES;
  return readdirSync(EPISODES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !layout.includes(entry.name))
    .map((entry) => entry.name)
    .sort();
}

/** Only a date that survives a round trip is one: `2026-02-30` has the shape but is not a day. */
function isCalendarDate(value: string): boolean {
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

describe('success cases', () => {
  it('returns one entry per Episode folder, and no entry without a folder', () => {
    // ARRANGE
    const expected = episodeFolders();
    // ACT
    const listed = listEpisodes()
      .map(({ slug }) => slug)
      .sort();
    // ASSERT
    expect(listed).toEqual(expected);
  });

  it('lists every registered Episode but the layout references, whatever its status', () => {
    // ARRANGE
    const expected = EPISODE_SLUGS.filter((slug) => !(LAYOUT_REFERENCES as readonly string[]).includes(slug)).sort();
    // ACT
    const withPage = listEpisodes()
      .filter(({ slug }) => hasPage(slug))
      .map(({ slug }) => slug)
      .sort();
    // ASSERT
    expect(withPage).toEqual(expected);
  });

  it.each(listEpisodes().map(({ slug }) => slug))('keeps the metadata of %s in its own folder', (slug) => {
    // ARRANGE
    const folder = path.join(EPISODES_DIR, slug);
    // ACT
    const files = existsSync(folder) ? readdirSync(folder) : [];
    // ASSERT
    expect(files).toContain(METADATA_FILE);
  });

  it.each(LAYOUT_REFERENCES)('counts the layout reference %s as published, so it stays indexable', (slug) => {
    // ARRANGE
    const expected = 'published';
    // ACT
    const status = episodeStatus(slug);
    // ASSERT
    expect(status).toBe(expected);
  });

  it.each(listEpisodes().filter(({ slug }) => hasPage(slug)))(
    'reads the status of $slug from its metadata',
    (episode) => {
      // ARRANGE
      const expected = episode.status;
      // ACT
      const status = episodeStatus(episode.slug as Parameters<typeof episodeStatus>[0]);
      // ASSERT
      expect(status).toBe(expected);
    },
  );
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
      episode.status === 'published' && !isCalendarDate(episode.publishedOn) ? [episode.slug] : [],
    );
    // ASSERT
    expect(undated).toEqual(expected);
  });

  it('gives an upcoming Episode with no page a folder holding only its metadata', () => {
    // ARRANGE
    const registered: readonly string[] = EPISODE_SLUGS;
    const expected = listEpisodes()
      .filter(({ status, slug }) => status === 'upcoming' && !registered.includes(slug))
      .map(({ slug }) => [slug, [METADATA_FILE]]);
    // ACT
    const contents = expected.map(([slug]) => [slug, readdirSync(path.join(EPISODES_DIR, slug as string))]);
    // ASSERT
    expect(contents).toEqual(expected);
  });

  it('fails loudly for a registered slug no metadata lists, never defaulting to published', () => {
    // ARRANGE
    const unlisted = 'not-an-episode' as Parameters<typeof episodeStatus>[0];
    // ACT
    const read = () => episodeStatus(unlisted);
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
    const featured = FEATURED.map((slug) => [slug, listEpisodes().find((episode) => episode.slug === slug)?.status]);
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
