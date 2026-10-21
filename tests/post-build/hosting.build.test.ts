// Hosting files Cloudflare Pages reads from the root of the export: they must land in out/ and say what the
// hosting doc promises. Pages ignores a malformed rule silently, so the content is asserted, not just the file.

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { resolveSiteUrl } from '../../src/lib/page-metadata.pure';
import { OUT_DIR } from './exported-pages';

const read = (file: string) => readFileSync(join(OUT_DIR, file), 'utf8');

describe('hosting files in the export', () => {
  it('ships _headers and _redirects at the root of out/', () => {
    // ARRANGE
    const files = ['_headers', '_redirects'];
    // ACT
    const missing = files.filter((file) => !existsSync(join(OUT_DIR, file)));
    // ASSERT
    expect(missing).toEqual([]);
  });

  it('caches hashed build output as immutable and sets the basic security headers', () => {
    // ARRANGE
    const expected = [
      '/_next/static/*\n  Cache-Control: public, max-age=31536000, immutable',
      'X-Content-Type-Options: nosniff',
      'Referrer-Policy:',
      'X-Frame-Options:',
      'Permissions-Policy:',
    ];
    // ACT
    const headers = read('_headers');
    // ASSERT
    for (const rule of expected) expect(headers).toContain(rule);
  });

  it('declares no domain-level redirect, which Pages ignores', () => {
    // ARRANGE
    const rules = read('_redirects')
      .split('\n')
      .filter((line) => line.trim() !== '' && !line.startsWith('#'));
    // ACT
    const domainLevel = rules.filter((line) => /^\s*https?:\/\//.test(line));
    // ASSERT
    expect(domainLevel).toEqual([]);
  });

  it('serves a sitemap of the site origin and a robots.txt that points at it', () => {
    // ARRANGE
    const site = resolveSiteUrl(process.env);
    // ACT
    const sitemap = read('sitemap.xml');
    const robots = read('robots.txt');
    // ASSERT
    expect(sitemap).toContain(`<loc>${site}/</loc>`);
    expect(sitemap).toContain(`hreflang="de" href="${site}/de/"`);
    expect(sitemap).not.toContain('/dashboard');
    expect(robots).toContain(`Sitemap: ${site}/sitemap.xml`);
  });
});
