import { episodeRef } from '@/content-store/catalogue/episode-id.pure';
import { EVENT_SLUGS } from '@/content-store/catalogue/record-routes';
import type { IsoDate } from '@/content-store/schemas/fields';
import { load } from 'cheerio';
import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { eventEpisodeFrame } from './event-episode-frame';

// decision: docs/adr/0016-content-data-model.md
const EVENT = EVENT_SLUGS[0];
const FIRST = episodeRef('alpha');
const MIDDLE = episodeRef('beta', EVENT);
const LAST = episodeRef('gamma');
const PLAYLIST = [FIRST, MIDDLE, LAST] as const;
const BUILD_DAY: IsoDate = '2026-10-25';
const UPCOMING: IsoDate = '2026-11-06';
const EVENT_TIME = '17:00–19:00 CET';
const titleOf = (episode: { readonly slug: string }) => `Title of ${episode.slug}`;

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

const frameOf = (episode: (typeof PLAYLIST)[number], date: IsoDate = UPCOMING) =>
  eventEpisodeFrame(presented(episode, date), { locale: 'en', titleOf, buildDay: BUILD_DAY });

const html = (part: ReactNode) => load(renderToStaticMarkup(part));

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

  it.each([UPCOMING, '2026-10-23'] as const)('omits breadcrumbs from an Event Episode on %s', (date) => {
    // ARRANGE
    const expected = 0;
    // ACT
    const header = html(frameOf(MIDDLE, date).header);
    // ASSERT
    expect(header('[data-event-breadcrumb]').length).toBe(expected);
  });
});

describe('failure cases', () => {
  it('shows a past Event its notice above the title, and an upcoming one none', () => {
    // ARRANGE
    const past: IsoDate = '2026-10-23';
    const expected = { past: 1, upcoming: 0, upcomingHeader: '' };
    // ACT
    const seen = {
      past: html(frameOf(MIDDLE, past).header)('[data-past-notice]').length,
      upcoming: html(frameOf(MIDDLE, UPCOMING).header)('[data-past-notice]').length,
      upcomingHeader: renderToStaticMarkup(frameOf(MIDDLE, UPCOMING).header),
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

  it('lines the Playlist walk up with the Slides, inside the insets', () => {
    // ARRANGE
    const inset = ['pl-(--inset-l)', 'pr-(--inset-r)'];
    // ACT
    const frame = frameOf(MIDDLE);
    const classes = html(frame.footer)('[data-playlist-nav]').attr('class')?.split(' ');
    // ASSERT
    expect(classes).toEqual(expect.arrayContaining(inset));
  });
});
