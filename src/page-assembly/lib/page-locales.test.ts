import { describe, expect, it } from 'vitest';
import { localesByRoute } from './page-locales';

/*
 * The locales page chrome's toggle offers, read from the page catalogue: only a page not exported in every locale is
 * named, so every other page keeps both.
 */

describe('success cases', () => {
  it('offers the English-only dashboard in English alone', () => {
    // ARRANGE
    const expected = ['en'];
    // ACT
    const dashboard = localesByRoute()['/dashboard'];
    // ASSERT
    expect(dashboard).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('names no page exported in every locale', () => {
    // ARRANGE
    const everyLocale = ['/', '/episodes', '/events'];
    // ACT
    const named = Object.keys(localesByRoute()).filter((route) => everyLocale.includes(route));
    // ASSERT
    expect(named).toEqual([]);
  });
});

describe('edge cases', () => {
  it('names the dashboard and nothing else today', () => {
    // ARRANGE
    const expected = ['/dashboard'];
    // ACT
    const routes = Object.keys(localesByRoute());
    // ASSERT
    expect(routes).toEqual(expected);
  });
});
