import { describe, expect, it } from 'vitest';
import { resolveSiteUrl } from './site-url.pure';

describe('success cases', () => {
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
});
