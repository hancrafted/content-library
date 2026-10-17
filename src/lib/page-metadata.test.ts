import { describe, expect, it } from 'vitest';
import { pageMetadata, resolveSiteUrl, siteMetadata } from './page-metadata.pure';

/** An Episode's copy as its record hands it to the route. */
const COPY = { title: 'Seitenvorlage', description: 'Diese Episode kopieren.' };

describe('success cases', () => {
  it('exports English-only dashboard metadata without a nonexistent German alternate', () => {
    // ARRANGE
    const expectedCanonical = '/dashboard';
    const expectedLanguages = { en: '/dashboard', 'x-default': '/dashboard' };
    const expectedTitle = 'Pipeline dashboard';
    const expectedRobots = { index: false };
    // ACT
    const metadata = pageMetadata('dashboard', 'en');
    // ASSERT
    expect(metadata.alternates?.canonical).toBe(expectedCanonical);
    expect(metadata.alternates?.languages).toEqual(expectedLanguages);
    expect(metadata.title).toBe(expectedTitle);
    expect(metadata.robots).toEqual(expectedRobots);
  });

  it('points the canonical at the page in its own locale', () => {
    // ARRANGE
    const expected = '/de/episodes/page-template';
    // ACT
    const metadata = pageMetadata({ episode: 'page-template' }, 'de', COPY);
    // ASSERT
    expect(metadata.alternates?.canonical).toBe(expected);
  });

  it('lists every locale and x-default as alternates, identical from either locale', () => {
    // ARRANGE
    const expected = {
      en: '/episodes/page-template',
      de: '/de/episodes/page-template',
      'x-default': '/episodes/page-template',
    };
    // ACT
    const fromEnglish = pageMetadata({ episode: 'page-template' }, 'en', COPY).alternates?.languages;
    const fromGerman = pageMetadata({ episode: 'page-template' }, 'de', COPY).alternates?.languages;
    // ASSERT
    expect(fromEnglish).toEqual(expected);
    expect(fromGerman).toEqual(expected);
  });

  it("takes an Episode's title and description from the copy its record hands in", () => {
    // ARRANGE
    const expected = { title: 'Seitenvorlage', description: 'Diese Episode kopieren.' };
    // ACT
    const metadata = pageMetadata({ episode: 'page-template' }, 'de', COPY);
    // ASSERT
    expect({ title: metadata.title, description: metadata.description }).toEqual(expected);
  });

  it("takes the landing page's title and description from the locale Translation file", () => {
    // ARRANGE
    const expectedTitle = 'Visualised theory · hancrafted';
    // ACT
    const metadata = pageMetadata('home', 'en');
    // ASSERT
    expect(metadata.title).toBe(expectedTitle);
    expect(metadata.description).toEqual(expect.any(String));
  });

  it('gives the layout the site name and the absolute base, nothing page-specific', () => {
    // ARRANGE
    const siteUrl = 'https://hancrafted.github.io/content-library';
    const expectedBase = 'https://hancrafted.github.io/content-library/';
    const expectedTitle = { default: 'hancrafted', template: '%s · hancrafted' };
    // ACT
    const metadata = siteMetadata('en', siteUrl);
    // ASSERT
    expect(String(metadata.metadataBase)).toBe(expectedBase);
    expect(metadata.title).toEqual(expectedTitle);
    expect(metadata).not.toHaveProperty('alternates');
    expect(metadata).not.toHaveProperty('description');
  });

  it('uses SITE_URL when the deploy sets it', () => {
    // ARRANGE
    const env = { SITE_URL: 'https://example.com/content-library/' };
    const expected = 'https://example.com/content-library';
    // ACT
    const url = resolveSiteUrl(env);
    // ASSERT
    expect(url).toBe(expected);
  });

  it.each(['en', 'de'] as const)('keeps an upcoming Episode page out of search in %s', (locale) => {
    // ARRANGE
    const expected = { index: false };
    // ACT
    const metadata = pageMetadata({ episode: 'page-template' }, locale, { ...COPY, status: 'upcoming' });
    // ASSERT
    expect(metadata.robots).toEqual(expected);
  });

  it.each(['published', undefined] as const)('leaves a page with status %s indexable', (status) => {
    // ARRANGE
    const expected = undefined;
    // ACT
    const metadata = pageMetadata({ episode: 'page-template' }, 'en', { ...COPY, status });
    // ASSERT
    expect(metadata.robots).toBe(expected);
  });
});

describe('failure cases', () => {
  it('rejects a SITE_URL that is not an absolute URL', () => {
    // ARRANGE
    const env = { SITE_URL: 'hancrafted.github.io/content-library' };
    const expected = /SITE_URL/;
    // ACT
    const resolve = () => resolveSiteUrl(env);
    // ASSERT
    expect(resolve).toThrow(expected);
  });
});

describe('edge cases', () => {
  it('falls back to localhost under the base path when SITE_URL is unset', () => {
    // ARRANGE
    const env = { NEXT_PUBLIC_BASE_PATH: '/content-library' };
    const expected = 'http://localhost:3000/content-library';
    // ACT
    const url = resolveSiteUrl(env);
    // ASSERT
    expect(url).toBe(expected);
  });

  it('treats an empty SITE_URL as unset', () => {
    // ARRANGE
    const env = { SITE_URL: '' };
    const expected = 'http://localhost:3000';
    // ACT
    const url = resolveSiteUrl(env);
    // ASSERT
    expect(url).toBe(expected);
  });

  it('keeps the bare root as the home canonical of the default locale', () => {
    // ARRANGE
    const expected = '/';
    // ACT
    const metadata = pageMetadata('home', 'en');
    // ASSERT
    expect(metadata.alternates?.canonical).toBe(expected);
  });
});
