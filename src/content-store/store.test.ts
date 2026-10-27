import { describe, expect, it } from 'vitest';
import { episodeRef } from './catalogue/episode-id.pure';
import { episodeVideo, findEvent, loadContent } from './store';

/*
 * The content store's refusals (FE-013 Decision 3, design-ADR 0016): every record is parsed whole or the load
 * throws a sentence naming its kind, slug and field. Fixtures are raw records, as a record file would hold them; an
 * Episode enters with the id its folder gives it, as the generated Episode registry hands it in, and is served with its
 * EpisodeRef.
 */

const AXEL = '2026-10-23-axel-agentic-workflow';
const EPISODE = {
  slug: 'alpha',
  status: 'published',
  visibility: 'public',
  format: 'foundations',
  tags: ['workflow'],
  publishedOn: '2026-10-20',
} as const;
/** The AXEL seminar's unlisted copy of alpha, in its Event's folder `by-event/<event>/alpha/`. */
const UNLISTED = { ...EPISODE, visibility: 'unlisted' } as const;
const COPY_ID = episodeRef('alpha', AXEL).id;
const PLAYLIST = { id: 'axel', visibility: 'public', episodes: ['alpha'] } as const;
const EVENT = {
  slug: AXEL,
  date: '2026-10-23',
  kind: 'workshop',
  organizers: ['axel'],
  audience: 'organization',
  tags: ['agentic-ai', 'workflow'],
  format: 'remote',
  platform: 'zoom',
  playlist: 'axel',
} as const;
/** The same Event held at a venue, as an onsite Event's file writes it. */
const ONSITE = { ...without(EVENT, 'platform'), format: 'onsite', venue: 'AXEL, Karlsruhe' } as const;
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
/** An Episode no Event owns, entered under its folder's id, its slug. */
function own(record: Readonly<Record<string, unknown>>, id = String(record.slug)): { id: string; record: unknown } {
  return { id, record };
}
/** An Event's copy, entered under the id its folder `by-event/<event-slug>/<slug>/` gives it. */
function copy(record: Readonly<Record<string, unknown>>, event: string = AXEL): { id: string; record: unknown } {
  return { id: episodeRef(String(record.slug), event).id, record };
}
const SOUND = {
  episodes: [own(EPISODE)],
  events: [EVENT],
  playlists: [PLAYLIST],
  resources: [],
  resourceCompositions: [],
};

