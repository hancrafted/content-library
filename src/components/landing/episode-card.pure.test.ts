import type { EpisodeIndexEntry } from '@/lib/episode-index.pure';
import { describe, expect, it } from 'vitest';
import { episodeCard } from './episode-card.pure';

/** A stand-in for next-intl's `t`: answers each full key with a fixed sentence naming the key. */
const read = (key: string) => `[${key}]`;

const PUBLISHED: EpisodeIndexEntry = {
  slug: 'ai-token-economy',
  status: 'published',
  topic: 'economics',
  format: 'foundations',
  accent: 'amber',
  icon: 'coins',
  publishedOn: '2026-10-09',
  featuredRank: 3,
};

const UPCOMING: EpisodeIndexEntry = {
  slug: 'choosing-the-right-model',
  status: 'upcoming',
  topic: 'economics',
  format: 'short',
  accent: 'amber',
  icon: 'brain',
};

describe('success cases', () => {
  it('builds a published card that links to its Episode and reads its copy from the Episode catalog', () => {
    // ARRANGE
    const expected = {
      slug: 'ai-token-economy',
      route: '/episode/ai-token-economy',
      href: '/episode/ai-token-economy',
      status: 'published',
      title: '[episodes.ai-token-economy.title]',
      caption: '[episodes.ai-token-economy.caption]',
      topic: { id: 'economics', label: '[landing.episodeIndex.topics.economics]' },
      format: { id: 'foundations', label: '[landing.episodeIndex.formats.foundations]' },
      minutes: 42,
      publishedOn: '2026-10-09',
      featuredRank: 3,
      accent: 'amber',
      icon: 'coins',
    };
    // ACT
    const card = episodeCard(PUBLISHED, { locale: 'en', read, minutes: 42 });
    // ASSERT
    expect(card).toEqual(expected);
  });

  it('prefixes the link with the locale but leaves the route neutral, so a German card opens the German Episode', () => {
    // ARRANGE
    const expected = { route: '/episode/ai-token-economy', href: '/de/episode/ai-token-economy' };
    // ACT
    const { route, href } = episodeCard(PUBLISHED, { locale: 'de', read, minutes: 42 });
    // ASSERT
    expect({ route, href }).toEqual(expected);
  });

  it('builds an upcoming card with no link, reading its copy from the landing catalog', () => {
    // ARRANGE
    const expected = {
      slug: 'choosing-the-right-model',
      route: null,
      href: null,
      status: 'upcoming',
      title: '[landing.episodeIndex.upcoming.choosing-the-right-model.title]',
      caption: '[landing.episodeIndex.upcoming.choosing-the-right-model.caption]',
      topic: { id: 'economics', label: '[landing.episodeIndex.topics.economics]' },
      format: { id: 'short', label: '[landing.episodeIndex.formats.short]' },
      featuredRank: null,
      accent: 'amber',
      icon: 'brain',
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
    const message = 'MISSING_MESSAGE: episodes.ai-token-economy.title';
    // ACT
    const build = () => episodeCard(PUBLISHED, { locale: 'en', read: strict, minutes: 42 });
    // ASSERT
    expect(build).toThrow(message);
  });
});

describe('edge cases', () => {
  it('leaves minutes off a published card whose reading time is not known', () => {
    // ARRANGE
    const expectedKeys = ['accent', 'caption', 'featuredRank', 'format', 'href', 'icon'];
    const absent = 'minutes';
    // ACT
    const keys = Object.keys(episodeCard(PUBLISHED, { locale: 'en', read }));
    // ASSERT
    expect(keys).toEqual(expect.arrayContaining(expectedKeys));
    expect(keys).not.toContain(absent);
  });

  it('holds only values React can pass to a client component', () => {
    // ARRANGE
    const expected = JSON.parse(JSON.stringify(episodeCard(PUBLISHED, { locale: 'en', read, minutes: 42 })));
    // ACT
    const card = episodeCard(PUBLISHED, { locale: 'en', read, minutes: 42 });
    // ASSERT
    expect(card).toEqual(expected);
  });
});
