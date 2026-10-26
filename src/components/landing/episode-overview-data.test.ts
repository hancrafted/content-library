import { findEpisode } from '@/components/episodes/registry';
import { FORMATS, TAG_IDS } from '@/content-store/schemas/fields';
import { listEpisodes } from '@/content-store/store';
import { leadTagOf, lookOf } from '@/lib/episode-metadata.pure';
import { FEATURED, FILTER_TAGS, TAGS } from '@/lib/episode-overview';
import { isEpisodeId } from '@/lib/routes';
import de from '@/messages/de.json';
import en from '@/messages/en.json';
import { describe, expect, it } from 'vitest';
import { TAG_ACCENTS, TAG_ICONS } from './episode-visuals';

/*
 * The Episode overview's central lists against the Episodes that exist (#40):
 * Featured names published Episodes, each Tag in the closed vocabulary (whose
 * use the content store refuses outside it) has a look the landing can draw, and every string a card
 * reads is translated, each Tag's name and tooltip included.
 */

const TRANSLATIONS = { en, de } as const;

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

  it('gives each Featured Episode the look of its lead Tag, with no Episode declaring one', () => {
    // ARRANGE
    const expected = [
      'onboard-ai-every-time: context-engineering sky/hourglass',
      'ai-attention-span: context-engineering sky/hourglass',
      'ai-gives-you-more-work: agentic-ai violet/sparkles',
    ];
    // ACT
    const looks = FEATURED.map((slug) => {
      const episode = listEpisodes().find((e) => e.slug === slug);
      const { accent, icon } = lookOf(episode!);
      return `${slug}: ${leadTagOf(episode!)} ${accent}/${icon}`;
    });
    // ASSERT
    expect(looks).toEqual(expected);
  });

  it('keeps Topic, extra Topics and the per-Episode look out of every Episode record', () => {
    // ARRANGE
    const removed = ['topic', 'extraTopics', 'look'];
    const expected: string[] = [];
    // ACT
    const declared = listEpisodes().flatMap((episode) =>
      removed.filter((key) => key in episode).map((key) => `${episode.slug}: ${key}`),
    );
    // ASSERT
    expect(declared).toEqual(expected);
  });

  it('gives every Tag in the vocabulary a name and tooltip in both locales', () => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const missing = (['en', 'de'] as const).flatMap((locale) => {
      const tags = TRANSLATIONS[locale].landing.episodeOverview.tags as Record<
        string,
        { name?: string; tooltip?: string } | undefined
      >;
      return TAG_IDS.filter((id) => !(tags[id]?.name && tags[id]?.tooltip)).map((id) => `${locale}: ${id}`);
    });
    // ASSERT
    expect(missing).toEqual(expected);
  });

  it('gives every Tag an icon and an accent the landing can draw', () => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const undrawable = TAG_IDS.flatMap((tag) => {
      const { icon, accent } = TAGS[tag];
      return [
        ...(TAG_ICONS[icon] === undefined ? [`${tag}: icon ${icon}`] : []),
        ...(TAG_ACCENTS[accent] === undefined ? [`${tag}: accent ${accent}`] : []),
      ];
    });
    // ASSERT
    expect(undrawable).toEqual(expected);
  });

  it('offers only vocabulary Tags as filter chips', () => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const stray = FILTER_TAGS.filter((id) => !TAG_IDS.includes(id));
    // ASSERT
    expect(stray).toEqual(expected);
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
      ...FORMATS.filter((id) => !episodeOverview.formats[id]).map((id) => `formats.${id}`),
      ...TAG_IDS.filter((id) => !(tags[id]?.name && tags[id]?.tooltip)).map((id) => `tags.${id}`),
      ...listEpisodes().flatMap(({ id, slug, status }) => {
        const copy = isEpisodeId(id) ? findEpisode(id).messages[locale] : upcomingCopy[slug];
        return copy?.title && copy.caption ? [] : [`${status}.${slug}`];
      }),
    ];
    // ASSERT
    expect(missing).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('keeps no Translation key for a Tag outside the vocabulary', () => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const stray = (['en', 'de'] as const).flatMap((locale) =>
      Object.keys(TRANSLATIONS[locale].landing.episodeOverview.tags)
        .filter((id) => !(TAG_IDS as readonly string[]).includes(id))
        .map((id) => `${locale}: ${id}`),
    );
    // ASSERT
    expect(stray).toEqual(expected);
  });

  it('keeps site-wide upcoming copy only for Episodes with no page, so one with a page reads its own i18n', () => {
    // ARRANGE
    const expected = listEpisodes()
      .filter(({ id, status }) => status === 'upcoming' && !isEpisodeId(id))
      .map(({ slug }) => slug)
      .sort();
    // ACT
    const keyed = Object.keys(en.landing.episodeOverview.upcoming).sort();
    // ASSERT
    expect(keyed).toEqual(expected);
  });
});
