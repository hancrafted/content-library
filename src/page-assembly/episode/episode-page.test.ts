import { matchEpisode, type EpisodeRef } from '@/content-store/catalogue/episode-id.pure';
import { hasPage, type EpisodeId } from '@/content-store/catalogue/record-routes';
import { listEpisodes } from '@/content-store/store';
import { pageMetadata } from '@/page-assembly/lib/page-metadata.pure';
import { notFound } from 'next/navigation';
import { describe, expect, it } from 'vitest';
import { episodePageCopy, episodesPathPageOf, eventEpisodePageOf, type EpisodePageRef } from './episode-page';

/*
 * The one Episode page template (FE-007 §1): every Episode is served where its folder puts it, an Event's copy under
 * its Event, the rest under `/episodes/`; the template's copy function hands
 * `pageMetadata` each page's own words in both locales. Which params name a page, and which name none (the 404), is
 * the page catalogue's, tested there.
 */

/** Every Episode with a page, by the EpisodeRef the store serves it with. */
const EPISODES: readonly EpisodeRef<EpisodeId>[] = listEpisodes().flatMap(({ ref }) => (hasPage(ref) ? [ref] : []));

/** The page an Episode is served at, resolved as its route binds it: from the URL's params. */
function servedPageOf(episode: EpisodeRef<EpisodeId>): EpisodePageRef {
  return matchEpisode<EpisodeId, EpisodePageRef>(episode, {
    standalone: ({ slug }) => episodesPathPageOf({ episode: slug }),
    'event-copy': ({ event, slug }) => eventEpisodePageOf({ event, episode: slug }),
  });
}

/** The logical path an Episode is served at: under `/episodes/`, or an Event's copy under its Event. */
function servedPathOf(episode: EpisodeRef<EpisodeId>): string {
  return matchEpisode(episode, {
    standalone: ({ slug }) => `/episodes/${slug}`,
    'event-copy': ({ event, slug }) => `/events/${event}/episodes/${slug}`,
  });
}

/** What Next's own `notFound()` throws: the 404 a page answers with. */
function notFoundError(): Error {
  try {
    notFound();
  } catch (error) {
    return error as Error;
  }
  throw new Error('notFound() returned');
}

describe('success cases', () => {
  it.each(EPISODES)(
    'produces page metadata for $id in en and de where it is served, canonical per locale',
    (episode) => {
      // ARRANGE
      const path = servedPathOf(episode);
      const expectedCanonical = { en: path, de: `/de${path}` };
      // ACT
      const page = servedPageOf(episode);
      const [en, de] = (['en', 'de'] as const).map((locale) =>
        pageMetadata(page, locale, episodePageCopy(page, locale)),
      );
      // ASSERT
      expect({ en: en.alternates?.canonical, de: de.alternates?.canonical }).toEqual(expectedCanonical);
      expect([en.title, de.title]).not.toContain('');
    },
  );

  it("titles an Event's copy with its own words, under its Event", () => {
    // ARRANGE
    const expected = {
      title: 'Warum KI eine seltsame Aufmerksamkeitsspanne hat, die Du managen lernen musst',
      canonical: '/de/events/2026-10-23-axel-agentic-workflow/episodes/ai-attention-span',
    };
    // ACT
    const page = eventEpisodePageOf({ event: '2026-10-23-axel-agentic-workflow', episode: 'ai-attention-span' });
    const metadata = pageMetadata(page, 'de', episodePageCopy(page, 'de'));
    // ASSERT
    expect({ title: metadata.title, canonical: metadata.alternates?.canonical }).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('answers with the 404 where the page catalogue builds no page, under /episodes/ and under an Event', () => {
    // ARRANGE
    const expected = notFoundError();
    // ACT
    const underEpisodes = () => episodesPathPageOf({ episode: 'no-such-episode' });
    const underEvent = () => eventEpisodePageOf({ event: 'no-such-event', episode: 'ai-attention-span' });
    // ASSERT
    expect(underEpisodes).toThrow(expected);
    expect(underEvent).toThrow(expected);
  });
});

describe('edge cases', () => {
  it('builds no page under /episodes/ for a Template slug, which lives under its type', () => {
    // ARRANGE
    const expected = notFoundError();
    // ACT
    const lookup = () => episodesPathPageOf({ episode: 'timelines' });
    // ASSERT
    expect(lookup).toThrow(expected);
  });
});
