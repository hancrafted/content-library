import { describe, expect, it } from 'vitest';
import {
  isAnySectionActive,
  isLocale,
  isSectionActive,
  localeFromPathname,
  localesAt,
  localizePath,
  stripLocale,
  type Locale,
} from './locale.pure';

const switchLocale = (pathname: string, target: Locale) => localizePath(stripLocale(pathname), target);

describe('success cases', () => {
  it('is active on any of its section paths, in either locale', () => {
    // ARRANGE
    const sections = ['/resources', '/explorable-explanations', '/master-slides'];
    const pathnames = [
      '/resources',
      '/de/resources',
      '/explorable-explanations/context-window',
      '/de/master-slides/grids',
    ];
    // ACT
    const active = pathnames.map((pathname) => isAnySectionActive(pathname, sections));
    // ASSERT
    expect(active).toEqual([true, true, true, true]);
  });

  it('keeps the default locale unprefixed', () => {
    // ARRANGE
    const logicalPath = '/episode/episode-template';
    // ACT
    const url = localizePath(logicalPath, 'en');
    // ASSERT
    expect(url).toBe('/episode/episode-template');
  });

  it('prefixes a non-default locale', () => {
    // ARRANGE
    const logicalPath = '/episode/episode-template';
    // ACT
    const url = localizePath(logicalPath, 'de');
    // ASSERT
    expect(url).toBe('/de/episode/episode-template');
  });

  it('appends a fragment after the localized path', () => {
    // ARRANGE
    const logicalPath = '/episode/episode-template';
    const fragment = 'foundations--why-a-template';
    const expectedEnglish = '/episode/episode-template#foundations--why-a-template';
    const expectedGerman = '/de/episode/episode-template#foundations--why-a-template';
    // ACT
    const english = localizePath(logicalPath, 'en', fragment);
    const german = localizePath(logicalPath, 'de', fragment);
    // ASSERT
    expect(english).toBe(expectedEnglish);
    expect(german).toBe(expectedGerman);
  });

  it('switches to the same logical page in the other locale', () => {
    // ARRANGE
    const english = '/episode/episode-template';
    const german = '/de/episode/episode-template';
    // ACT
    const toGerman = switchLocale(english, 'de');
    const toEnglish = switchLocale(german, 'en');
    // ASSERT
    expect(toGerman).toBe('/de/episode/episode-template');
    expect(toEnglish).toBe('/episode/episode-template');
  });

  it('reads the locale from a pathname', () => {
    // ARRANGE
    const german = '/de/episode/episode-template';
    const english = '/episode/episode-template';
    // ACT
    const fromGerman = localeFromPathname(german);
    const fromEnglish = localeFromPathname(english);
    // ASSERT
    expect(fromGerman).toBe('de');
    expect(fromEnglish).toBe('en');
  });

  it('marks a section active on its pages in either locale', () => {
    // ARRANGE
    const section = '/episode';
    const english = '/episode/episode-template';
    const german = '/de/episode/episode-template';
    // ACT
    const activeInEnglish = isSectionActive(english, section);
    const activeInGerman = isSectionActive(german, section);
    // ASSERT
    expect([activeInEnglish, activeInGerman]).toEqual([true, true]);
  });

  it('offers a page the map names only its own locales, at any trailing slash', () => {
    // ARRANGE
    const localesByRoute = { '/dashboard': ['en'] } as const;
    const expected = [['en'], ['en']];
    // ACT
    const offered = [localesAt('/dashboard', localesByRoute), localesAt('/dashboard/', localesByRoute)];
    // ASSERT
    expect(offered).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('is not active on a page under none of its section paths', () => {
    // ARRANGE
    const sections = ['/resources', '/explorable-explanations', '/master-slides'];
    const pathnames = ['/events/axel', '/episodes/context-window', '/de'];
    // ACT
    const active = pathnames.map((pathname) => isAnySectionActive(pathname, sections));
    // ASSERT
    expect(active).toEqual([false, false, false]);
  });

  it('does not mark a section active on an unrelated page', () => {
    // ARRANGE
    const section = '/episode';
    const pathname = '/de';
    // ACT
    const active = isSectionActive(pathname, section);
    // ASSERT
    expect(active).toBe(false);
  });

  it('does not mark a section active on a sibling that shares its prefix', () => {
    // ARRANGE
    const section = '/episode';
    const pathname = '/episodes-archive';
    // ACT
    const active = isSectionActive(pathname, section);
    // ASSERT
    expect(active).toBe(false);
  });

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
  it('anchors on the prefixed locale root and drops an empty fragment', () => {
    // ARRANGE
    const root = '/';
    const fragment = 'intro';
    const empty = '';
    const expectedAnchored = '/de#intro';
    const expectedBare = '/de';
    // ACT
    const germanRoot = localizePath(root, 'de', fragment);
    const noFragment = localizePath(root, 'de', empty);
    // ASSERT
    expect(germanRoot).toBe(expectedAnchored);
    expect(noFragment).toBe(expectedBare);
  });

  it('maps the prefixed locale root to the default root and back', () => {
    // ARRANGE
    const germanRoot = '/de';
    // ACT
    const toEnglish = switchLocale(germanRoot, 'en');
    const toGerman = switchLocale('/', 'de');
    // ASSERT
    expect(toEnglish).toBe('/');
    expect(toGerman).toBe('/de');
  });

  it('ignores trailing slashes from a trailingSlash export', () => {
    // ARRANGE
    const pathname = '/de/episode/episode-template/';
    // ACT
    const logical = stripLocale(pathname);
    // ASSERT
    expect(logical).toBe('/episode/episode-template');
  });

  it('switching to the current locale is a no-op', () => {
    // ARRANGE
    const pathname = '/de/episode/episode-template';
    // ACT
    const url = switchLocale(pathname, 'de');
    // ASSERT
    expect(url).toBe('/de/episode/episode-template');
  });

  it('offers every locale on a page the map leaves out', () => {
    // ARRANGE
    const localesByRoute = { '/dashboard': ['en'] } as const;
    const expected = ['en', 'de'];
    // ACT
    const offered = localesAt('/de/episodes', localesByRoute);
    // ASSERT
    expect(offered).toEqual(expected);
  });
});