describe('success cases', () => {
  it('loads a sound set of records whole, each Event holding the Playlist it presents with its Episodes', () => {
    // ARRANGE
    const loaded = { ...EPISODE, ref: episodeRef('alpha') };
    const presented = { ...PLAYLIST, episodes: [{ episode: loaded, place: { position: 1, count: 1 } }] };
    const expected = {
      episodes: [loaded],
      events: [{ ...EVENT, playlist: presented }],
      playlists: [PLAYLIST],
      resources: [],
    };
    // ACT
    const content = loadContent(SOUND);
    // ASSERT
    expect(content).toEqual(expected);
  });

  it("serves the AXEL seminar with its public Playlist's three unlisted Episodes in order, each with its place", () => {
    // ARRANGE
    const expected = {
      slug: '2026-10-23-axel-agentic-workflow',
      date: '2026-10-23',
      kind: 'workshop',
      organizers: ['axel'],
      audience: 'organization',
      tags: ['agentic-ai', 'workflow'],
      format: 'remote',
      platform: 'zoom',
      playlist: {
        id: 'axel-agentic-workflow',
        visibility: 'public',
        episodes: [
          {
            slug: 'onboard-ai-every-time',
            page: episodeRef('onboard-ai-every-time', AXEL),
            place: { position: 1, count: 3, next: episodeRef('ai-attention-span', AXEL) },
          },
          {
            slug: 'ai-attention-span',
            page: episodeRef('ai-attention-span', AXEL),
            place: {
              position: 2,
              count: 3,
              previous: episodeRef('onboard-ai-every-time', AXEL),
              next: episodeRef('ai-gives-you-more-work', AXEL),
            },
          },
          {
            slug: 'ai-gives-you-more-work',
            page: episodeRef('ai-gives-you-more-work', AXEL),
            place: { position: 3, count: 3, previous: episodeRef('ai-attention-span', AXEL) },
          },
        ],
      },
    };
    // ACT
    const event = findEvent(expected.slug);
    const episodes = event?.playlist.episodes.map(({ episode, ...entry }) => ({ slug: episode.slug, ...entry }));
    // ASSERT
    expect(event && { ...event, playlist: { ...event.playlist, episodes } }).toEqual(expected);
  });

  it.each([
    ['an onsite Event with its venue', ONSITE],
    ['a hybrid Event with its venue and platform', { ...EVENT, format: 'hybrid', venue: 'AXEL, Karlsruhe' }],
  ])('loads %s', (_, event) => {
    // ARRANGE
    const expected = event;
    // ACT
    const [loaded] = loadContent({ ...SOUND, events: [event] }).events;
    // ASSERT
    expect({ ...loaded, playlist: event.playlist }).toEqual(expected);
  });

  it.each(['17:00', '17:00–19:00', '17:00–19:00 CET'])('loads an Event time as the venue writes it: %s', (time) => {
    // ARRANGE
    const expected = time;
    // ACT
    const [event] = loadContent({ ...SOUND, events: [{ ...EVENT, time }] }).events;
    // ASSERT
    expect(event.time).toBe(expected);
  });

  it("serves each Episode with the visibility its record declares: an Event's copy unlisted, one no Event owns public", () => {
    // ARRANGE
    const input = {
      ...SOUND,
      episodes: [own(EPISODE), copy(UNLISTED)],
      playlists: [{ ...PLAYLIST, episodes: [COPY_ID] }],
    };
    const expected = [
      { ref: episodeRef('alpha'), visibility: 'public' },
      { ref: episodeRef('alpha', AXEL), visibility: 'unlisted' },
    ];
    // ACT
    const served = loadContent(input).episodes.map(({ ref, visibility }) => ({ ref, visibility }));
    // ASSERT
    expect(served).toEqual(expected);
  });

  it.each(RECORDINGS)(
    'plays the recorded YouTube video of $slug per locale, from its metadata record',
    ({ slug, en, de }) => {
      // ARRANGE
      const expected = { en, de };
      // ACT
      const episode = episodeRef(slug);
      const video = { en: episodeVideo(episode, 'en')?.id, de: episodeVideo(episode, 'de')?.id };
      // ASSERT
      expect(video).toEqual(expected);
    },
  );

  it('loads a Resource whose composition folder exists', () => {
    // ARRANGE
    const input = { ...RESOURCE_RECORDS, resourceCompositions: ['grids'] };
    // ACT
    const content = loadContent(input);
    // ASSERT
    expect(content.resources.map(({ slug }) => slug)).toEqual(['grids']);
  });
});

