import { episodeRef, type EpisodeRef } from '@/content-store/catalogue/episode-id.pure';
import type { EpisodeId } from '@/content-store/catalogue/record-routes';
import { describe, expect, it } from 'vitest';
import { eventPlaylistCards, startOf, type PlaylistCard } from './event-playlist.pure';

/** A hand-written stand-in for the card fields an Event's Playlist reads. */
type Stub = PlaylistCard & { readonly slug: string };
const linked = (slug: string): Stub => ({
  slug,
  route: `/episodes/${slug}`,
  href: `/episodes/${slug}`,
});
const upcoming = (slug: string): Stub => ({ slug, route: null, href: null });
/** An Episode as its Playlist lists it: its record (only the slug read here), and its page's EpisodeRef when it has one. */
const entry = (slug: string, page?: EpisodeRef<EpisodeId>, anchor?: string) => ({
  episode: { slug },
  ...(page === undefined ? {} : { page }),
  ...(anchor === undefined ? {} : { anchor }),
});
/** The AXEL seminar presenting the given Episodes, in this order. */
const axel = (...episodes: ReturnType<typeof entry>[]) =>
  ({ slug: '2026-10-23-axel-agentic-workflow', playlist: { episodes } }) as const;
/** A card for each Episode, linked to its own page. */
const linkedCard = (episode: { slug: string }): Stub => linked(episode.slug);

describe('success cases', () => {
  it('starts with the first Episode, as step 1, when it is linked', () => {
    // ARRANGE
    const cards = [linked('alpha'), linked('beta')];
    const expected = { step: 1, slug: 'alpha' };
    // ACT
    const start = startOf(cards);
    // ASSERT
    expect({ step: start?.step, slug: start?.card.slug }).toEqual(expected);
  });

  it("lists the cards in the Playlist's order", () => {
    // ARRANGE
    const event = axel(
      entry('never-too-early-sales', episodeRef('never-too-early-sales')),
      entry('ai-token-economy', episodeRef('ai-token-economy')),
    );
    const expected = ['never-too-early-sales', 'ai-token-economy'];
    // ACT
    const playlist = eventPlaylistCards(event, linkedCard, 'en');
    // ASSERT
    expect(playlist.map((card) => card.slug)).toEqual(expected);
  });

  it("opens each Episode under its Event at its slug, an Event's copy too, in the locale", () => {
    // ARRANGE
    const event = axel(entry('ai-attention-span', episodeRef('ai-attention-span', '2026-10-23-axel-agentic-workflow')));
    const expected = {
      route: '/events/2026-10-23-axel-agentic-workflow/episodes/ai-attention-span',
      href: '/de/events/2026-10-23-axel-agentic-workflow/episodes/ai-attention-span',
    };
    // ACT
    const [card] = eventPlaylistCards(event, linkedCard, 'de');
    // ASSERT
    expect({ route: card.route, href: card.href }).toEqual(expected);
  });
  it('opens an entry listed at an anchor at that Section of the Episode under its Event, and builds its card for it', () => {
    // ARRANGE
    const anchor = 'check-in-1';
    const event = axel(entry('ai-token-economy', episodeRef('ai-token-economy'), anchor));
    const expected = {
      anchor,
      route: '/events/2026-10-23-axel-agentic-workflow/episodes/ai-token-economy#check-in-1',
      href: '/de/events/2026-10-23-axel-agentic-workflow/episodes/ai-token-economy#check-in-1',
    };
    // ACT
    const [card] = eventPlaylistCards(event, (episode, at) => ({ ...linked(episode.slug), anchor: at }), 'de');
    // ASSERT
    expect({ anchor: card.anchor, route: card.route, href: card.href }).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('keeps an upcoming Episode unlinked under its Event, even when its page is already built', () => {
    // ARRANGE
    const event = axel(entry('ai-token-economy', episodeRef('ai-token-economy')));
    const expected = { route: null, href: null };
    // ACT
    const [card] = eventPlaylistCards(event, (episode) => upcoming(episode.slug), 'en');
    // ASSERT
    expect({ route: card.route, href: card.href }).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('leaves an Episode with no page unlinked under its Event', () => {
    // ARRANGE
    const event = axel(entry('alpha'));
    const expected = { route: null, href: null };
    // ACT
    const [card] = eventPlaylistCards(event, (episode) => upcoming(episode.slug), 'en');
    // ASSERT
    expect({ route: card.route, href: card.href }).toEqual(expected);
  });

  it('starts with the first linked Episode and its step number when the opening ones are upcoming', () => {
    // ARRANGE
    const cards = [upcoming('alpha'), linked('beta'), linked('gamma')];
    const expected = { step: 2, slug: 'beta' };
    // ACT
    const start = startOf(cards);
    // ASSERT
    expect({ step: start?.step, slug: start?.card.slug }).toEqual(expected);
  });

  it('offers no start when every Episode is still upcoming', () => {
    // ARRANGE
    const cards = [upcoming('alpha'), upcoming('beta')];
    // ACT
    const start = startOf(cards);
    // ASSERT
    expect(start).toBeUndefined();
  });
});
