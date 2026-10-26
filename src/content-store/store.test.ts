import { overviewOrder } from '@/lib/episode-metadata.pure';
import { EVENT_SLUGS, type PageRef } from '@/lib/routes';
import { pageTreatment } from '@/lib/visibility.pure';
import { describe, expect, it } from 'vitest';
import {
  episodeVideo,
  findEvent,
  listedEventsIn,
  listEpisodes,
  listEvents,
  loadContent,
  pageFactsIn,
  playlistOf,
} from './store';

/*
 * The content store's refusals (FE-013 Decision 3, design-ADR 0016): every record is parsed whole or the load
 * throws a sentence naming its kind, slug and field. Fixtures are raw records, as a record file would hold them.
 */

const EPISODE = {
  slug: 'alpha',
  status: 'published',
  visibility: 'public',
  format: 'foundations',
  tags: ['workflow'],
  publishedOn: '2026-10-20',
} as const;
const UNLISTED = { ...EPISODE, slug: 'alpha-at-axel', visibility: 'unlisted' } as const;
const PLAYLIST = { id: 'axel', visibility: 'public', episodes: ['alpha'] } as const;
const EVENT = {
  slug: '2026-10-23-axel',
  date: '2026-10-23',
  kind: 'workshop',
  audience: 'organization',
  playlist: 'axel',
} as const;
/** The Episodes recorded so far, each with its video per locale. */
const RECORDINGS = [
  { slug: 'ai-token-economy', en: 'S0Nx4faEebY', de: 'S0Nx4faEebY' },
  { slug: 'maintaining-markdown-for-ai', en: 'YxCVw4bUbW0', de: 'YxCVw4bUbW0' },
  { slug: 'never-too-early-sales', en: 'lnr7T-IBHTw', de: 'lnr7T-IBHTw' },
] as const;
/** The record with one field left out, as a file that forgot it would hold it. */
function without<T extends object>(record: T, key: keyof T): Partial<T> {
  const copy: Partial<T> = { ...record };
  delete copy[key];
  return copy;
}
const SOUND = { episodes: [EPISODE], events: [EVENT], playlists: [PLAYLIST] };

