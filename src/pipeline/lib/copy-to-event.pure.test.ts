import { describe, expect, it } from 'vitest';
import { copyEntryId, insertPlaylistEntry, unlistedCopyMetadata } from './copy-to-event.pure.ts';

/*
 * `copy-to-event.ts`: what the copy of an Episode into an Event's Playlist changes in text.
 * Copying folders and running the registry is the script's job.
 */

const PLAYLIST = `export const playlist = {
  id: 'p',
  visibility: 'public',
  episodes: [
    'e__a',
    { episode: 'e__b', anchor: 'check-in-1' },
    'e__c',
  ],
} satisfies PlaylistInput;
`;

const UPCOMING = `export const episodeMetadata = {
  slug: 's',
  status: 'upcoming',
  visibility: 'public',
  format: 'foundations',
  tags: ['a'],
} as const satisfies EpisodeInput;
`;

describe('success cases', () => {
  describe('copyEntryId', () => {
    it('names the copy by its Event and slug', () => {
      // ARRANGE
      const event = '2026-11-16-x';
      // ACT
      const id = copyEntryId(event, 'intro');
      // ASSERT
      expect(id).toBe('2026-11-16-x__intro');
    });
  });

  describe('insertPlaylistEntry', () => {
    it('appends last when no position is given', () => {
      // ARRANGE
      const source = PLAYLIST;
      // ACT
      const out = insertPlaylistEntry(source, 'e__new');
      // ASSERT
      expect(out).toContain("    'e__c',\n    'e__new',\n  ],");
    });

    it('inserts before the nth entry, counting an object entry as one', () => {
      // ARRANGE
      const source = PLAYLIST;
      // ACT
      const out = insertPlaylistEntry(source, 'e__new', 2);
      // ASSERT
      expect(out).toContain("    'e__a',\n    'e__new',\n    { episode: 'e__b'");
    });
  });

  describe('unlistedCopyMetadata', () => {
    it('publishes it unlisted on the Event date, adding the date an upcoming original lacks', () => {
      // ARRANGE
      const source = UPCOMING;
      // ACT
      const out = unlistedCopyMetadata(source, '2026-11-16');
      // ASSERT
      expect(out).toContain("status: 'published'");
      expect(out).toContain("visibility: 'unlisted'");
      expect(out).toContain("publishedOn: '2026-11-16',\n} as const");
    });

    it('replaces the date of a published original', () => {
      // ARRANGE
      const published = UPCOMING.replace("'upcoming'", "'published'").replace(
        "tags: ['a'],",
        "tags: ['a'],\n  publishedOn: '2026-01-01',",
      );
      // ACT
      const out = unlistedCopyMetadata(published, '2026-11-16');
      // ASSERT
      expect(out.match(/publishedOn/g)).toHaveLength(1);
      expect(out).toContain("publishedOn: '2026-11-16'");
    });
  });
});

describe('failure cases', () => {
  it('refuses an Episode the Playlist already lists', () => {
    // ARRANGE
    const source = PLAYLIST;
    // ACT
    const insert = () => insertPlaylistEntry(source, 'e__a');
    // ASSERT
    expect(insert).toThrow(/already lists/);
  });

  it('refuses a position below 1', () => {
    // ARRANGE
    const source = PLAYLIST;
    // ACT
    const insert = () => insertPlaylistEntry(source, 'e__new', 0);
    // ASSERT
    expect(insert).toThrow(/position/);
  });
});

describe('edge cases', () => {
  it('appends when the position is past the end', () => {
    // ARRANGE
    const source = PLAYLIST;
    // ACT
    const out = insertPlaylistEntry(source, 'e__new', 9);
    // ASSERT
    expect(out).toBe(insertPlaylistEntry(source, 'e__new'));
  });
});