describe('failure cases', () => {
  it('An unlisted Episode in no Event is refused.', () => {
    // ARRANGE
    const input = { ...SOUND, episodes: [own(EPISODE), copy(UNLISTED)] };
    const expected = `Episode ${COPY_ID}: visibility is unlisted, but no Event presents a Playlist listing it`;
    // ACT
    const load = () => loadContent(input);
    // ASSERT
    expect(load).toThrow(expected);
  });

  it('A record without a visibility is refused.', () => {
    // ARRANGE
    const withoutVisibility = without(EPISODE, 'visibility');
    const input = { ...SOUND, episodes: [own(withoutVisibility)] };
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
    ['Episode', { ...SOUND, episodes: [own({ ...EPISODE, visibility: 'attendees' })] }, 'Episode alpha'],
    ['Playlist', { ...SOUND, playlists: [{ ...PLAYLIST, visibility: 'attendees' }] }, 'Playlist axel'],
  ])('refuses the visibility attendees on an %s until horizon 3', (_, input, record) => {
    // ARRANGE
    const expected = `${record}: visibility is "attendees", which is refused until horizon 3 gives it an enforcer`;
    // ACT
    const load = () => loadContent(input);
    // ASSERT
    expect(load).toThrow(expected);
  });

  it.each([
    ['without Tags', without(EVENT, 'tags'), 'tags is required, one Tag or more, the first its lead Tag'],
    [
      'with no Tags',
      { ...EVENT, tags: [] },
      'tags.0 is required, one of context-engineering, agentic-ai, markdown, cost, sales, workflow',
    ],
    [
      'with a Tag outside the vocabulary',
      { ...EVENT, tags: ['ai'] },
      'tags.0 is "ai", but must be one of context-engineering, agentic-ai, markdown, cost, sales, workflow',
    ],
    ['without a format', without(EVENT, 'format'), 'format is required, one of onsite, remote, hybrid'],
    ['onsite with no venue', without(ONSITE, 'venue'), 'venue is required when the format is onsite'],
    ['hybrid with no venue', { ...EVENT, format: 'hybrid' }, 'venue is required when the format is hybrid'],
    ['remote with no platform', without(EVENT, 'platform'), 'platform is required when the format is remote'],
    ['hybrid with no platform', { ...ONSITE, format: 'hybrid' }, 'platform is required when the format is hybrid'],
    [
      'on a platform outside the list',
      { ...EVENT, platform: 'webex' },
      'platform is "webex", but must be one of zoom, teams, google-meet',
    ],
    ['remote with a venue', { ...EVENT, venue: 'AXEL, Karlsruhe' }, 'venue is set, but a remote Event has none'],
    ['onsite with a platform', { ...ONSITE, platform: 'zoom' }, 'platform is set, but an onsite Event has none'],
  ])('refuses an Event %s, naming the Event and the field', (_, event, field) => {
    // ARRANGE
    const expected = `Event ${AXEL}: ${field}`;
    // ACT
    const load = () => loadContent({ ...SOUND, events: [event] });
    // ASSERT
    expect(load).toThrow(expected);
  });

  it('refuses an Event time that is no clock time', () => {
    // ARRANGE
    const input = { ...SOUND, events: [{ ...EVENT, time: 'evening' }] };
    const expected =
      'Event 2026-10-23-axel-agentic-workflow: time must be written HH:MM, or HH:MM–HH:MM, with an optional zone';
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
    [
      'Episode',
      { ...SOUND, episodes: [own(EPISODE), own(EPISODE)] },
      'Episode alpha: id is used by more than one Episode',
    ],
    [
      'Event',
      { ...SOUND, events: [EVENT, EVENT] },
      'Event 2026-10-23-axel-agentic-workflow: slug is used by more than one Event',
    ],
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
    const expected = 'Event 2026-10-23-axel-agentic-workflow: playlist "missing" does not exist';
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
    const unlistedOwn = { ...EPISODE, slug: 'beta', visibility: 'unlisted' } as const;
    const curated = { id: 'curated', visibility: 'public', episodes: ['alpha', 'beta'] } as const;
    const input = {
      episodes: [own(EPISODE), own(unlistedOwn)],
      events: [EVENT],
      playlists: [PLAYLIST, curated],
      resources: [],
      resourceCompositions: [],
    };
    const expected =
      'Playlist curated: episodes lists the unlisted Episode "beta", but no Event presents this public Playlist';
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
      episodes: [own(EPISODE), copy(recorded)],
      playlists: [{ ...PLAYLIST, episodes: [COPY_ID] }],
    };
    const expected = `Episode ${COPY_ID}: youtube.language "fr" is not one of the site's locales (en, de)`;
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
      episodes: [own(EPISODE), copy(twoVideos)],
      playlists: [{ ...PLAYLIST, episodes: [COPY_ID] }],
    };
    const expected = `Episode ${COPY_ID}: youtube holds 2 videos (en, de), but an unlisted Episode carries at most one Video, its Event recording with its language`;
    // ACT
    const load = () => loadContent(input);
    // ASSERT
    expect(load).toThrow(expected);
  });

  it("refuses a public Episode's video under a key that is not one of the site's locales", () => {
    // ARRANGE
    const input = { ...SOUND, episodes: [own({ ...EPISODE, youtube: { fr: 'S0Nx4faEebY' } })] };
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
      episodes: [own(recordedPublic), copy(perLocaleUnlisted)],
      playlists: [{ ...PLAYLIST, episodes: [COPY_ID] }],
    };
    const expected = [
      'Episode alpha: youtube is one recording with its language, but a public Episode keeps one video per locale',
      `Episode ${COPY_ID}: youtube is one video per locale, but an unlisted Episode carries one recording with its language`,
    ];
    // ACT
    const load = () => loadContent(input);
    // ASSERT
    expected.forEach((sentence) => expect(load).toThrow(sentence));
  });

  it.each([
    ['without any', without(EVENT, 'organizers'), 'organizers is required, one Organizer or more, the first its lead'],
    ['empty', { ...EVENT, organizers: [] }, 'organizers.0 is required, one of hancrafted, axel, cyberforum'],
    [
      'outside the list',
      { ...EVENT, organizers: ['acme'] },
      'organizers.0 is "acme", but must be one of hancrafted, axel, cyberforum',
    ],
  ])('refuses Event organizers %s, naming the Event', (_, event, field) => {
    // ARRANGE
    const expected = `Event ${AXEL}: ${field}`;
    // ACT
    const load = () => loadContent({ ...SOUND, events: [event] });
    // ASSERT
    expect(load).toThrow(expected);
  });

  it('serves an Event with its partners, listing, references and image', () => {
    // ARRANGE
    const extras = {
      organizers: ['cyberforum', 'hancrafted'],
      listing: 'https://example.org/event',
      references: [{ label: 'Next_KARL', url: 'https://example.org/karl' }],
      image: { src: '/images/events/a.webp', credit: '© Example' },
    } as const;
    // ACT
    const served = loadContent({ ...SOUND, events: [{ ...EVENT, ...extras }] }).events[0];
    // ASSERT
    expect({
      organizers: served.organizers,
      listing: served.listing,
      references: served.references,
      image: served.image,
    }).toEqual(extras);
  });

  it.each([
    ['a listing that is not https', { listing: 'http://example.org/event' }, 'listing'],
    ['a reference that is not https', { references: [{ label: 'x', url: 'http://example.org' }] }, 'references.0.url'],
    ['an image outside /images/events/', { image: { src: '/images/other/a.webp', credit: 'c' } }, 'image.src'],
  ])('refuses %s, naming the Event and the field', (_, extra, field) => {
    // ARRANGE
    const expected = `Event ${AXEL}: ${field}`;
    // ACT
    const load = () => loadContent({ ...SOUND, events: [{ ...EVENT, ...extra }] });
    // ASSERT
    expect(load).toThrow(expected);
  });

  it('refuses an Episode in a by-event folder naming no Event, naming the Episode', () => {
    // ARRANGE
    const stray = copy(UNLISTED, '2026-10-24-nowhere');
    const input = {
      ...SOUND,
      episodes: [own(EPISODE), stray],
      playlists: [{ ...PLAYLIST, episodes: ['alpha', stray.id] }],
    };
    const expected = `Episode ${stray.id}: its folder by-event/2026-10-24-nowhere/ names no Event`;
    // ACT
    const load = () => loadContent(input);
    // ASSERT
    expect(load).toThrow(expected);
  });

  it("refuses a Playlist listing another Event's copy, naming the Playlist", () => {
    // ARRANGE
    const other = {
      ...EVENT,
      slug: '2026-10-28-cyberforum',
      date: '2026-10-28',
      organizers: ['cyberforum'],
      playlist: 'cyberforum',
    };
    const theirs = { id: 'cyberforum', visibility: 'public', episodes: [COPY_ID] } as const;
    const ours = { ...PLAYLIST, episodes: [COPY_ID] };
    const input = {
      episodes: [own(EPISODE), copy(UNLISTED)],
      events: [EVENT, other],
      playlists: [ours, theirs],
      resources: [],
      resourceCompositions: [],
    };
    const expected = `Playlist cyberforum: episodes lists "${COPY_ID}", a copy Event ${AXEL} owns, but Event 2026-10-28-cyberforum presents this Playlist`;
    // ACT
    const load = () => loadContent(input);
    // ASSERT
    expect(load).toThrow(expected);
  });

  it('refuses an unlisted Episode outside by-event/, naming the Episode', () => {
    // ARRANGE
    const input = { ...SOUND, episodes: [own(UNLISTED)] };
    const expected =
      "Episode alpha: visibility is unlisted, but it lives outside by-event/: an unlisted Episode lives in its Event's folder";
    // ACT
    const load = () => loadContent(input);
    // ASSERT
    expect(load).toThrow(expected);
  });

  it('refuses an Episode whose slug is the reserved folder name by-event, naming the Episode', () => {
    // ARRANGE
    const reserved = { ...EPISODE, slug: 'by-event' };
    const input = { ...SOUND, episodes: [own(EPISODE), own(reserved)] };
    const expected = 'Episode by-event: slug "by-event" is a reserved folder name of the Episodes folder';
    // ACT
    const load = () => loadContent(input);
    // ASSERT
    expect(load).toThrow(expected);
  });

  it.each(['slide-pool', 'resources', 'components', 'lib', 'hooks'])(
    'refuses an Episode whose slug is the reserved folder name %s, naming the Episode',
    (slug) => {
      // ARRANGE
      const reserved = { ...EPISODE, slug };
      const input = { ...SOUND, episodes: [own(EPISODE), own(reserved)] };
      const expected = `Episode ${slug}: slug "${slug}" is a reserved folder name of the Episodes folder`;
      // ACT
      const load = () => loadContent(input);
      // ASSERT
      expect(load).toThrow(expected);
    },
  );

  it('refuses an Episode whose slug is not its folder name, naming the Episode', () => {
    // ARRANGE
    const input = { ...SOUND, episodes: [own(EPISODE, 'beta')], playlists: [{ ...PLAYLIST, episodes: ['beta'] }] };
    const expected = 'Episode beta: slug "alpha" is not its folder\'s name "beta"';
    // ACT
    const load = () => loadContent(input);
    // ASSERT
    expect(load).toThrow(expected);
  });

  it('refuses a Playlist listing two Episodes with one slug, which would share one URL under its Event', () => {
    // ARRANGE
    const input = {
      ...SOUND,
      episodes: [own(EPISODE), copy(EPISODE)],
      playlists: [{ ...PLAYLIST, episodes: ['alpha', COPY_ID] }],
    };
    const expected =
      'Playlist axel: episodes lists two Episodes with the slug "alpha", which would share one URL under its Event';
    // ACT
    const load = () => loadContent(input);
    // ASSERT
    expect(load).toThrow(expected);
  });

  it('refuses an Episode listing one Tag twice, and a Tag outside the vocabulary', () => {
    // ARRANGE
    const twice = { ...EPISODE, tags: ['workflow', 'workflow'] };
    const unknown = { ...EPISODE, slug: 'beta', tags: ['astrology'] };
    const expected = { twice: 'Episode alpha: tags lists workflow twice', unknown: 'Episode beta: tags.0 ' };
    // ACT
    const loadTwice = () => loadContent({ ...SOUND, episodes: [own(twice)] });
    const loadUnknown = () => loadContent({ ...SOUND, episodes: [own(EPISODE), own(unknown)] });
    // ASSERT
    expect(loadTwice).toThrow(expected.twice);
    expect(loadUnknown).toThrow(expected.unknown);
  });

  it('refuses a published Episode without a release date, naming the field', () => {
    // ARRANGE
    const undated = without(EPISODE, 'publishedOn');
    const expected = 'Episode alpha: publishedOn ';
    // ACT
    const load = () => loadContent({ ...SOUND, episodes: [own(undated)] });
    // ASSERT
    expect(load).toThrow(expected);
  });

  it('refuses Featured slots that are not three published public Episodes, naming each slot', () => {
    // ARRANGE
    const upcoming = {
      slug: 'beta',
      status: 'upcoming',
      visibility: 'public',
      format: 'foundations',
      tags: ['workflow'],
    };
    const episodes = [own(EPISODE), own(upcoming), copy(UNLISTED)];
    const input = {
      ...SOUND,
      episodes,
      playlists: [{ ...PLAYLIST, episodes: [COPY_ID] }],
      featured: ['alpha', 'beta'],
    };
    const unlisted = { ...input, featured: ['alpha', COPY_ID, 'missing'] };
    const expected = [
      'Featured: names 2 slots, but Featured fills 3',
      'Featured: slot "beta" is upcoming, but a Featured Episode is published',
    ];
    const expectedUnlisted = [
      `Featured: slot "${COPY_ID}" is unlisted, but a Featured Episode is public`,
      'Featured: slot "missing" names no Episode',
    ];
    // ACT
    const load = () => loadContent(input);
    const loadUnlisted = () => loadContent(unlisted);
    // ASSERT
    for (const sentence of expected) expect(load).toThrow(sentence);
    for (const sentence of expectedUnlisted) expect(loadUnlisted).toThrow(sentence);
  });

  it('refuses a Resource whose composition folder does not exist', () => {
    // ARRANGE
    const input = { ...RESOURCE_RECORDS, resourceCompositions: [] };
    // ACT
    const load = () => loadContent(input);
    // ASSERT
    expect(load).toThrow('Resource grids: no composition folder src/episodes/resources/grids/ holds its Slides');
  });

  it('refuses a composition folder that has no Resource record', () => {
    // ARRANGE
    const input = { ...SOUND, resources: [], resourceCompositions: ['grids'] };
    // ACT
    const load = () => loadContent(input);
    // ASSERT
    expect(load).toThrow('Resource grids: the composition folder src/episodes/resources/grids/ has no record');
  });

  it('refuses two Resources with one slug, and a Resource of an unknown type, naming the record', () => {
    // ARRANGE
    const input = {
      ...SOUND,
      resources: [RESOURCE, RESOURCE, { ...RESOURCE, slug: 'odd', type: 'deck' }],
      resourceCompositions: ['grids', 'odd'],
    };
    // ACT
    const load = () => loadContent(input);
    // ASSERT
    expect(load).toThrow('Resource odd: type is "deck"');
  });

  it('refuses a duplicate Resource slug', () => {
    // ARRANGE
    const input = { ...RESOURCE_RECORDS, resources: [RESOURCE, RESOURCE], resourceCompositions: ['grids'] };
    // ACT
    const load = () => loadContent(input);
    // ASSERT
    expect(load).toThrow('Resource grids: slug is used by more than one Resource');
  });
});

