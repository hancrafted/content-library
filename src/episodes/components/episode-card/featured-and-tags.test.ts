import { hasPage } from '@/content-store/catalogue/record-routes';
import { FORMATS, TAG_IDS } from '@/content-store/schemas/fields';
import { TAG_ICONS } from '@/content-store/schemas/tag-looks';
import { featuredIds, listEpisodes } from '@/content-store/store';
import { FILTER_TAGS } from '@/episodes/components/episode-browser/episode-browser.pure';
import { leadTagOf } from '@/episodes/lib/episode-metadata.pure';
import { compositionOf } from '@/episodes/lib/registry';
import { NAMED_ICONS } from '@/shared/components/ui/named-icons';
import { describe, expect, it } from 'vitest';
import de from '../episode-browser/i18n/de.json';
import en from '../episode-browser/i18n/en.json';

/*
 * The Episode browser's central lists against the Episodes that exist (#40):
 * Featured names published Episodes, each Tag in the closed vocabulary (whose
 * use the content store refuses outside it) has an icon a card can draw, and every string a card
 * reads is translated; the Tags' own words are page assembly's (`src/page-assembly/lib/tag-words.test.ts`).
 */

const TRANSLATIONS = { en, de } as const;
const FEATURED = featuredIds();

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
      'onboard-ai-every-time: context-engineering hourglass',
      'ai-attention-span: context-engineering hourglass',
      'ai-gives-you-more-work: agentic-ai sparkles',
    ];
    // ACT
    const looks = FEATURED.map((slug) => {
      const episode = listEpisodes().find((e) => e.slug === slug);
      const lead = leadTagOf(episode!);
      return `${slug}: ${lead} ${TAG_ICONS[lead]}`;
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

  it('gives every Tag an icon a card can draw', () => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const undrawable = TAG_IDS.flatMap((tag) => {
      const icon: string = TAG_ICONS[tag];
      return icon in NAMED_ICONS ? [] : [`${tag}: icon ${icon}`];
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
    const { episodeBrowser } = TRANSLATIONS[locale];
    const upcomingCopy = episodeBrowser.upcoming as Record<string, { title?: string; caption?: string } | undefined>;
    const expected: string[] = [];
    // ACT
    const missing = [
      ...FORMATS.filter((id) => !episodeBrowser.formats[id]).map((id) => `formats.${id}`),
      ...listEpisodes().flatMap(({ ref, slug, status }) => {
        const copy = hasPage(ref) ? compositionOf(ref).messages[locale] : upcomingCopy[slug];
        return copy?.title && copy.caption ? [] : [`${status}.${slug}`];
      }),
    ];
    // ASSERT
    expect(missing).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('keeps site-wide upcoming copy only for Episodes with no page, so one with a page reads its own i18n', () => {
    // ARRANGE
    const expected = listEpisodes()
      .filter(({ ref, status }) => status === 'upcoming' && !hasPage(ref))
      .map(({ slug }) => slug)
      .sort();
    // ACT
    const keyed = Object.keys(en.episodeBrowser.upcoming).sort();
    // ASSERT
    expect(keyed).toEqual(expected);
  });
});
