import { LAYOUT_REFERENCES } from '@/lib/episode-overview';
import { EPISODE_SLUGS } from '@/lib/routes';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { listEpisodes } from './episode-repository';

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

  it('lists every registered Episode but the layout references as published', () => {
    // ARRANGE
    const expected = EPISODE_SLUGS.filter((slug) => !(LAYOUT_REFERENCES as readonly string[]).includes(slug)).sort();
    // ACT
    const published = listEpisodes()
      .filter(({ status }) => status === 'published')
      .map(({ slug }) => slug)
      .sort();
    // ASSERT
    expect(published).toEqual(expected);
  });

  it.each(listEpisodes().map(({ slug }) => slug))('keeps the metadata of %s in its own folder', (slug) => {
    // ARRANGE
    const folder = path.join(EPISODES_DIR, slug);
    // ACT
    const files = existsSync(folder) ? readdirSync(folder) : [];
    // ASSERT
    expect(files).toContain(METADATA_FILE);
  });
});

describe('failure cases', () => {
  it('holds no upcoming Episode whose slug is registered or not kebab-case', () => {
    // ARRANGE
    const registered: readonly string[] = EPISODE_SLUGS;
    const expected: string[] = [];
    // ACT
    const wrong = listEpisodes()
      .filter(({ status, slug }) => status === 'upcoming' && (registered.includes(slug) || !KEBAB_CASE.test(slug)))
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

  it('gives an upcoming Episode a folder holding only its metadata, so it has no page', () => {
    // ARRANGE
    const expected = listEpisodes()
      .filter(({ status }) => status === 'upcoming')
      .map(({ slug }) => [slug, [METADATA_FILE]]);
    // ACT
    const contents = expected.map(([slug]) => [slug, readdirSync(path.join(EPISODES_DIR, slug as string))]);
    // ASSERT
    expect(contents).toEqual(expected);
  });
});

describe('edge cases', () => {
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
