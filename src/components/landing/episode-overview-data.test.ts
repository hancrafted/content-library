import { listEpisodes } from '@/components/episodes/episode-repository';
import { topicsOf } from '@/lib/episode-metadata.pure';
import { FEATURED, FORMATS, TOPIC_IDS, TOPICS } from '@/lib/episode-overview';
import de from '@/messages/de.json';
import en from '@/messages/en.json';
import { describe, expect, it } from 'vitest';
import { TOPIC_ACCENTS, TOPIC_ICONS } from './episode-visuals';

/*
 * The Episode overview's central lists against the Episodes that exist (#40):
 * Featured names published Episodes, each Topic in use has a look of its own,
 * and every string a card reads is translated.
 */

const TRANSLATIONS = { en, de } as const;

const topicsInUse = () => [...new Set(listEpisodes().flatMap(topicsOf))];

describe('success cases', () => {
  it('fills every Featured slot with a distinct published Episode', () => {
    // ARRANGE
    const published = listEpisodes()
      .filter(({ status }) => status === 'published')
      .map(({ slug }) => slug);
    const expectedSlots = 3;
    // ACT
    const distinct = new Set(FEATURED);
    // ASSERT
    expect(distinct.size).toBe(expectedSlots);
    FEATURED.forEach((slug) => expect(published).toContain(slug));
  });

  it.each(topicsInUse())('gives Topic %s an icon and an accent the landing can draw', (topic) => {
    // ARRANGE
    const { icon, accent } = TOPICS[topic];
    // ACT
    const drawn = { icon: TOPIC_ICONS[icon], accent: TOPIC_ACCENTS[accent] };
    // ASSERT
    expect(drawn.icon).toBeDefined();
    expect(drawn.accent).toBeDefined();
  });
});

describe('failure cases', () => {
  it.each(['en', 'de'] as const)('leaves no string a card reads untranslated in %s', (locale) => {
    // ARRANGE
    const { episodeOverview } = TRANSLATIONS[locale].landing;
    const upcomingCopy = episodeOverview.upcoming as Record<string, { title?: string; caption?: string } | undefined>;
    const episodes = TRANSLATIONS[locale].episodes as Record<string, { title?: string; caption?: string } | undefined>;
    const expected: string[] = [];
    // ACT
    const missing = [
      ...TOPIC_IDS.filter((id) => !episodeOverview.topics[id]).map((id) => `topics.${id}`),
      ...FORMATS.filter((id) => !episodeOverview.formats[id]).map((id) => `formats.${id}`),
      ...listEpisodes().flatMap(({ slug, status }) => {
        const copy = status === 'published' ? episodes[slug] : upcomingCopy[slug];
        return copy?.title && copy.caption ? [] : [`${status}.${slug}`];
      }),
    ];
    // ASSERT
    expect(missing).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('gives no two Topics the same look, so a Topic is recognisable at a glance', () => {
    // ARRANGE
    const expected = TOPIC_IDS.length;
    // ACT
    const looks = new Set(TOPIC_IDS.map((id) => `${TOPICS[id].icon}/${TOPICS[id].accent}`));
    // ASSERT
    expect(looks.size).toBe(expected);
  });

  it('keeps upcoming copy only for Episodes still upcoming, so a published one reads its own keys', () => {
    // ARRANGE
    const expected = listEpisodes()
      .filter(({ status }) => status === 'upcoming')
      .map(({ slug }) => slug)
      .sort();
    // ACT
    const keyed = Object.keys(en.landing.episodeOverview.upcoming).sort();
    // ASSERT
    expect(keyed).toEqual(expected);
  });
});
