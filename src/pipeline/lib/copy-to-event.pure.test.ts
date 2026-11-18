import { describe, expect, it } from 'vitest';
import {
  baseExportName,
  copyEntryId,
  insertPlaylistEntry,
  instanceEpisodeSource,
  instanceExportName,
  instanceMetadata,
} from './copy-to-event.pure.ts';

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

  describe('instanceExportName', () => {
    it('names the record by the whole Event name after its date and the Episode slug', () => {
      // ARRANGE
      const event = '2026-10-28-cyberforum-akademie-intro-agentic-workflow';
      // ACT
      const name = instanceExportName(event, 'ai-attention-span');
      // ASSERT
      expect(name).toBe('cyberforumAkademieIntroAgenticWorkflowAiAttentionSpan');
    });

    it('gives two Events sharing a first word the same Episode, two names', () => {
      // ARRANGE
      const events = [
        '2026-10-28-cyberforum-akademie-intro-agentic-workflow',
        '2026-11-18-cyberforum-exi-digital-agentic-workflows',
      ];
      // ACT
      const names = events.map((event) => instanceExportName(event, 'ai-attention-span'));
      // ASSERT
      expect(new Set(names).size).toBe(events.length);
    });
  });

  describe('instanceEpisodeSource', () => {
    it('composes the Base Episode through the alias with no override', () => {
      // ARRANGE
      const base = { slug: 'ai-attention-span', exportName: 'aiAttentionSpan' };
      // ACT
      const out = instanceEpisodeSource(base, 'axelAiAttentionSpan');
      // ASSERT
      expect(out).toContain("import { aiAttentionSpan } from '@/episodes/ai-attention-span/episode';");
      expect(out).toContain("import { instanceOf } from '@/episodes/lib/episode-instance';");
      expect(out).toContain('export const axelAiAttentionSpan = instanceOf(aiAttentionSpan, {});');
    });
  });

  describe('baseExportName', () => {
    it('reads the one exported Episode record', () => {
      // ARRANGE
      const source = "export const aiAttentionSpan = episode({\n  slug: 'x',\n});\n";
      // ACT
      const name = baseExportName(source);
      // ASSERT
      expect(name).toBe('aiAttentionSpan');
    });
  });

  describe('instanceMetadata', () => {
    it('drops the original public Video, which an unlisted Episode may not carry', () => {
      // ARRANGE
      const source = UPCOMING.replace(
        "tags: ['a'],",
        "tags: ['a'],\n  youtube: { en: 'abcdefghijk', de: 'abcdefghijk' },",
      );
      // ACT
      const out = instanceMetadata(source, '2026-11-16');
      // ASSERT
      expect(out).not.toContain('youtube');
    });

    it('publishes it unlisted on the Event date, adding the date an upcoming original lacks', () => {
      // ARRANGE
      const source = UPCOMING;
      // ACT
      const out = instanceMetadata(source, '2026-11-16');
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
      const out = instanceMetadata(published, '2026-11-16');
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
  it('refuses a source with no exported Episode record', () => {
    // ARRANGE
    const source = 'export const x = 1;\n';
    // ACT
    const read = () => baseExportName(source);
    // ASSERT
    expect(read).toThrow(/Episode record/);
  });

  it('appends when the position is past the end', () => {
    // ARRANGE
    const source = PLAYLIST;
    // ACT
    const out = insertPlaylistEntry(source, 'e__new', 9);
    // ASSERT
    expect(out).toBe(insertPlaylistEntry(source, 'e__new'));
  });
});
