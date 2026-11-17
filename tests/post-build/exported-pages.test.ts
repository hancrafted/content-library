import { describe, expect, it } from 'vitest';
import { resolveBasePath } from './exported-pages';

describe('success cases', () => {
  it("takes the base path from SITE_URL's path", () => {
    // ARRANGE
    const env = { SITE_URL: 'https://example.org/preview/' };
    const expected = '/preview';
    // ACT
    const basePath = resolveBasePath(env);
    // ASSERT
    expect(basePath).toBe(expected);
  });
});

describe('failure cases', () => {
  it('throws on a SITE_URL that is no absolute URL, as the build does, instead of falling back', () => {
    // ARRANGE
    const env = { SITE_URL: 'not a url' };
    const expected = /Invalid URL/;
    // ACT
    const resolve = () => resolveBasePath(env);
    // ASSERT
    expect(resolve).toThrow(expected);
  });
});

describe('edge cases', () => {
  it('prefers NEXT_PUBLIC_BASE_PATH over SITE_URL', () => {
    // ARRANGE
    const env = { NEXT_PUBLIC_BASE_PATH: '/override', SITE_URL: 'https://example.org/preview' };
    const expected = '/override';
    // ACT
    const basePath = resolveBasePath(env);
    // ASSERT
    expect(basePath).toBe(expected);
  });
});
