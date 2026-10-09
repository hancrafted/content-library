import { describe, expect, it } from 'vitest';
import de from '../messages/de.json';
import en from '../messages/en.json';
import raw from './episode-index.json';
import { FORMATS, parseEpisodeIndex, TOPICS, upcoming } from './episode-index.pure';
import { EPISODE_SLUGS } from './routes';

/*
 * The shipped index, checked as data: it must parse, cover every real Episode,
 * and have every string a card reads in every locale. `page-template` and
 * `slide-layouts` are layout references, not content, so they are left out on purpose.
 */
const TRANSLATIONS = { en, de };

describe('success cases', () => {
  it('parses the shipped index without throwing', () => {
    // ARRANGE
    const expectedCount = 9;
    // ACT
    const entries = parseEpisodeIndex(raw);
    // ASSERT
    expect(entries).toHaveLength(expectedCount);
  });

  it('lists every registered Episode but the layout references as published', () => {
    // ARRANGE
    const expected = ['ai-token-economy', 'amnesiac-freelancer', 'maintaining-markdown-for-ai'];
    const expectedUnlisted = ['page-template', 'slide-layouts'];
    // ACT
    const published = parseEpisodeIndex(raw)
      .filter(({ status }) => status === 'published')
      .map(({ slug }) => slug)
      .sort();
    const unlisted = EPISODE_SLUGS.filter((slug) => !published.includes(slug));
    // ASSERT
    expect(published).toEqual(expected);
    expect(unlisted).toEqual(expectedUnlisted);
  });

  it('spreads the upcoming Episodes over at least three topics', () => {
    // ARRANGE
    const minimumTopics = 3;
    // ACT
    const topics = new Set(upcoming(parseEpisodeIndex(raw)).map(({ topic }) => topic));
    // ASSERT
    expect(topics.size).toBeGreaterThanOrEqual(minimumTopics);
  });
});

describe('failure cases', () => {
  it.each(['en', 'de'] as const)('leaves no string a card reads untranslated in %s', (locale) => {
    // ARRANGE
    const { episodeIndex } = TRANSLATIONS[locale].landing;
    const entries = parseEpisodeIndex(raw);
    const expected: string[] = [];
    // ACT
    const missing = [
      ...TOPICS.filter((id) => !episodeIndex.topics[id]).map((id) => `topics.${id}`),
      ...FORMATS.filter((id) => !episodeIndex.formats[id]).map((id) => `formats.${id}`),
      ...upcoming(entries).flatMap(({ slug }) => {
        const copy = (episodeIndex.upcoming as Record<string, { title?: string; caption?: string } | undefined>)[slug];
        return [!copy?.title && `upcoming.${slug}.title`, !copy?.caption && `upcoming.${slug}.caption`].filter(Boolean);
      }),
      ...entries
        .filter(({ status }) => status === 'published')
        .flatMap(({ slug }) => {
          const copy = (TRANSLATIONS[locale].episodes as Record<string, { title?: string; caption?: string }>)[slug];
          return [!copy?.title && `episodes.${slug}.title`, !copy?.caption && `episodes.${slug}.caption`].filter(
            Boolean,
          );
        }),
    ];
    // ASSERT
    expect(missing).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('carries no key that could hold a title, caption or description', () => {
    // ARRANGE
    const forbidden = ['title', 'caption', 'description', 'label'];
    // ACT
    const keys = new Set((raw as Record<string, unknown>[]).flatMap((entry) => Object.keys(entry)));
    // ASSERT
    forbidden.forEach((key) => expect(keys.has(key)).toBe(false));
  });
});