describe('success cases', () => {
  it('loads a sound set of records whole', () => {
    // ARRANGE
    const expected = { episodes: [EPISODE], events: [EVENT], playlists: [PLAYLIST] };
    // ACT
    const content = loadContent(SOUND);
    // ASSERT
    expect(content).toEqual(expected);
  });

  it('loads the AXEL seminar as the first Event, presenting a public Playlist of the three unlisted Episodes it taught', () => {
    // ARRANGE
    const expected = {
      event: {
        slug: '2026-10-23-axel-agentic-workflow',
        date: '2026-10-23',
        kind: 'workshop',
        audience: 'organization',
        playlist: 'axel-agentic-workflow',
      },
      playlist: {
        id: 'axel-agentic-workflow',
        visibility: 'public',
        episodes: ['axel-onboard-ai-every-time', 'axel-ai-attention-span', 'axel-ai-gives-you-more-work'],
      },
    };
    // ACT
    const event = findEvent(expected.event.slug);
    const playlist = event && playlistOf(event);
    // ASSERT
    expect({ event, playlist }).toEqual(expected);
  });

  it.each(['17:00', '17:00–19:00', '17:00–19:00 CET'])('loads an Event time as the venue writes it: %s', (time) => {
    // ARRANGE
    const expected = time;
    // ACT
    const [event] = loadContent({ ...SOUND, events: [{ ...EVENT, time }] }).events;
    // ASSERT
    expect(event.time).toBe(expected);
  });

  it('keeps the hand-kept Event slugs of the routes in step with the Event records', () => {
    // ARRANGE
    const expected = [...EVENT_SLUGS];
    // ACT
    const slugs = listEvents().map((event) => event.slug);
    // ASSERT
    expect(slugs).toEqual(expected);
  });

  it('declares every Episode public but the ones the AXEL seminar and the CyberForum Akademie webinar present', () => {
    // ARRANGE
    const expected = [
      'axel-onboard-ai-every-time',
      'axel-ai-attention-span',
      'axel-ai-gives-you-more-work',
      'cyberforum-intro',
      'cyberforum-onboard-ai-every-time',
      'cyberforum-ai-attention-span',
      'cyberforum-ai-gives-you-more-work',
    ];
    // ACT
    const notPublic = listEpisodes().filter((episode) => episode.visibility !== 'public');
    // ASSERT
    expect(notPublic.map((episode) => episode.slug)).toEqual(expected);
  });

  it('I flip an Episode from unlisted to public by changing one field.', () => {
    // ARRANGE
    const presented = { ...PLAYLIST, episodes: ['alpha', 'alpha-at-axel'] };
    const unlisted = { episodes: [EPISODE, UNLISTED], events: [EVENT], playlists: [presented] };
    const flipped = { ...unlisted, episodes: [EPISODE, { ...UNLISTED, visibility: 'public' }] };
    const own = { kind: 'episode', episode: 'alpha-at-axel' } as unknown as PageRef;
    const underEvent = { kind: 'event-episode', event: EVENT.slug, episode: 'alpha-at-axel' } as unknown as PageRef;
    const seenIn = (input: Parameters<typeof loadContent>[0]) => {
      const content = loadContent(input);
      return {
        own: pageTreatment(own, pageFactsIn(content, own)),
        underEvent: pageTreatment(underEvent, pageFactsIn(content, underEvent)),
        overview: overviewOrder(content.episodes, []).map((episode) => episode.slug),
      };
    };
    const expected = {
      unlisted: {
        own: { exported: false, inSitemap: false, index: false, listed: false, canonical: 'self' },
        underEvent: { exported: true, inSitemap: false, index: false, listed: false, canonical: 'self' },
        overview: ['alpha'],
      },
      public: {
        own: { exported: true, inSitemap: true, index: true, listed: true, canonical: 'self' },
        underEvent: {
          exported: true,
          inSitemap: false,
          index: true,
          listed: false,
          canonical: { episode: 'alpha-at-axel' },
        },
        overview: ['alpha', 'alpha-at-axel'],
      },
    };
    // ACT
    const seen = { unlisted: seenIn(unlisted), public: seenIn(flipped) };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('lists on /events/ only the Events whose Playlist is public, leaving out one whose Playlist is unlisted', () => {
    // ARRANGE
    const [publicSlug, unlistedSlug] = EVENT_SLUGS;
    const shown = { ...EVENT, slug: publicSlug, date: '2026-10-23' };
    const private_ = { ...EVENT, slug: unlistedSlug, date: '2026-10-28', playlist: 'private' };
    const unlistedPlaylist = { ...PLAYLIST, id: 'private', visibility: 'unlisted' };
    const content = loadContent({ ...SOUND, events: [shown, private_], playlists: [PLAYLIST, unlistedPlaylist] });
    const expected = [publicSlug];
    // ACT
    const listed = listedEventsIn(content).map((event) => event.slug);
    // ASSERT
    expect(listed).toEqual(expected);
  });

  it.each(RECORDINGS)(
    'plays the recorded YouTube video of $slug per locale, from its metadata record',
    ({ slug, en, de }) => {
      // ARRANGE
      const expected = { en, de };
      // ACT
      const video = { en: episodeVideo(slug, 'en')?.id, de: episodeVideo(slug, 'de')?.id };
      // ASSERT
      expect(video).toEqual(expected);
    },
  );
});

describe('failure cases', () => {
  it('An unlisted Episode in no Event is refused.', () => {
    // ARRANGE
    const input = { ...SOUND, episodes: [EPISODE, UNLISTED] };
    const expected = 'Episode alpha-at-axel: visibility is unlisted, but no Event presents a Playlist listing it';
    // ACT
    const load = () => loadContent(input);
    // ASSERT
    expect(load).toThrow(expected);
  });

  it('A record without a visibility is refused.', () => {
    // ARRANGE
    const withoutVisibility = without(EPISODE, 'visibility');
    const input = { ...SOUND, episodes: [withoutVisibility] };
    const expected = 'Episode alpha: visibility is required, public or unlisted';
    // ACT
    const load = () => loadContent(input);
    // ASSERT
    expect(load).toThrow(expected);
  });

  it('refuses a Playlist without a visibility', () => {
    // ARRANGE
    const withoutVisibility = without(PLAYLIST, 'visibility');
    const input = { ...SOUND, playlists: [withoutVisibility] };
    const expected = 'Playlist axel: visibility is required, public or unlisted';
    // ACT
    const load = () => loadContent(input);
    // ASSERT
    expect(load).toThrow(expected);
  });

  it.each([
    ['Episode', { ...SOUND, episodes: [{ ...EPISODE, visibility: 'attendees' }] }, 'Episode alpha'],
    ['Playlist', { ...SOUND, playlists: [{ ...PLAYLIST, visibility: 'attendees' }] }, 'Playlist axel'],
  ])('refuses the visibility attendees on an %s until horizon 3', (_, input, record) => {
    // ARRANGE
    const expected = `${record}: visibility is "attendees", which is refused until horizon 3 gives it an enforcer`;
    // ACT
    const load = () => loadContent(input);
    // ASSERT
    expect(load).toThrow(expected);
  });

  it('refuses an Event time that is no clock time', () => {
    // ARRANGE
    const input = { ...SOUND, events: [{ ...EVENT, time: 'evening' }] };
    const expected = 'Event 2026-10-23-axel: time must be written HH:MM, or HH:MM–HH:MM, with an optional zone';
    // ACT
    const load = () => loadContent(input);
    // ASSERT
    expect(load).toThrow(expected);
  });

  it('refuses an Event whose slug does not start with its date', () => {
    // ARRANGE
    const input = { ...SOUND, events: [{ ...EVENT, slug: '2026-10-24-axel' }] };
    const expected = 'Event 2026-10-24-axel: slug must be <date>-<name>, starting with its date 2026-10-23';
    // ACT
    const load = () => loadContent(input);
    // ASSERT
    expect(load).toThrow(expected);
  });

  it('refuses an Event slug that is only its date, with no name after it', () => {
    // ARRANGE
    const input = { ...SOUND, events: [{ ...EVENT, slug: '2026-10-23' }] };
    const expected = 'Event 2026-10-23: slug must be <date>-<name>, starting with its date 2026-10-23';
    // ACT
    const load = () => loadContent(input);
    // ASSERT
    expect(load).toThrow(expected);
  });

  it.each([
    ['Episode', { ...SOUND, episodes: [EPISODE, EPISODE] }, 'Episode alpha: slug is used by more than one Episode'],
    ['Event', { ...SOUND, events: [EVENT, EVENT] }, 'Event 2026-10-23-axel: slug is used by more than one Event'],
    ['Playlist', { ...SOUND, playlists: [PLAYLIST, PLAYLIST] }, 'Playlist axel: id is used by more than one Playlist'],
  ])('refuses two %s records sharing a slug', (_, input, expected) => {
    // ARRANGE
    const records = input;
    // ACT
    const load = () => loadContent(records);
    // ASSERT
    expect(load).toThrow(expected);
  });

  it('refuses an Event naming a Playlist that does not exist', () => {
    // ARRANGE
    const input = { ...SOUND, events: [{ ...EVENT, playlist: 'missing' }] };
    const expected = 'Event 2026-10-23-axel: playlist "missing" does not exist';
    // ACT
    const load = () => loadContent(input);
    // ASSERT
    expect(load).toThrow(expected);
  });

  it('refuses a Playlist that lists no Episode', () => {
    // ARRANGE
    const input = { ...SOUND, playlists: [{ ...PLAYLIST, episodes: [] }] };
    const expected = 'Playlist axel: episodes lists none, but a Playlist lists at least one Episode';
    // ACT
    const load = () => loadContent(input);
    // ASSERT
    expect(load).toThrow(expected);
  });

  it('refuses a Playlist naming an Episode that is not registered', () => {
    // ARRANGE
    const input = { ...SOUND, playlists: [{ ...PLAYLIST, episodes: ['alpha', 'ghost'] }] };
    const expected = 'Playlist axel: episodes names "ghost", which is no registered Episode';
    // ACT
    const load = () => loadContent(input);
    // ASSERT
    expect(load).toThrow(expected);
  });

  it('refuses a Playlist listing one Episode twice', () => {
    // ARRANGE
    const input = { ...SOUND, playlists: [{ ...PLAYLIST, episodes: ['alpha', 'alpha'] }] };
    const expected = 'Playlist axel: episodes lists "alpha" twice';
    // ACT
    const load = () => loadContent(input);
    // ASSERT
    expect(load).toThrow(expected);
  });

  it('refuses a public Playlist no Event presents when it lists an unlisted Episode', () => {
    // ARRANGE
    const curated = { id: 'curated', visibility: 'public', episodes: ['alpha', 'alpha-at-axel'] } as const;
    const atAxel = { ...PLAYLIST, episodes: ['alpha-at-axel'] };
    const input = { episodes: [EPISODE, UNLISTED], events: [EVENT], playlists: [atAxel, curated] };
    const expected =
      'Playlist curated: episodes lists the unlisted Episode "alpha-at-axel", but no Event presents this public Playlist';
    // ACT
    const load = () => loadContent(input);
    // ASSERT
    expect(load).toThrow(expected);
  });

  it("refuses a recording whose language is not one of the site's locales", () => {
    // ARRANGE
    const recorded = { ...UNLISTED, youtube: { id: 'S0Nx4faEebY', language: 'fr' } };
    const input = {
      ...SOUND,
      episodes: [EPISODE, recorded],
      playlists: [{ ...PLAYLIST, episodes: ['alpha-at-axel'] }],
    };
    const expected = `Episode alpha-at-axel: youtube.language "fr" is not one of the site's locales (en, de)`;
    // ACT
    const load = () => loadContent(input);
    // ASSERT
    expect(load).toThrow(expected);
  });

  it('refuses an unlisted Episode with more than one Video', () => {
    // ARRANGE
    const twoVideos = { ...UNLISTED, youtube: { en: 'S0Nx4faEebY', de: 'YxCVw4bUbW0' } };
    const input = {
      ...SOUND,
      episodes: [EPISODE, twoVideos],
      playlists: [{ ...PLAYLIST, episodes: ['alpha-at-axel'] }],
    };
    const expected =
      'Episode alpha-at-axel: youtube holds 2 videos (en, de), but an unlisted Episode carries at most one Video, its Event recording with its language';
    // ACT
    const load = () => loadContent(input);
    // ASSERT
    expect(load).toThrow(expected);
  });

  it("refuses a public Episode's video under a key that is not one of the site's locales", () => {
    // ARRANGE
    const input = { ...SOUND, episodes: [{ ...EPISODE, youtube: { fr: 'S0Nx4faEebY' } }] };
    const expected = `Episode alpha: youtube names "fr", which is not one of the site's locales (en, de)`;
    // ACT
    const load = () => loadContent(input);
    // ASSERT
    expect(load).toThrow(expected);
  });

  it('refuses a public Episode carrying one recording, and an unlisted one carrying a video per locale', () => {
    // ARRANGE
    const recordedPublic = { ...EPISODE, youtube: { id: 'S0Nx4faEebY', language: 'de' } };
    const perLocaleUnlisted = { ...UNLISTED, youtube: { en: 'S0Nx4faEebY' } };
    const input = {
      ...SOUND,
      episodes: [recordedPublic, perLocaleUnlisted],
      playlists: [{ ...PLAYLIST, episodes: ['alpha-at-axel'] }],
    };
    const expected = [
      'Episode alpha: youtube is one recording with its language, but a public Episode keeps one video per locale',
      'Episode alpha-at-axel: youtube is one video per locale, but an unlisted Episode carries one recording with its language',
    ];
    // ACT
    const load = () => loadContent(input);
    // ASSERT
    expected.forEach((sentence) => expect(load).toThrow(sentence));
  });

  it('refuses an Episode listing one Tag twice, and a Tag outside the vocabulary', () => {
    // ARRANGE
    const twice = { ...EPISODE, tags: ['workflow', 'workflow'] };
    const unknown = { ...EPISODE, slug: 'beta', tags: ['astrology'] };
    const expected = { twice: 'Episode alpha: tags lists workflow twice', unknown: 'Episode beta: tags.0 ' };
    // ACT
    const loadTwice = () => loadContent({ ...SOUND, episodes: [twice] });
    const loadUnknown = () => loadContent({ ...SOUND, episodes: [EPISODE, unknown] });
    // ASSERT
    expect(loadTwice).toThrow(expected.twice);
    expect(loadUnknown).toThrow(expected.unknown);
  });

  it('refuses a published Episode without a release date, naming the field', () => {
    // ARRANGE
    const undated = without(EPISODE, 'publishedOn');
    const expected = 'Episode alpha: publishedOn ';
    // ACT
    const load = () => loadContent({ ...SOUND, episodes: [undated] });
    // ASSERT
    expect(load).toThrow(expected);
  });
});

describe('edge cases', () => {
  it('lets an event Playlist, public or not, list unlisted Episodes made for its Event', () => {
    // ARRANGE
    const atAxel = { ...PLAYLIST, episodes: ['alpha-at-axel', 'alpha'] };
    const input = { episodes: [EPISODE, UNLISTED], events: [EVENT], playlists: [atAxel] };
    const expected = ['alpha', 'alpha-at-axel'];
    // ACT
    const content = loadContent(input);
    // ASSERT
    expect(content.episodes.map((episode) => episode.slug)).toEqual(expected);
  });

  it('names a record whose slug is missing instead of dropping it', () => {
    // ARRANGE
    const nameless = without(EPISODE, 'slug');
    const expected = 'Episode (no slug): slug ';
    // ACT
    const load = () => loadContent({ ...SOUND, episodes: [EPISODE, nameless] });
    // ASSERT
    expect(load).toThrow(expected);
  });

  it('reports every refusal at once, one sentence per broken record', () => {
    // ARRANGE
    const input = {
      ...SOUND,
      events: [{ ...EVENT, playlist: 'missing' }],
      playlists: [PLAYLIST, { ...PLAYLIST, id: 'empty', episodes: [] }],
    };
    const expected = [
      'The content store refused a record:',
      '- Event 2026-10-23-axel: playlist "missing" does not exist',
      '- Playlist empty: episodes lists none, but a Playlist lists at least one Episode',
    ].join('\n');
    // ACT
    const load = () => loadContent(input);
    // ASSERT
    expect(load).toThrow(expected);
  });

  it('flags a missing status in its own words', () => {
    // ARRANGE
    const statusless = without(EPISODE, 'status');
    const expected = 'Episode alpha: status is missing, but must be published or upcoming';
    // ACT
    const load = () => loadContent({ ...SOUND, episodes: [statusless] });
    // ASSERT
    expect(load).toThrow(expected);
  });
});
