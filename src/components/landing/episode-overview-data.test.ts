import { hasPage, listEpisodes } from '@/components/episodes/episode-repository';
import { findEpisode } from '@/components/episodes/registry';
import { topicsOf } from '@/lib/episode-metadata.pure';
import { FEATURED, FORMATS, TOPIC_IDS, TOPICS } from '@/lib/episode-overview';
import de from '@/messages/de.json';
import en from '@/messages/en.json';
import { describe, expect, it } from 'vitest';
import { TOPIC_ACCENTS, TOPIC_ICONS } from './episode-visuals';

/*
 * The Episode overview's central lists against the Episodes that exist (#40):
 * Featured names published Episodes, each Topic in use has a look of its own,
 * and every string a card reads is translated, each Tag's name and tooltip included.
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

  it('lists Featured in workshop order', () => {
    // ARRANGE
    const expected = ['onboard-ai-every-time', 'ai-attention-span', 'ai-gives-you-more-work'];
    // ACT
    const featured = [...FEATURED];
    // ASSERT
    expect(featured).toEqual(expected);
  });

  it('gives each Featured Episode a look of its own, drawable by the landing', () => {
    // ARRANGE
    const expected = [
      'onboard-ai-every-time: amber/user-round-plus',
      'ai-attention-span: sky/hourglass',
      'ai-gives-you-more-work: rose/list-plus',
    ];
    // ACT
    const looks = FEATURED.map((slug) => {
      const look = listEpisodes().find((e) => e.slug === slug)?.look;
      const drawable = look?.icon !== undefined && TOPIC_ICONS[look.icon] !== undefined;
      return `${slug}: ${look?.accent}/${drawable ? look?.icon : 'undrawable'}`;
    });
    // ASSERT
    expect(looks).toEqual(expected);
  });

  it('gives the ai-enablement Topic the sparkles icon', () => {
    // ARRANGE
    const expected = 'sparkles';
    // ACT
    const { icon } = TOPICS['ai-enablement'];
    // ASSERT
    expect(icon).toBe(expected);
  });

  it('gives the delegation Tag a name and tooltip in both locales', () => {
    // ARRANGE
    const expected = [true, true, true, true];
    // ACT
    const present = (['en', 'de'] as const).flatMap((locale) => {
      const tag = (
        TRANSLATIONS[locale].landing.episodeOverview.tags as Record<string, { name?: string; tooltip?: string }>
      ).delegation;
      return [Boolean(tag?.name), Boolean(tag?.tooltip)];
    });
    // ASSERT
    expect(present).toEqual(expected);
  });

  it('gives every Topic in use an icon and an accent the landing can draw', () => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const undrawable = topicsInUse().flatMap((topic) => {
      const { icon, accent } = TOPICS[topic];
      return [
        ...(TOPIC_ICONS[icon] === undefined ? [`${topic}: icon ${icon}`] : []),
        ...(TOPIC_ACCENTS[accent] === undefined ? [`${topic}: accent ${accent}`] : []),
      ];
    });
    // ASSERT
    expect(undrawable).toEqual(expected);
  });
});

describe('failure cases', () => {
  it.each(['en', 'de'] as const)('leaves no string a card reads untranslated in %s', (locale) => {
    // ARRANGE
    const { episodeOverview } = TRANSLATIONS[locale].landing;
    const tags = episodeOverview.tags as Record<string, { name?: string; tooltip?: string } | undefined>;
    const upcomingCopy = episodeOverview.upcoming as Record<string, { title?: string; caption?: string } | undefined>;
    const expected: string[] = [];
    // ACT
    const missing = [
      ...TOPIC_IDS.filter((id) => !episodeOverview.topics[id]).map((id) => `topics.${id}`),
      ...FORMATS.filter((id) => !episodeOverview.formats[id]).map((id) => `formats.${id}`),
      ...[...new Set(listEpisodes().flatMap(({ tags: ids }) => ids))]
        .filter((id) => !(tags[id]?.name && tags[id]?.tooltip))
        .map((id) => `tags.${id}`),
      ...listEpisodes().flatMap(({ slug, status }) => {
        const copy = hasPage(slug) ? findEpisode(slug).messages[locale] : upcomingCopy[slug];
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

  it('keeps site-wide upcoming copy only for Episodes with no page, so one with a page reads its own i18n', () => {
    // ARRANGE
    const expected = listEpisodes()
      .filter(({ slug, status }) => status === 'upcoming' && !hasPage(slug))
      .map(({ slug }) => slug)
      .sort();
    // ACT
    const keyed = Object.keys(en.landing.episodeOverview.upcoming).sort();
    // ASSERT
    expect(keyed).toEqual(expected);
  });
});
