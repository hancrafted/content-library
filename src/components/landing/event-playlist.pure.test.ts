import type { EpisodeCard } from '@/episodes/components/episode-card/episode-card.pure';
import type { EpisodeId } from '@/lib/routes';
import { describe, expect, it } from 'vitest';
import { eventPlaylistCards, startOf, totalMinutes } from './event-playlist.pure';

/** A hand-written stand-in for the card fields an Event's Playlist reads. */
type Stub = Pick<EpisodeCard, 'slug' | 'route' | 'href' | 'minutes'>;
const linked = (slug: string, minutes?: number): Stub => ({
  slug,
  route: `/episodes/${slug}`,
  href: `/episodes/${slug}`,
  ...(minutes === undefined ? {} : { minutes }),
});
const upcoming = (slug: string): Stub => ({ slug, route: null, href: null });
/** An Episode as its Playlist lists it: its record (only the slug read here), and its page's Episode id when it has one. */
const entry = (slug: string, page?: EpisodeId) => ({ episode: { slug }, ...(page === undefined ? {} : { page }) });
/** The AXEL seminar presenting the given Episodes, in this order. */
const axel = (...episodes: ReturnType<typeof entry>[]) =>
  ({ slug: '2026-10-23-axel-agentic-workflow', playlist: { episodes } }) as const;
/** A card for each Episode, linked to its own page. */
const linkedCard = (episode: { slug: string }): Stub => linked(episode.slug);

describe('success cases', () => {
  it('adds the counted minutes of every Episode that has them', () => {
    // ARRANGE
    const cards = [linked('alpha', 12), linked('beta', 9), linked('gamma', 20)];
    const expected = 41;
    // ACT
    const total = totalMinutes(cards);
    // ASSERT
    expect(total).toBe(expected);
  });

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
      entry('never-too-early-sales', 'never-too-early-sales'),
      entry('ai-token-economy', 'ai-token-economy'),
    );
    const expected = ['never-too-early-sales', 'ai-token-economy'];
    // ACT
    const playlist = eventPlaylistCards(event, linkedCard, 'en');
    // ASSERT
    expect(playlist.map((card) => card.slug)).toEqual(expected);
  });

  it("opens each Episode under its Event at its slug, an Event's copy too, in the locale", () => {
    // ARRANGE
    const event = axel(entry('ai-attention-span', '2026-10-23-axel-agentic-workflow__ai-attention-span'));
    const expected = {
      route: '/events/2026-10-23-axel-agentic-workflow/episodes/ai-attention-span',
      href: '/de/events/2026-10-23-axel-agentic-workflow/episodes/ai-attention-span',
    };
    // ACT
    const [card] = eventPlaylistCards(event, linkedCard, 'de');
    // ASSERT
    expect({ route: card.route, href: card.href }).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('keeps an upcoming Episode unlinked under its Event, even when its page is already built', () => {
    // ARRANGE
    const event = axel(entry('ai-token-economy', 'ai-token-economy'));
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

  it('shows no total when no Episode has a counted time', () => {
    // ARRANGE
    const cards = [linked('alpha'), upcoming('beta')];
    // ACT
    const total = totalMinutes(cards);
    // ASSERT
    expect(total).toBeUndefined();
  });

  it('totals only the known minutes when some Episodes have none', () => {
    // ARRANGE
    const cards = [linked('alpha', 12), upcoming('beta')];
    const expected = 12;
    // ACT
    const total = totalMinutes(cards);
    // ASSERT
    expect(total).toBe(expected);
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
