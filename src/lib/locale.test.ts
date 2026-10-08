import { describe, expect, it } from 'vitest';
import { isLocale, localeFromPathname, localizePath, stripLocale, switchLocalePath } from './locale.pure';

describe('success cases', () => {
  it('keeps the default locale unprefixed', () => {
    // ARRANGE
    const logicalPath = '/episode/page-template';
    // ACT
    const url = localizePath(logicalPath, 'en');
    // ASSERT
    expect(url).toBe('/episode/page-template');
  });

  it('prefixes a non-default locale', () => {
    // ARRANGE
    const logicalPath = '/episode/page-template';
    // ACT
    const url = localizePath(logicalPath, 'de');
    // ASSERT
    expect(url).toBe('/de/episode/page-template');
  });

  it('switches to the same logical page in the other locale', () => {
    // ARRANGE
    const english = '/episode/page-template';
    const german = '/de/episode/page-template';
    // ACT
    const toGerman = switchLocalePath(english, 'de');
    const toEnglish = switchLocalePath(german, 'en');
    // ASSERT
    expect(toGerman).toBe('/de/episode/page-template');
    expect(toEnglish).toBe('/episode/page-template');
  });

  it('reads the locale from a pathname', () => {
    // ARRANGE
    const german = '/de/episode/page-template';
    const english = '/episode/page-template';
    // ACT
    const fromGerman = localeFromPathname(german);
    const fromEnglish = localeFromPathname(english);
    // ASSERT
    expect(fromGerman).toBe('de');
    expect(fromEnglish).toBe('en');
  });
});

describe('failure cases', () => {
  it('rejects values that are not supported locales', () => {
    // ARRANGE
    const candidates: unknown[] = ['fr', 'EN', '', undefined, 1];
    // ACT
    const accepted = candidates.filter(isLocale);
    // ASSERT
    expect(accepted).toEqual([]);
  });

  it('does not treat a segment that merely starts with a locale as a prefix', () => {
    // ARRANGE
    const pathname = '/deep/episode';
    // ACT
    const logical = stripLocale(pathname);
    // ASSERT
    expect(logical).toBe('/deep/episode');
  });
});

describe('edge cases', () => {
  it('maps the prefixed locale root to the default root and back', () => {
    // ARRANGE
    const germanRoot = '/de';
    // ACT
    const toEnglish = switchLocalePath(germanRoot, 'en');
    const toGerman = switchLocalePath('/', 'de');
    // ASSERT
    expect(toEnglish).toBe('/');
    expect(toGerman).toBe('/de');
  });

  it('ignores trailing slashes from a trailingSlash export', () => {
    // ARRANGE
    const pathname = '/de/episode/page-template/';
    // ACT
    const logical = stripLocale(pathname);
    // ASSERT
    expect(logical).toBe('/episode/page-template');
  });

  it('switching to the current locale is a no-op', () => {
    // ARRANGE
    const pathname = '/de/episode/page-template';
    // ACT
    const url = switchLocalePath(pathname, 'de');
    // ASSERT
    expect(url).toBe('/de/episode/page-template');
  });
});
