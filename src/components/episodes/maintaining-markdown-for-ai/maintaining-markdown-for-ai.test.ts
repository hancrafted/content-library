import {
  MODALS_DATA,
  ROLES_DATA,
} from '@/components/episodes/maintaining-markdown-for-ai/client/markdown-roles-data.pure';
import { maintainingMarkdownForAi } from '@/components/episodes/maintaining-markdown-for-ai/maintaining-markdown-for-ai';
import { findEpisode } from '@/components/episodes/registry';
import { pageMetadata } from '@/lib/page-metadata.pure';
import { isEpisodeSlug } from '@/lib/routes';
import { describe, expect, it } from 'vitest';

describe('success cases', () => {
  it('registers maintaining-markdown-for-ai as a valid episode slug and exports its record', () => {
    // ARRANGE
    const expectedSlug = 'maintaining-markdown-for-ai';
    const expectedYoutube = 'YxCVw4bUbW0';

    // ACT
    const valid = isEpisodeSlug(expectedSlug);
    const episode = findEpisode(expectedSlug);

    // ASSERT
    expect(valid).toBe(true);
    expect(episode.slug).toBe(expectedSlug);
    expect(episode.youtube?.en).toBe(expectedYoutube);
  });

  it('produces valid page metadata for en and de', () => {
    // ARRANGE
    const expectedCanonicalEn = '/episode/maintaining-markdown-for-ai';
    const expectedCanonicalDe = '/de/episode/maintaining-markdown-for-ai';

    // ACT
    const metaEn = pageMetadata({ episode: 'maintaining-markdown-for-ai' }, 'en');
    const metaDe = pageMetadata({ episode: 'maintaining-markdown-for-ai' }, 'de');

    // ASSERT
    expect(metaEn.title).toBeTruthy();
    expect(metaEn.description).toBeTruthy();
    expect(metaDe.title).toBeTruthy();
    expect(metaDe.description).toBeTruthy();
    expect(metaEn.alternates?.canonical).toBe(expectedCanonicalEn);
    expect(metaDe.alternates?.canonical).toBe(expectedCanonicalDe);
  });

  it('defines 3 interactive role specifications with matching files and frontmatter', () => {
    // ARRANGE
    const roles = Object.values(ROLES_DATA);

    // ACT
    const count = roles.length;

    // ASSERT
    expect(count).toBe(3);
    for (const r of roles) {
      expect(r.filename).toBeTruthy();
      expect(r.bodyTitle).toBeTruthy();
      expect(r.items.length).toBeGreaterThan(0);
      expect(r.quote).toBeTruthy();
    }
  });

  it('defines 5 card back modals with titles and ledes', () => {
    // ARRANGE
    const modals = Object.values(MODALS_DATA);

    // ACT
    const count = modals.length;

    // ASSERT
    expect(count).toBe(5);
    for (const m of modals) {
      expect(m.title).toBeTruthy();
      expect(m.eyebrow).toBeTruthy();
      expect(m.lede).toBeTruthy();
    }
  });
});

describe('failure cases', () => {
  it('rejects an unlisted episode slug in routes and registry', () => {
    // ARRANGE
    const badSlug = 'unknown-episode-slug';

    // ACT
    const valid = isEpisodeSlug(badSlug);
    const lookup = () => findEpisode(badSlug);

    // ASSERT
    expect(valid).toBe(false);
    expect(lookup).toThrow();
  });
});

describe('edge cases', () => {
  it('composes six Sections in manuscript order, each opened by the Slide that names it', () => {
    // ARRANGE
    const expectedOpeners = [
      'markdown-in-ai-workflows',
      'volume-outruns-review',
      'where-the-effort-goes',
      'google-okf',
      'steering-the-ai',
      'the-verifying-half-is-yours',
    ];
    const expectedSlideCount = 12;

    // ACT
    const { sections } = maintainingMarkdownForAi;
    const openers = sections.map((section) => section[0].slug);
    const slideCount = sections.reduce((count, section) => count + section.length, 0);

    // ASSERT
    expect(openers).toEqual(expectedOpeners);
    expect(slideCount).toBe(expectedSlideCount);
  });
});
