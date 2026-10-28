import { episodeRef } from '@/content-store/catalogue/episode-id.pure';
import { EVENT_SLUGS } from '@/content-store/catalogue/record-routes';
import type { IsoDate } from '@/content-store/schemas/fields';
import { load } from 'cheerio';
import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { eventEpisodeFrame } from './event-episode-frame';

/*
 * The frame an Event-scoped Episode page wears (design-ADR 0016, Routes and visibility), read at the one call page
 * assembly makes: the Episode's place in the Playlist, its breadcrumb and past notice above the Title slide, and the
 * Playlist walk after the last Slide. The presented Episode is a fixture: three Episodes no repo folder holds, one of
 * them an Event's copy, in a Playlist of three, and their titles a stand-in for the function page assembly hands in.
 * Only the Event is a registered one, any of them: the frame reads its title from the Events area's words, which are
 * keyed by the Event registry's slugs.
 */

const EVENT = EVENT_SLUGS[0];
const FIRST = episodeRef('alpha');
const MIDDLE = episodeRef('beta', EVENT);
const LAST = episodeRef('gamma');
const PLAYLIST = [FIRST, MIDDLE, LAST] as const;
const BUILD_DAY: IsoDate = '2026-10-25';
const UPCOMING: IsoDate = '2026-11-06';
const EVENT_TIME = '17:00–19:00 CET';
const titleOf = (episode: { readonly slug: string }) => `Title of ${episode.slug}`;

/** The served Event, the Episode and its place in the Playlist, as the page catalogue presents it, for an Event on `date`. */
function presented(episode: (typeof PLAYLIST)[number], date: IsoDate) {
  const at = PLAYLIST.indexOf(episode);
  return {
    event: { slug: EVENT, date, time: EVENT_TIME },
    episode,
    place: {
      position: at + 1,
      count: PLAYLIST.length,
      ...(at > 0 && { previous: PLAYLIST[at - 1] }),
      ...(at < PLAYLIST.length - 1 && { next: PLAYLIST[at + 1] }),
    },
  };
}

/** The frame of `episode` in English for an Event on `date`, built on `BUILD_DAY`. */
const frameOf = (episode: (typeof PLAYLIST)[number], date: IsoDate = UPCOMING) =>
  eventEpisodeFrame(presented(episode, date), { locale: 'en', titleOf, buildDay: BUILD_DAY });

/** One rendered part of the frame, to query. */
const html = (part: ReactNode) => load(renderToStaticMarkup(part));

/** A step of the Playlist walk, by its cue: the page it opens and the title it shows; none when the walk has none. */
function stepOf(footer: ReactNode, walk: 'previous' | 'next' | 'back') {
  const link = html(footer)(`[data-playlist-${walk}]`);
  return link.length === 0 ? undefined : { href: link.attr('href'), title: link.children().last().text() };
}

describe('success cases', () => {
  it('shows the Event time under the title', () => {
    // ARRANGE
    const expected = '17:00–19:00 CET';
    // ACT
    const frame = frameOf(MIDDLE);
    // ASSERT
    expect(frame.time).toBe(expected);
  });

  it('serves the page at the Episode under its Event', () => {
    // ARRANGE
    const expected = `/events/${EVENT}/episodes/${MIDDLE.slug}`;
    // ACT
    const frame = frameOf(MIDDLE);
    // ASSERT
    expect(frame.route).toBe(expected);
  });

  it('walks to the previous and the next Episode under the Event, each by its title', () => {
    // ARRANGE
    const expected = {
      previous: { href: `/events/${EVENT}/episodes/${FIRST.slug}`, title: titleOf(FIRST) },
      next: { href: `/events/${EVENT}/episodes/${LAST.slug}`, title: titleOf(LAST) },
    };
    // ACT
    const { footer } = frameOf(MIDDLE);
    // ASSERT
    expect({ previous: stepOf(footer, 'previous'), next: stepOf(footer, 'next') }).toEqual(expected);
  });

  it('ends the breadcrumb in the Episode, after the Event it opens back to', () => {
    // ARRANGE
    const expected = { event: `/events/${EVENT}`, current: titleOf(MIDDLE) };
    // ACT
    const header = html(frameOf(MIDDLE).header);
    // ASSERT
    expect({
      event: header('[data-event-breadcrumb] a').last().attr('href'),
      current: header('[aria-current="page"]').text(),
    }).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('shows a past Event its notice above the title, and an upcoming one none', () => {
    // ARRANGE
    const past: IsoDate = '2026-10-23';
    const expected = { past: 1, upcoming: 0 };
    // ACT
    const seen = {
      past: html(frameOf(MIDDLE, past).header)('[data-past-notice]').length,
      upcoming: html(frameOf(MIDDLE, UPCOMING).header)('[data-past-notice]').length,
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('leads back to the Event instead of a next Episode on the last one', () => {
    // ARRANGE
    const expected = { next: undefined, back: `/events/${EVENT}` };
    // ACT
    const { footer } = frameOf(LAST);
    // ASSERT
    expect({ next: stepOf(footer, 'next'), back: stepOf(footer, 'back')?.href }).toEqual(expected);
  });

  it('offers no previous step on the first Episode', () => {
    // ARRANGE
    const expected = { href: `/events/${EVENT}/episodes/${MIDDLE.slug}`, title: titleOf(MIDDLE) };
    // ACT
    const { footer } = frameOf(FIRST);
    // ASSERT
    expect({ previous: stepOf(footer, 'previous'), next: stepOf(footer, 'next') }).toEqual({
      previous: undefined,
      next: expected,
    });
  });

  it('lines the header and the walk up with the Slides, inside the insets', () => {
    // ARRANGE
    const inset = ['pl-(--inset-l)', 'pr-(--inset-r)'];
    // ACT
    const frame = frameOf(MIDDLE);
    const classes = [
      html(frame.header)('[data-event-episode-header]').attr('class')?.split(' '),
      html(frame.footer)('[data-playlist-nav]').attr('class')?.split(' '),
    ];
    // ASSERT
    expect(classes).toEqual([expect.arrayContaining(inset), expect.arrayContaining(inset)]);
  });
});
