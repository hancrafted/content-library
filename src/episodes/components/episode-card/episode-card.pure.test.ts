import { episodeRef, type EpisodeRef } from '@/content-store/catalogue/episode-id.pure';
import type { PublishedEpisode, UpcomingEpisode } from '@/content-store/schemas/episode.schema';
import { describe, expect, it } from 'vitest';
import { episodeCard } from './episode-card.pure';

/** A stand-in for next-intl's `t`: answers each full key with a fixed sentence naming the key. */
const read = (key: string) => `[${key}]`;

/** A published Episode's copy, as the registry reads it from the Episode's record. */
const COPY = { title: 'Your AI token economy', caption: 'Hidden managing responsibilities.' };

const PUBLISHED_METADATA: PublishedEpisode & { readonly ref: EpisodeRef } = {
  ref: episodeRef('ai-token-economy'),
  slug: 'ai-token-economy',
  status: 'published',
  visibility: 'public',
  format: 'foundations',
  tags: ['cost'],
  publishedOn: '2026-10-09',
};

/** The published Episode as the card reads it: its metadata with its copy from the registry. */
const PUBLISHED = { ...PUBLISHED_METADATA, copy: COPY };

const UPCOMING: UpcomingEpisode & { readonly ref: EpisodeRef } = {
  ref: episodeRef('choosing-the-right-model'),
  slug: 'choosing-the-right-model',
  status: 'upcoming',
  visibility: 'public',
  format: 'short',
  tags: ['cost', 'sales'],
};

