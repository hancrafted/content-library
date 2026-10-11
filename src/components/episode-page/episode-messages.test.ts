import { findEpisode } from '@/components/episodes/registry';
import { selfContainedEpisode } from '@/components/slide-master/slide';
import { pageMetadata } from '@/lib/page-metadata.pure';
import { EPISODE_SLUGS } from '@/lib/routes';
import { describe, expect, it } from 'vitest';
import { episodeMessagesOf } from './episode-messages';

/*
 * An Episode's own text, read through the registry (#51): from its folder's
 * Translation files once it is self-contained, from `episodes.<ep>` of the
 * site-wide file until then. The title slide, the page metadata and the
 * landing card all read it here.
 */

describe('success cases', () => {
  it.each(EPISODE_SLUGS)('gives %s a title, caption and description in en and de', (slug) => {
    // ARRANGE
    const record = findEpisode(slug);
    const expected = { title: expect.any(String), caption: expect.any(String), description: expect.any(String) };
    // ACT
    const texts = (['en', 'de'] as const).map((locale) => episodeMessagesOf(record, locale));
    // ASSERT
    expect(texts).toEqual([expected, expected]);
    expect(texts.flatMap(Object.values)).not.toContain('');
  });

  it.each(EPISODE_SLUGS)('produces page metadata for %s in en and de, canonical per locale', (slug) => {
    // ARRANGE
    const record = findEpisode(slug);
    const expectedCanonical = { en: `/episode/${slug}`, de: `/de/episode/${slug}` };
    // ACT
    const meta = (['en', 'de'] as const).map((locale) =>
      pageMetadata({ episode: slug }, locale, episodeMessagesOf(record, locale)),
    );
    // ASSERT
    expect({ en: meta[0].alternates?.canonical, de: meta[1].alternates?.canonical }).toEqual(expectedCanonical);
    expect(meta.map(({ title }) => title)).not.toContain('');
  });

  it("reads a self-contained Episode's text from its own folder, not the site-wide file", () => {
    // ARRANGE
    const expected = {
      title: 'Seitenvorlage',
      caption:
        'Die kleinste Episode, die sich zu kopieren lohnt: zwei Abschnitte, eine Folie mit Notizen und Sprechtext, eine nur mit Bild.',
      description:
        'Diese Episode kopieren, um eine neue zu beginnen: Abschnitte aus Folien, untereinander auf einer Seite.',
    };
    // ACT
    const text = episodeMessagesOf(findEpisode('page-template'), 'de');
    // ASSERT
    expect(text).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('hands over exactly the locale asked for, never falling back to English', () => {
    // ARRANGE
    const messages = {
      en: { title: 'Page template', caption: 'English caption.', description: 'English description.' },
      de: { title: 'Seitenvorlage', caption: 'Deutsche Bildunterschrift.', description: 'Deutsche Beschreibung.' },
    };
    const record = selfContainedEpisode({ slug: 'page-template', messages, sections: [] });
    const expected = messages.de;
    // ACT
    const text = episodeMessagesOf(record, 'de');
    // ASSERT
    expect(text).toEqual(expected);
  });
});

describe('edge cases', () => {
  it("reads an unlisted Episode's text from its own folder too", () => {
    // ARRANGE
    const expected = 'Slide layouts';
    // ACT
    const { title } = episodeMessagesOf(findEpisode('slide-layouts'), 'en');
    // ASSERT
    expect(title).toBe(expected);
  });
});
