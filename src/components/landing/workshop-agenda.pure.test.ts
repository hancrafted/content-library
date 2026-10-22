import { describe, expect, it } from 'vitest';
import type { EpisodeCard } from './episode-card.pure';
import { agendaOf, startOf, totalMinutes } from './workshop-agenda.pure';

/** A hand-written stand-in for the card fields the agenda reads. */
type Stub = Pick<EpisodeCard, 'slug' | 'route' | 'minutes'>;
const linked = (slug: string, minutes?: number): Stub => ({
  slug,
  route: `/episodes/${slug}`,
  ...(minutes === undefined ? {} : { minutes }),
});
const upcoming = (slug: string): Stub => ({ slug, route: null });

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

  it('lists the cards in the order the Workshop teaches its Episodes', () => {
    // ARRANGE
    const cards = [linked('alpha'), linked('beta'), linked('gamma')];
    const expected = ['gamma', 'alpha'];
    // ACT
    const agenda = agendaOf(['gamma', 'alpha'], cards);
    // ASSERT
    expect(agenda.map((card) => card.slug)).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('names the Episode a Workshop lists that has no card', () => {
    // ARRANGE
    const cards = [linked('alpha')];
    // ACT
    const build = () => agendaOf(['alpha', 'missing'], cards);
    // ASSERT
    expect(build).toThrow('"missing"');
  });
});

describe('edge cases', () => {
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
