import { EVENT_SLUGS, hasPage } from '@/content-store/catalogue/record-routes';
import type { IsoDate } from '@/content-store/schemas/fields';
import { listEpisodes } from '@/content-store/store';
import { load } from 'cheerio';
import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { eventEpisodeFrame } from './event-episode-frame';

/*
 * The frame an Event-scoped Episode page wears (design-ADR 0016, Routes and visibility), read at the one call page
 * assembly makes: the Episode's place in the Playlist, its breadcrumb and past notice above the Title slide, and the
 * Playlist walk after the last Slide. The Episodes are any three with a page, by the refs the store serves, and the
 * Event any registered one, so the test names no content; their titles are a stand-in for the function page assembly
 * hands in.
 */

const EVENT = EVENT_SLUGS[0];
const [FIRST, MIDDLE, LAST] = listEpisodes()
  .map(({ ref }) => ref)
  .filter(hasPage)
  .slice(0, 3);
const BUILD_DAY: IsoDate = '2026-10-25';
const UPCOMING: IsoDate = '2026-11-06';
const titleOf = (episode: { readonly slug: string }) => `Title of ${episode.slug}`;

/** The Event-scoped Episode the frame wraps: one of three in the Playlist, under an Event on `date`. */
function presented(episode: typeof FIRST, date: IsoDate) {
  const at = [FIRST, MIDDLE, LAST].indexOf(episode);
  return {
    event: { slug: EVENT, date },
    episode,
    place: {
      position: at + 1,
      count: 3,
      ...(at > 0 && { previous: [FIRST, MIDDLE, LAST][at - 1] }),
      ...(at < 2 && { next: [FIRST, MIDDLE, LAST][at + 1] }),
    },
  } as const;
}

/** The frame of `episode` in English for an Event on `date`, built on `BUILD_DAY`. */
const frameOf = (episode: typeof FIRST, date: IsoDate = UPCOMING) =>
  eventEpisodeFrame(presented(episode, date), { locale: 'en', titleOf, buildDay: BUILD_DAY });

/** One rendered part of the frame, to query. */
const html = (part: ReactNode) => load(renderToStaticMarkup(part));

/** A step of the Playlist walk, by its cue: the page it opens and the title it shows; none when the walk has none. */
function stepOf(footer: ReactNode, walk: 'previous' | 'next' | 'back') {
  const link = html(footer)(`[data-playlist-${walk}]`);
  return link.length === 0 ? undefined : { href: link.attr('href'), title: link.children().last().text() };
}

describe('success cases', () => {
  it('says where the Episode sits in its Playlist, under the title', () => {
    // ARRANGE
    const expected = 'Episode 2 of 3';
    // ACT
    const frame = frameOf(MIDDLE);
    // ASSERT
    expect(frame.position).toBe(expected);
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
    // ACT
    const seen = {
      past: html(frameOf(MIDDLE, past).header)('[data-past-notice]').length,
      upcoming: html(frameOf(MIDDLE, UPCOMING).header)('[data-past-notice]').length,
    };
    // ASSERT
    expect(seen).toEqual({ past: 1, upcoming: 0 });
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
