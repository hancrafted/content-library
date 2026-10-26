import { describe, expect, it } from 'vitest';
import { isPastEvent, playlistPlace } from './events.pure';

const PLAYLIST = ['agenda', 'onboard', 'attention', 'more-work'];
/** Every Playlist entry has a page: a stand-in for `isEpisodeSlug` over registered slugs. */
const everyHasAPage = (slug: string): slug is string => slug.length > 0;

describe('success cases', () => {
  it('says where an Episode sits in the Playlist and which Episodes come before and after it', () => {
    // ARRANGE
    const expected = { position: 2, count: 4, previous: 'agenda', next: 'attention' };
    // ACT
    const place = playlistPlace(PLAYLIST, 'onboard', everyHasAPage);
    // ASSERT
    expect(place).toEqual(expected);
  });

  it('A past Event says its content may differ from the recording; an upcoming Event does not', () => {
    // ARRANGE
    const buildDay = '2026-10-26';
    const expected = { past: true, sameDay: false, upcoming: false };
    // ACT
    const seen = {
      past: isPastEvent('2026-10-23', buildDay),
      sameDay: isPastEvent('2026-10-26', buildDay),
      upcoming: isPastEvent('2026-10-28', buildDay),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('throws for an Episode the Playlist does not list, so the build fails', () => {
    // ARRANGE
    const expected = 'The Playlist lists no Episode "elsewhere"';
    // ACT
    const read = () => playlistPlace(PLAYLIST, 'elsewhere', everyHasAPage);
    // ASSERT
    expect(read).toThrow(expected);
  });
});

describe('edge cases', () => {
  it('gives the first Episode no previous one', () => {
    // ARRANGE
    const expected = { position: 1, count: 4, next: 'onboard' };
    // ACT
    const place = playlistPlace(PLAYLIST, 'agenda', everyHasAPage);
    // ASSERT
    expect(place).toEqual(expected);
  });

  it('gives the last Episode no next one, so the walk ends back at the Event', () => {
    // ARRANGE
    const expected = { position: 4, count: 4, previous: 'attention' };
    // ACT
    const place = playlistPlace(PLAYLIST, 'more-work', everyHasAPage);
    // ASSERT
    expect(place).toEqual(expected);
  });

  it('steps over an Episode with no page yet, but still counts it', () => {
    // ARRANGE
    const hasPage = (slug: string): slug is string => slug !== 'attention';
    const expected = { position: 2, count: 4, previous: 'agenda', next: 'more-work' };
    // ACT
    const place = playlistPlace(PLAYLIST, 'onboard', hasPage);
    // ASSERT
    expect(place).toEqual(expected);
  });
});
