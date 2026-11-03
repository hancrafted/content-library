import { episodesPathPageAt, eventEpisodePageAt, findEvent } from '@/content-store/store';
import { localizePath } from '@/shared/lib/locale.pure';
import { describe, expect, it } from 'vitest';
import { episodeContextOf, eventNavigationOf } from './event-navigation.pure';

const EVENT = findEvent('2026-10-28-cyberforum-akademie-intro-agentic-workflow')!;

describe('success cases', () => {
  it('returns a standalone Episode to the localized Episodes overview', () => {
    // ARRANGE
    const page = episodesPathPageAt({ episode: 'onboard-ai-every-time' })!;
    const expected = '/de/episodes';
    const label = 'Episode';
    // ACT
    const context = episodeContextOf(page, 'de', label);
    // ASSERT
    expect(localizePath(context.back!.route, 'de')).toBe(expected);
  });

  it('supplies the Event Episode title and its contextual back destination', () => {
    // ARRANGE
    const page = eventEpisodePageAt({ event: EVENT.slug, episode: 'intro' })!;
    const label = 'Episode';
    const expected = {
      title: 'Generative KI im Arbeitsalltag: agentisch arbeiten',
      route: '/events/2026-10-28-cyberforum-akademie-intro-agentic-workflow/episodes/intro',
      back: { label, route: '/events/2026-10-28-cyberforum-akademie-intro-agentic-workflow' },
    };
    // ACT
    const context = episodeContextOf(page, 'de', label);
    // ASSERT
    expect(context).toEqual(expected);
  });

  it('offers each navigable Episode once in first-occurrence Playlist order', () => {
    // ARRANGE
    const expected = [
      '/events/2026-10-28-cyberforum-akademie-intro-agentic-workflow/episodes/intro',
      '/events/2026-10-28-cyberforum-akademie-intro-agentic-workflow/episodes/onboard-ai-every-time',
      '/events/2026-10-28-cyberforum-akademie-intro-agentic-workflow/episodes/ai-attention-span',
      '/events/2026-10-28-cyberforum-akademie-intro-agentic-workflow/episodes/ai-gives-you-more-work',
    ];
    // ACT
    const tree = eventNavigationOf(EVENT, 'de');
    // ASSERT
    expect(tree.pages.map(({ route }) => route)).toEqual(expected);
  });

  it('links German Section and Slide titles directly to their Event-scoped anchors', () => {
    // ARRANGE
    const expected = {
      title: 'Im Fokus',
      section: '/de/events/2026-10-28-cyberforum-akademie-intro-agentic-workflow/episodes/intro#in-scope',
      slideTitle: 'Nicht im Fokus',
      slide: '/de/events/2026-10-28-cyberforum-akademie-intro-agentic-workflow/episodes/intro#in-scope--out-of-scope',
    };
    // ACT
    const page = eventNavigationOf(EVENT, 'de').pages[0];
    const section = page.sections.find(({ id }) => id === 'in-scope')!;
    const item = section.items[0];
    const seen = {
      title: section.title,
      section: localizePath(page.route, 'de', section.id),
      slideTitle: item.title,
      slide: localizePath(page.route, 'de', item.id),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('does not offer a Playlist entry without a page as a destination', () => {
    // ARRANGE
    const [first, ...rest] = EVENT.playlist.episodes;
    const withoutPage = {
      ...EVENT,
      playlist: { ...EVENT.playlist, episodes: [{ ...first, page: undefined }, ...rest] },
    };
    const excluded = '/events/2026-10-28-cyberforum-akademie-intro-agentic-workflow/episodes/intro';
    // ACT
    const routes = eventNavigationOf(withoutPage, 'en').pages.map(({ route }) => route);
    // ASSERT
    expect(routes).not.toContain(excluded);
  });
});

describe('edge cases', () => {
  it('retains the Event destination when there are no navigable Episodes', () => {
    // ARRANGE
    const empty = { ...EVENT, playlist: { ...EVENT.playlist, episodes: [] } };
    const expectedRoute = '/events/2026-10-28-cyberforum-akademie-intro-agentic-workflow';
    // ACT
    const tree = eventNavigationOf(empty, 'en');
    // ASSERT
    expect(tree.pages).toEqual([]);
    expect(tree.route).toBe(expectedRoute);
  });
});
