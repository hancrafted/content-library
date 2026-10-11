import type { EpisodeMetadata } from '@/lib/episode-metadata.pure';
import { describe, expect, it } from 'vitest';
import { episodeCard } from './episode-card.pure';

/** A stand-in for next-intl's `t`: answers each full key with a fixed sentence naming the key. */
const read = (key: string) => `[${key}]`;

/** A published Episode's copy, as the registry reads it from the Episode's record. */
const COPY = { title: 'Your AI token economy', caption: 'Hidden managing responsibilities.' };

const PUBLISHED: EpisodeMetadata = {
  slug: 'ai-token-economy',
  status: 'published',
  topic: 'economics',
  format: 'foundations',
  tags: ['tokens'],
  publishedOn: '2026-10-09',
};

const UPCOMING: EpisodeMetadata = {
  slug: 'choosing-the-right-model',
  status: 'upcoming',
  topic: 'economics',
  extraTopics: ['ai-collaboration'],
  format: 'short',
  tags: [],
};

describe('success cases', () => {
  it('builds a published card that links to its Episode, takes its copy from its record and its Topic look', () => {
    // ARRANGE
    const expected = {
      slug: 'ai-token-economy',
      route: '/episode/ai-token-economy',
      href: '/episode/ai-token-economy',
      status: 'published',
      title: 'Your AI token economy',
      caption: 'Hidden managing responsibilities.',
      topic: { id: 'economics', label: '[landing.episodeOverview.topics.economics]' },
      topics: [{ id: 'economics', label: '[landing.episodeOverview.topics.economics]' }],
      format: { id: 'foundations', label: '[landing.episodeOverview.formats.foundations]' },
      minutes: 42,
      publishedOn: '2026-10-09',
      featuredRank: 3,
      accent: 'amber',
      icon: 'coins',
    };
    // ACT
    const card = episodeCard(PUBLISHED, { locale: 'en', read, copy: COPY, minutes: 42, featuredRank: 3 });
    // ASSERT
    expect(card).toEqual(expected);
  });

  it('prefixes the link with the locale but leaves the route neutral, so a German card opens the German Episode', () => {
    // ARRANGE
    const expected = { route: '/episode/ai-token-economy', href: '/de/episode/ai-token-economy' };
    // ACT
    const { route, href } = episodeCard(PUBLISHED, { locale: 'de', read, copy: COPY, minutes: 42 });
    // ASSERT
    expect({ route, href }).toEqual(expected);
  });

  it('builds an upcoming card with no link, reading its copy from the landing Translation keys and listing every Topic it appears under', () => {
    // ARRANGE
    const expected = {
      slug: 'choosing-the-right-model',
      route: null,
      href: null,
      status: 'upcoming',
      title: '[landing.episodeOverview.upcoming.choosing-the-right-model.title]',
      caption: '[landing.episodeOverview.upcoming.choosing-the-right-model.caption]',
      topic: { id: 'economics', label: '[landing.episodeOverview.topics.economics]' },
      topics: [
        { id: 'economics', label: '[landing.episodeOverview.topics.economics]' },
        { id: 'ai-collaboration', label: '[landing.episodeOverview.topics.ai-collaboration]' },
      ],
      format: { id: 'short', label: '[landing.episodeOverview.formats.short]' },
      featuredRank: null,
      accent: 'amber',
      icon: 'coins',
    };
    // ACT
    const card = episodeCard(UPCOMING, { locale: 'en', read });
    // ASSERT
    expect(card).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('lets a missing translation throw, so an untranslated card fails the build instead of shipping', () => {
    // ARRANGE
    const strict = (key: string): string => {
      throw new Error(`MISSING_MESSAGE: ${key}`);
    };
    const message = 'MISSING_MESSAGE: landing.episodeOverview.upcoming.choosing-the-right-model.title';
    // ACT
    const build = () => episodeCard(UPCOMING, { locale: 'en', read: strict });
    // ASSERT
    expect(build).toThrow(message);
  });

  it('refuses a published card without the copy its record holds, so it never reads a stale key', () => {
    // ARRANGE
    const expected = 'ai-token-economy';
    // ACT
    const build = () => episodeCard(PUBLISHED, { locale: 'en', read, minutes: 42 });
    // ASSERT
    expect(build).toThrow(expected);
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
    const expectedKeys = ['accent', 'caption', 'featuredRank', 'format', 'href', 'icon'];
    const absent = 'minutes';
    // ACT
    const card = episodeCard(PUBLISHED, { locale: 'en', read, copy: COPY });
    const keys = Object.keys(card);
    // ASSERT
    expect(keys).toEqual(expect.arrayContaining(expectedKeys));
    expect(keys).not.toContain(absent);
    expect(card.featuredRank).toBeNull();
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
