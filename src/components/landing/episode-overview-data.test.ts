import { hasPage, listEpisodes } from '@/components/episodes/episode-repository';
import { findEpisode } from '@/components/episodes/registry';
import { lookOf } from '@/lib/episode-metadata.pure';
import { CONCEPT_THEMES, FEATURED, FORMATS, TOP_CONCEPT_IDS } from '@/lib/episode-overview';
import de from '@/messages/de.json';
import en from '@/messages/en.json';
import { describe, expect, it } from 'vitest';
import { THEME_ACCENTS, THEME_ICONS } from './episode-visuals';

/*
 * The Episode overview's central lists against the Episodes that exist (#40):
 * Featured names published Episodes, each top Concept's theme is a look the
 * landing can draw, and every string a card reads is translated, each top
 * Concept's name and tooltip included.
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

  it('gives each Featured Episode the look of the Concept it names in applyThemeFromConcept, with no Episode declaring one', () => {
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
      return `${slug}: ${episode!.applyThemeFromConcept} ${accent}/${icon}`;
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

  it('gives every top Concept a name and tooltip in both locales', () => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const missing = (['en', 'de'] as const).flatMap((locale) => {
      const concepts = TRANSLATIONS[locale].landing.episodeOverview.concepts as Record<
        string,
        { name?: string; tooltip?: string } | undefined
      >;
      return TOP_CONCEPT_IDS.filter((id) => !(concepts[id]?.name && concepts[id]?.tooltip)).map(
        (id) => `${locale}: ${id}`,
      );
    });
    // ASSERT
    expect(missing).toEqual(expected);
  });

  it('gives every top Concept an icon and an accent the landing can draw', () => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const undrawable = TOP_CONCEPT_IDS.flatMap((id) => {
      const { icon, accent } = CONCEPT_THEMES[id];
      return [
        ...(THEME_ICONS[icon] === undefined ? [`${id}: icon ${icon}`] : []),
        ...(THEME_ACCENTS[accent] === undefined ? [`${id}: accent ${accent}`] : []),
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
    const concepts = episodeOverview.concepts as Record<string, { name?: string; tooltip?: string } | undefined>;
    const upcomingCopy = episodeOverview.upcoming as Record<string, { title?: string; caption?: string } | undefined>;
    const expected: string[] = [];
    // ACT
    const missing = [
      ...FORMATS.filter((id) => !episodeOverview.formats[id]).map((id) => `formats.${id}`),
      ...TOP_CONCEPT_IDS.filter((id) => !(concepts[id]?.name && concepts[id]?.tooltip)).map((id) => `concepts.${id}`),
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
  it('keeps no Translation key for a Concept that is not a top Concept', () => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const stray = (['en', 'de'] as const).flatMap((locale) =>
      Object.keys(TRANSLATIONS[locale].landing.episodeOverview.concepts)
        .filter((id) => !(TOP_CONCEPT_IDS as readonly string[]).includes(id))
        .map((id) => `${locale}: ${id}`),
    );
    // ASSERT
    expect(stray).toEqual(expected);
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
