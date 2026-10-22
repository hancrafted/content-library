import { describe, expect, it } from 'vitest';
import { episodeJsonLd, landingJsonLd } from './structured-data.pure';

const SITE = 'https://hancrafted.net';
const EPISODE = {
  slug: 'ai-attention-span' as const,
  title: 'AI attention span',
  description: 'Why long chats get worse.',
  publishedOn: '2026-10-21' as const,
  youtube: 'abcdefghijk',
};

describe('success cases', () => {
  it('describes the person and the website in the page locale', () => {
    // ARRANGE
    const expectedWebsite = { '@type': 'WebSite', url: `${SITE}/de/`, inLanguage: 'de', name: 'hancrafted' };
    // ACT
    const graph = landingJsonLd(SITE, 'de')['@graph'];
    // ASSERT
    expect(graph).toContainEqual(expect.objectContaining(expectedWebsite));
    expect(graph).toContainEqual(expect.objectContaining({ '@type': 'Person', name: 'Han Che' }));
  });

  it('writes an Article with headline, language, publish date and author', () => {
    // ARRANGE
    const expected = {
      '@type': 'Article',
      headline: 'AI attention span',
      description: 'Why long chats get worse.',
      inLanguage: 'en',
      datePublished: '2026-10-21',
      url: `${SITE}/episodes/ai-attention-span/`,
      author: { '@type': 'Person', name: 'Han Che' },
    };
    // ACT
    const graph = episodeJsonLd(SITE, 'en', EPISODE)?.['@graph'];
    // ASSERT
    expect(graph?.[0]).toMatchObject(expected);
  });

  it('adds a VideoObject only when a recording exists', () => {
    // ARRANGE
    const withoutVideo = { ...EPISODE, youtube: undefined };
    // ACT
    const types = (e: typeof EPISODE | typeof withoutVideo) =>
      episodeJsonLd(SITE, 'en', e)?.['@graph'].map((node) => node['@type']);
    // ASSERT
    expect(types(EPISODE)).toEqual(['Article', 'VideoObject']);
    expect(types(withoutVideo)).toEqual(['Article']);
    expect(episodeJsonLd(SITE, 'en', EPISODE)?.['@graph'][1]).toMatchObject({
      embedUrl: 'https://www.youtube-nocookie.com/embed/abcdefghijk',
      thumbnailUrl: 'https://i.ytimg.com/vi/abcdefghijk/hqdefault.jpg',
      uploadDate: '2026-10-21',
    });
  });
});

describe('failure cases', () => {
  it('gives an unpublished or undated Episode nothing', () => {
    // ARRANGE
    const undated = { ...EPISODE, publishedOn: undefined };
    // ACT
    const data = episodeJsonLd(SITE, 'en', undated);
    // ASSERT
    expect(data).toBeUndefined();
  });
});

describe('edge cases', () => {
  it('leaves the VideoObject out of an Episode without a recording', () => {
    // ARRANGE
    const withoutVideo = { ...EPISODE, youtube: undefined };
    // ACT
    const types = episodeJsonLd(SITE, 'en', withoutVideo)?.['@graph'].map((node) => node['@type']);
    // ASSERT
    expect(types).toEqual(['Article']);
  });
});