describe('edge cases', () => {
  it("lets an event Playlist, public or not, list its own Event's unlisted copies, each served with its ref", () => {
    // ARRANGE
    // A registered copy, so its entry has a page: its ref is the page's.
    const attention = { ...UNLISTED, slug: 'ai-attention-span' };
    const copyId = episodeRef('ai-attention-span', AXEL).id;
    const atAxel = { ...PLAYLIST, episodes: [copyId] };
    const input = {
      episodes: [own(EPISODE), copy(attention)],
      events: [EVENT],
      playlists: [atAxel],
      resources: [],
      resourceCompositions: [],
    };
    const expected = {
      episodes: [
        { kind: 'standalone', id: 'alpha', slug: 'alpha' },
        { kind: 'event-copy', id: copyId, event: AXEL, slug: 'ai-attention-span' },
      ],
      page: { kind: 'event-copy', id: copyId, event: AXEL, slug: 'ai-attention-span' },
    };
    // ACT
    const content = loadContent(input);
    const seen = {
      episodes: content.episodes.map(({ ref }) => ref),
      page: content.events[0].playlist.episodes[0].page,
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('counts an Episode with no page yet in its Playlist, while the walk steps over it', () => {
    // ARRANGE
    const tokens = { ...EPISODE, slug: 'ai-token-economy' };
    const attention = { ...EPISODE, slug: 'ai-attention-span' };
    const playlist = { ...PLAYLIST, episodes: ['ai-token-economy', 'alpha', 'ai-attention-span'] };
    const input = {
      episodes: [own(tokens), own(EPISODE), own(attention)],
      events: [EVENT],
      playlists: [playlist],
      resources: [],
      resourceCompositions: [],
    };
    const expected = [
      {
        slug: 'ai-token-economy',
        page: episodeRef('ai-token-economy'),
        place: { position: 1, count: 3, next: episodeRef('ai-attention-span') },
      },
      {
        slug: 'alpha',
        place: {
          position: 2,
          count: 3,
          previous: episodeRef('ai-token-economy'),
          next: episodeRef('ai-attention-span'),
        },
      },
      {
        slug: 'ai-attention-span',
        page: episodeRef('ai-attention-span'),
        place: { position: 3, count: 3, previous: episodeRef('ai-token-economy') },
      },
    ];
    // ACT
    const [event] = loadContent(input).events;
    // ASSERT
    expect(event.playlist.episodes.map(({ episode, ...entry }) => ({ slug: episode.slug, ...entry }))).toEqual(
      expected,
    );
  });

  it('names a record whose slug is missing by its folder instead of dropping it', () => {
    // ARRANGE
    const nameless = without(EPISODE, 'slug');
    const expected = 'Episode beta: slug ';
    // ACT
    const load = () => loadContent({ ...SOUND, episodes: [own(EPISODE), own(nameless, 'beta')] });
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
      '- Event 2026-10-23-axel-agentic-workflow: playlist "missing" does not exist',
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
    const load = () => loadContent({ ...SOUND, episodes: [own(statusless)] });
    // ASSERT
    expect(load).toThrow(expected);
  });
});

/*
 * Resources (design-ADR 0019): a record and its composition folder go together, and the load throws on either one
 * alone.
 */
const RESOURCE = { slug: 'grids', type: 'master-slide', tags: ['workflow'], visibility: 'public' } as const;
const RESOURCE_RECORDS = { ...SOUND, resources: [RESOURCE] };
