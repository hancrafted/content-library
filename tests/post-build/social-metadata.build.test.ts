// FE-008 §6 post-build check: social cards and structured data as crawlers see them in the built HTML.

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { exportedPage, OUT_DIR } from './exported-pages';

const jsonLd = (url: string) =>
  exportedPage(url)('script[type="application/ld+json"]')
    .toArray()
    .map((node) => JSON.parse(exportedPage(url)(node).text()) as { '@graph': { '@type': string }[] });
const meta = (url: string, property: string) =>
  exportedPage(url)(`meta[property="${property}"], meta[name="${property}"]`);

describe('social cards', () => {
  it('ships the fallback image and points every card at it, absolute', () => {
    // ARRANGE
    const urls = ['/', '/de', '/episodes/ai-attention-span', '/de/episodes/ai-attention-span'];
    // ACT
    const images = urls.map((url) => meta(url, 'og:image').attr('content'));
    // ASSERT
    expect(existsSync(join(OUT_DIR, 'og-image.png'))).toBe(true);
    for (const image of images) expect(image).toMatch(/^https?:\/\/.+\/og-image\.png$/);
    expect(meta('/', 'twitter:card').attr('content')).toBe('summary_large_image');
  });

  it('types the landing page as a website and an Episode as an article, with locales', () => {
    // ARRANGE / ACT / ASSERT
    expect(meta('/', 'og:type').attr('content')).toBe('website');
    expect(meta('/de', 'og:locale').attr('content')).toBe('de_DE');
    expect(meta('/episodes/ai-attention-span', 'og:type').attr('content')).toBe('article');
    expect(meta('/episodes/ai-attention-span', 'og:locale:alternate').attr('content')).toBe('de_DE');
  });
});

describe('structured data', () => {
  it('gives the landing page a Person and a WebSite', () => {
    // ARRANGE / ACT
    const types = jsonLd('/').flatMap((block) => block['@graph'].map((node) => node['@type']));
    // ASSERT
    expect(types).toEqual(['Person', 'WebSite']);
  });

  it('gives a published Episode an Article, with a VideoObject only where a recording exists', () => {
    // ARRANGE / ACT
    const withVideo = jsonLd('/episodes/ai-token-economy').flatMap((block) => block['@graph'].map((n) => n['@type']));
    const withoutVideo = jsonLd('/episodes/ai-attention-span').flatMap((block) =>
      block['@graph'].map((n) => n['@type']),
    );
    // ASSERT
    expect(withVideo).toEqual(['Article', 'VideoObject']);
    expect(withoutVideo).toEqual(['Article']);
  });
});
