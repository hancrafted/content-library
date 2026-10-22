import { describe, expect, it } from 'vitest';
import { EPISODE_SLUGS } from './routes';
import { WORKSHOPS, workshopProblems } from './workshops.pure';

const KNOWN = ['alpha', 'beta', 'gamma'];
const VALID = { slug: 'intro-2026-10-23', date: '2026-10-23', episodes: ['alpha', 'beta'] } as const;

describe('success cases', () => {
  it('accepts every Workshop in the central record against the registered Episodes', () => {
    // ARRANGE
    const known = EPISODE_SLUGS;
    // ACT
    const problems = workshopProblems(WORKSHOPS, known);
    // ASSERT
    expect(problems).toEqual([]);
  });

  it('keeps the first Workshop in the order its Episodes are taught', () => {
    // ARRANGE
    const expected = {
      slug: 'axel-agentic-workflow-2026-10-23',
      episodes: ['onboard-ai-every-time', 'ai-attention-span', 'ai-gives-you-more-work'],
    };
    // ACT
    const first = { slug: WORKSHOPS[0].slug, episodes: WORKSHOPS[0].episodes };
    // ASSERT
    expect(first).toEqual(expected);
  });

  it('accepts a Workshop with a time, a location and an upcoming Episode as plain slugs', () => {
    // ARRANGE
    const workshop = { ...VALID, time: '09:30', location: 'Berlin', episodes: ['gamma', 'alpha'] };
    // ACT
    const problems = workshopProblems([workshop], KNOWN);
    // ASSERT
    expect(problems).toEqual([]);
  });
});

describe('failure cases', () => {
  it('rejects a slug that does not end in the Workshop date', () => {
    // ARRANGE
    const workshop = { ...VALID, slug: 'intro-2026-10-24' };
    // ACT
    const problems = workshopProblems([workshop], KNOWN);
    // ASSERT
    expect(problems).toEqual(['intro-2026-10-24: the slug must end in its date 2026-10-23']);
  });

  it('rejects a slug that is only the date, with no name before it', () => {
    // ARRANGE
    const workshop = { ...VALID, slug: '2026-10-23' };
    // ACT
    const problems = workshopProblems([workshop], KNOWN);
    // ASSERT
    expect(problems).toEqual(['2026-10-23: the slug must end in its date 2026-10-23']);
  });

  it('rejects an Episode slug no Episode is registered under', () => {
    // ARRANGE
    const workshop = { ...VALID, episodes: ['alpha', 'missing'] };
    // ACT
    const problems = workshopProblems([workshop], KNOWN);
    // ASSERT
    expect(problems).toEqual(['intro-2026-10-23: "missing" is not a registered Episode']);
  });

  it('rejects an Episode listed twice in one Workshop', () => {
    // ARRANGE
    const workshop = { ...VALID, episodes: ['alpha', 'beta', 'alpha'] };
    // ACT
    const problems = workshopProblems([workshop], KNOWN);
    // ASSERT
    expect(problems).toEqual(['intro-2026-10-23: "alpha" is listed twice']);
  });

  it('rejects two Workshops sharing a slug', () => {
    // ARRANGE
    const workshops = [VALID, { ...VALID, episodes: ['gamma'] }];
    // ACT
    const problems = workshopProblems(workshops, KNOWN);
    // ASSERT
    expect(problems).toEqual(['intro-2026-10-23: the slug is used by more than one Workshop']);
  });
});

describe('edge cases', () => {
  it('rejects a Workshop with no Episodes, since there is nothing to start with', () => {
    // ARRANGE
    const workshop = { ...VALID, episodes: [] };
    // ACT
    const problems = workshopProblems([workshop], KNOWN);
    // ASSERT
    expect(problems).toEqual(['intro-2026-10-23: a Workshop lists at least one Episode']);
  });

  it('reports every problem of a Workshop together', () => {
    // ARRANGE
    const workshop = { slug: 'intro', date: '2026-10-23', episodes: ['alpha', 'alpha', 'nope'] } as const;
    const expected = 3;
    // ACT
    const problems = workshopProblems([workshop], KNOWN);
    // ASSERT
    expect(problems).toHaveLength(expected);
  });
});
