import { describe, expect, it } from 'vitest';
import { playlistChip, playlistPosition } from './playlists.pure';

const PLAYLIST = ['agenda', 'onboard', 'attention', 'more-work'];

describe('success cases', () => {
  it('places an Episode at its position in the Playlist, between its neighbours', () => {
    // ARRANGE
    const expected = { position: 2, count: 4, previous: 'agenda', next: 'attention' };
    // ACT
    const walk = playlistPosition(PLAYLIST, 'onboard');
    // ASSERT
    expect(walk).toEqual(expected);
  });

  it('chips the event-frame Episode as the Event page and an unlisted one as unlisted', () => {
    // ARRANGE
    const expected = ['event-frame', 'unlisted'];
    // ACT
    const chips = [
      playlistChip({ type: 'event-frame', visibility: 'unlisted' }),
      playlistChip({ type: 'standard', visibility: 'unlisted' }),
    ];
    // ASSERT
    expect(chips).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('refuses an Episode the Playlist does not hold', () => {
    // ARRANGE
    const stranger = 'not-in-it';
    // ACT
    const walk = () => playlistPosition(PLAYLIST, stranger);
    // ASSERT
    expect(walk).toThrow(/not-in-it/);
  });

  it('gives a public Episode no chip', () => {
    // ARRANGE
    const episode = { type: 'standard', visibility: 'public' } as const;
    // ACT
    const chip = playlistChip(episode);
    // ASSERT
    expect(chip).toBeUndefined();
  });
});

describe('edge cases', () => {
  it('gives the first Episode no previous one and the last no next one', () => {
    // ARRANGE
    const expected = [
      { position: 1, count: 4, next: 'onboard' },
      { position: 4, count: 4, previous: 'attention' },
    ];
    // ACT
    const ends = [playlistPosition(PLAYLIST, 'agenda'), playlistPosition(PLAYLIST, 'more-work')];
    // ASSERT
    expect(ends).toEqual(expected);
  });
});