describe('success cases', () => {
  it('builds a published card that links to its Episode, takes its copy from its record and its look from its lead Tag', () => {
    // ARRANGE
    const expected = {
      slug: 'ai-token-economy',
      route: '/episodes/ai-token-economy',
      href: '/episodes/ai-token-economy',
      status: 'published',
      title: 'Your AI token economy',
      caption: 'Hidden managing responsibilities.',
      leadTag: { id: 'cost', label: '[tags.cost.name]' },
      format: { id: 'foundations', label: '[episodeBrowser.formats.foundations]' },
      tags: [
        {
          id: 'cost',
          label: '[tags.cost.name]',
          tooltip: '[tags.cost.tooltip]',
        },
      ],
      minutes: 42,
      publishedOn: '2026-10-09',
      releaseDate: 'Oct 9, 2026',
      featuredRank: 3,
    };
    // ACT
    const card = episodeCard(PUBLISHED, { locale: 'en', read, minutes: 42, featuredRank: 3 });
    // ASSERT
    expect(card).toEqual(expected);
  });

  it('leads with its first Tag, whatever Tags follow it, which gives the card its look', () => {
    // ARRANGE
    const entry = { ...PUBLISHED, tags: ['markdown', 'cost'] } as const;
    const expected = { id: 'markdown', label: '[tags.markdown.name]' };
    // ACT
    const { leadTag } = episodeCard(entry, { locale: 'en', read });
    // ASSERT
    expect(leadTag).toEqual(expected);
  });

  it('prefixes the link with the locale but leaves the route neutral, so a German card opens the German Episode', () => {
    // ARRANGE
    const expected = { route: '/episodes/ai-token-economy', href: '/de/episodes/ai-token-economy' };
    // ACT
    const { route, href } = episodeCard(PUBLISHED, { locale: 'de', read, minutes: 42 });
    // ASSERT
    expect({ route, href }).toEqual(expected);
  });

  it('builds an upcoming card with no link, reading its copy from the Episode browser Translation keys', () => {
    // ARRANGE
    const expected = {
      slug: 'choosing-the-right-model',
      route: null,
      href: null,
      status: 'upcoming',
      title: '[episodeBrowser.upcoming.choosing-the-right-model.title]',
      caption: '[episodeBrowser.upcoming.choosing-the-right-model.caption]',
      leadTag: { id: 'cost', label: '[tags.cost.name]' },
      format: { id: 'short', label: '[episodeBrowser.formats.short]' },
      tags: [
        {
          id: 'cost',
          label: '[tags.cost.name]',
          tooltip: '[tags.cost.tooltip]',
        },
        {
          id: 'sales',
          label: '[tags.sales.name]',
          tooltip: '[tags.sales.tooltip]',
        },
      ],
      featuredRank: null,
    };
    // ACT
    const card = episodeCard(UPCOMING, { locale: 'en', read });
    // ASSERT
    expect(card).toEqual(expected);
  });

  it("labels each Tag with its name and tooltip in the reader's locale, in the order the Episode lists them", () => {
    // ARRANGE
    const entry = { ...PUBLISHED, tags: ['cost', 'workflow'] } as const;
    const expected = [
      {
        id: 'cost',
        label: '[tags.cost.name]',
        tooltip: '[tags.cost.tooltip]',
      },
      {
        id: 'workflow',
        label: '[tags.workflow.name]',
        tooltip: '[tags.workflow.tooltip]',
      },
    ];
    // ACT
    const { tags } = episodeCard(entry, { locale: 'en', read });
    // ASSERT
    expect(tags).toEqual(expected);
  });

  it("names a published card's release date in the reader's locale", () => {
    // ARRANGE
    const expected = '9. Okt. 2026';
    // ACT
    const { releaseDate } = episodeCard(PUBLISHED, { locale: 'de', read });
    // ASSERT
    expect(releaseDate).toBe(expected);
  });

  it("links a published card to its video in the reader's locale when the Episode has one", () => {
    // ARRANGE
    const expected = 'https://www.youtube.com/watch?v=S0Nx4faEebY';
    // ACT
    const { youtubeUrl } = episodeCard(PUBLISHED, { locale: 'de', read, youtubeId: 'S0Nx4faEebY' });
    // ASSERT
    expect(youtubeUrl).toBe(expected);
  });

  it("draws an unlinked upcoming card from the Episode's own copy, not the landing Translation keys", () => {
    // ARRANGE
    const entry = { ...UPCOMING, copy: COPY };
    const expected = { route: null, href: null, status: 'upcoming', title: COPY.title, caption: COPY.caption };
    // ACT
    const { route, href, status, title, caption } = episodeCard(entry, { locale: 'en', read, featuredRank: 1 });
    // ASSERT
    expect({ route, href, status, title, caption }).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('lets a missing translation throw, so an untranslated card fails the build instead of shipping', () => {
    // ARRANGE
    const strict = (key: string): string => {
      throw new Error(`MISSING_MESSAGE: ${key}`);
    };
    const message = 'MISSING_MESSAGE: episodeBrowser.upcoming.choosing-the-right-model.title';
    // ACT
    const build = () => episodeCard(UPCOMING, { locale: 'en', read: strict });
    // ASSERT
    expect(build).toThrow(message);
  });

  it('rejects at compile time a published card without the copy its record holds, so it never reads a stale key', () => {
    // ARRANGE
    // @ts-expect-error -- a published Episode's card needs its copy from the registry
    const build = () => episodeCard(PUBLISHED_METADATA, { locale: 'en', read, minutes: 42 });
    // ACT
    const built = typeof build;
    // ASSERT
    expect(built).toBe('function');
  });

  it('never links an upcoming card to a video, as it has no public page yet', () => {
    // ARRANGE
    const absent = 'youtubeUrl';
    // ACT
    const keys = Object.keys(episodeCard(UPCOMING, { locale: 'en', read, youtubeId: 'S0Nx4faEebY' }));
    // ASSERT
    expect(keys).not.toContain(absent);
  });

  it('never ranks an upcoming card as Featured', () => {
    // ARRANGE
    const expected = null;
    // ACT
    const { featuredRank } = episodeCard(UPCOMING, { locale: 'en', read, featuredRank: 1 });
    // ASSERT
    expect(featuredRank).toBe(expected);
  });
});

describe('edge cases', () => {
  it('leaves minutes off a published card whose reading time is not known, and ranks a card outside Featured as null', () => {
    // ARRANGE
    const expectedKeys = ['caption', 'featuredRank', 'format', 'href', 'leadTag'];
    const absent = 'minutes';
    // ACT
    const card = episodeCard(PUBLISHED, { locale: 'en', read });
    const keys = Object.keys(card);
    // ASSERT
    expect(keys).toEqual(expect.arrayContaining(expectedKeys));
    expect(keys).not.toContain(absent);
    expect(card.featuredRank).toBeNull();
  });

  it('names the calendar day as written on New Year, never shifted a day by the time zone', () => {
    // ARRANGE
    const entry = { ...PUBLISHED, publishedOn: '2027-01-01' as const };
    const expected = 'Jan 1, 2027';
    // ACT
    const { releaseDate } = episodeCard(entry, { locale: 'en', read });
    // ASSERT
    expect(releaseDate).toBe(expected);
  });

  it('gives an upcoming card no release date', () => {
    // ARRANGE
    const absent = 'releaseDate';
    // ACT
    const keys = Object.keys(episodeCard(UPCOMING, { locale: 'en', read }));
    // ASSERT
    expect(keys).not.toContain(absent);
  });

  it('leaves the video link off a card whose Episode has no video', () => {
    // ARRANGE
    const absent = 'youtubeUrl';
    // ACT
    const keys = Object.keys(episodeCard(PUBLISHED, { locale: 'en', read }));
    // ASSERT
    expect(keys).not.toContain(absent);
  });

  it('holds only values React can pass to a client component', () => {
    // ARRANGE
    const expected = JSON.parse(JSON.stringify(episodeCard(UPCOMING, { locale: 'en', read, minutes: 42 })));
    // ACT
    const card = episodeCard(UPCOMING, { locale: 'en', read, minutes: 42 });
    // ASSERT
    expect(card).toEqual(expected);
  });
});
