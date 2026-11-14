import { describe, expect, it } from 'vitest';
import { upcomingListed } from './upcoming-listing.pure';

describe('success cases', () => {
  it('lists Upcoming Episodes when the preview deploy sets LIST_UPCOMING_EPISODES', () => {
    // ARRANGE
    const env = { NODE_ENV: 'production', LIST_UPCOMING_EPISODES: 'true' };
    const expected = true;
    // ACT
    const listed = upcomingListed(env);
    // ASSERT
    expect(listed).toBe(expected);
  });

  it('lists Upcoming Episodes under next dev', () => {
    // ARRANGE
    const env = { NODE_ENV: 'development' };
    const expected = true;
    // ACT
    const listed = upcomingListed(env);
    // ASSERT
    expect(listed).toBe(expected);
  });
});

describe('failure cases', () => {
  it('hides Upcoming Episodes from a production build without the flag', () => {
    // ARRANGE
    const env = { NODE_ENV: 'production' };
    const expected = false;
    // ACT
    const listed = upcomingListed(env);
    // ASSERT
    expect(listed).toBe(expected);
  });
});

describe('edge cases', () => {
  it('treats an empty LIST_UPCOMING_EPISODES as unset, as the production deploy passes it', () => {
    // ARRANGE
    const env = { NODE_ENV: 'production', LIST_UPCOMING_EPISODES: '' };
    const expected = false;
    // ACT
    const listed = upcomingListed(env);
    // ASSERT
    expect(listed).toBe(expected);
  });
});
