import { findEpisode } from '@/components/episodes/registry';
import { episodeRefOf, matchEpisode } from '@/lib/episode-id.pure';
import { EPISODE_IDS, type EpisodeId } from '@/lib/routes';
import { pageMetadata } from '@/page-assembly/lib/page-metadata.pure';
import { describe, expect, it } from 'vitest';
import { episodePageCopy, episodesPathPageOf, eventEpisodePageOf, type EpisodePageRef } from './episode-page';

/*
 * The one Episode page template (FE-007 §1): every Episode is served where its folder puts it, an Event's copy under
 * its Event, the rest under `/episodes/`, and the tooling pages beside them; the template's copy function hands
 * `pageMetadata` each page's own words in both locales.
 */

/** The page an Episode is served at, resolved as its route binds it: from the URL's params. */
function servedPageOf(id: EpisodeId): EpisodePageRef {
  return matchEpisode<EpisodeId, EpisodePageRef>(episodeRefOf(id), {
    standalone: ({ slug }) => episodesPathPageOf(slug),
    'event-copy': ({ event, slug }) => eventEpisodePageOf(event, slug),
  });
}

describe('success cases', () => {
  it.each(EPISODE_IDS)('produces page metadata for %s in en and de where it is served, canonical per locale', (id) => {
    // ARRANGE
    const [event, slug] = id.includes('__') ? id.split('__') : [undefined, id];
    const path = event === undefined ? `/episodes/${slug}` : `/events/${event}/episodes/${slug}`;
    const expected = {
      canonical: { en: path, de: `/de${path}` },
      title: { en: findEpisode(id).messages.en.title, de: findEpisode(id).messages.de.title },
    };
    // ACT
    const page = servedPageOf(id);
    const [en, de] = (['en', 'de'] as const).map((locale) => pageMetadata(page, locale, episodePageCopy(page, locale)));
    // ASSERT
    expect({
      canonical: { en: en.alternates?.canonical, de: de.alternates?.canonical },
      title: { en: en.title, de: de.title },
    }).toEqual(expected);
  });

  it('serves a tooling page under /episodes/ with its own words, out of search', () => {
    // ARRANGE
    const expected = { kind: 'tooling', canonical: '/episodes/slide-master', robots: { index: false } };
    // ACT
    const page = episodesPathPageOf('slide-master');
    const metadata = pageMetadata(page, 'en', episodePageCopy(page, 'en'));
    // ASSERT
    expect({ kind: page.kind, canonical: metadata.alternates?.canonical, robots: metadata.robots }).toEqual(expected);
    expect(metadata.title).not.toBe('');
  });
});

describe('failure cases', () => {
  it('finds no page for a slug no Episode or tooling page has', () => {
    // ARRANGE
    const unknown = 'non-existent-episode';
    // ACT
    const resolve = () => episodesPathPageOf(unknown);
    // ASSERT
    expect(resolve).toThrow();
  });

  it("finds no page under an Event for an Episode its Playlist doesn't hold", () => {
    // ARRANGE
    const event = '2026-10-23-axel-agentic-workflow';
    // ACT
    const resolve = () => eventEpisodePageOf(event, 'maintaining-markdown-for-ai');
    // ASSERT
    expect(resolve).toThrow();
  });
});

describe('edge cases', () => {
  it("finds no page under /episodes/ for an Event's copy", () => {
    // ARRANGE
    const copy = EPISODE_IDS.find((id) => id.includes('__'));
    // ACT
    const resolve = () => episodesPathPageOf(copy ?? '');
    // ASSERT
    expect(copy).toBeDefined();
    expect(resolve).toThrow();
  });
});
