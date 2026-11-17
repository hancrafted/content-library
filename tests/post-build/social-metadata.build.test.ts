// decision: FE-008 §6.1
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
    // ARRANGE
    const episode = '/episodes/ai-attention-span';
    // ACT
    const landingType = meta('/', 'og:type').attr('content');
    const germanLocale = meta('/de', 'og:locale').attr('content');
    const episodeType = meta(episode, 'og:type').attr('content');
    const episodeAlternate = meta(episode, 'og:locale:alternate').attr('content');
    // ASSERT
    expect(landingType).toBe('website');
    expect(germanLocale).toBe('de_DE');
    expect(episodeType).toBe('article');
    expect(episodeAlternate).toBe('de_DE');
  });
});

describe('one URL per page', () => {
  const nodes = (url: string) => jsonLd(url).flatMap((block) => block['@graph']) as Record<string, unknown>[];
  const cases = [
    ['/', 'WebSite'],
    ['/de', 'WebSite'],
    ['/episodes/ai-attention-span', 'Article'],
    ['/de/episodes/ai-attention-span', 'Article'],
  ] as const;

  it.each(cases)('has canonical, og:url and the JSON-LD url and @id agree at %s', (path, type) => {
    // ARRANGE
    const canonical = exportedPage(path)('link[rel="canonical"]').attr('href');
    // ACT
    const node = nodes(path).find((each) => each['@type'] === type);
    // ASSERT
    expect(canonical).toBeDefined();
    expect(meta(path, 'og:url').attr('content')).toBe(canonical);
    expect(node?.url).toBe(canonical);
    expect(node?.['@id']).toBe(canonical);
  });
});

describe('structured data', () => {
  it('gives the landing page a Person and a WebSite', () => {
    // ARRANGE
    const landing = '/';
    // ACT
    const types = jsonLd(landing).flatMap((block) => block['@graph'].map((node) => node['@type']));
    // ASSERT
    expect(types).toEqual(['Person', 'WebSite']);
  });

  it('gives a published Episode an Article, with a VideoObject only where a recording exists', () => {
    // ARRANGE
    const recorded = '/episodes/ai-token-economy';
    // ACT
    const withVideo = jsonLd(recorded).flatMap((block) => block['@graph'].map((n) => n['@type']));
    const withoutVideo = jsonLd('/episodes/ai-attention-span').flatMap((block) =>
      block['@graph'].map((n) => n['@type']),
    );
    // ASSERT
    expect(withVideo).toEqual(['Article', 'VideoObject']);
    expect(withoutVideo).toEqual(['Article']);
  });
});
