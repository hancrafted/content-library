import { describe, expect, it } from 'vitest';
import { pageMetadata, resolveSiteUrl, siteMetadata } from './page-metadata.pure';

describe('success cases', () => {
  it('points the canonical at the page in its own locale', () => {
    // ARRANGE
    const expected = '/de/episode/page-template';
    // ACT
    const metadata = pageMetadata({ episode: 'page-template' }, 'de');
    // ASSERT
    expect(metadata.alternates?.canonical).toBe(expected);
  });

  it('lists every locale and x-default as alternates, identical from either locale', () => {
    // ARRANGE
    const expected = {
      en: '/episode/page-template',
      de: '/de/episode/page-template',
      'x-default': '/episode/page-template',
    };
    // ACT
    const fromEnglish = pageMetadata({ episode: 'page-template' }, 'en').alternates?.languages;
    const fromGerman = pageMetadata({ episode: 'page-template' }, 'de').alternates?.languages;
    // ASSERT
    expect(fromEnglish).toEqual(expected);
    expect(fromGerman).toEqual(expected);
  });

  it('takes title and description from the locale catalog', () => {
    // ARRANGE
    const expectedTitle = 'Seitenvorlage';
    // ACT
    const metadata = pageMetadata({ episode: 'page-template' }, 'de');
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
