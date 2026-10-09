import { MODALS_DATA, ROLES_DATA } from '@/components/episode/markdown-roles-data.pure';
import {
  MAINTAINING_CONTEXT,
  contextFor,
  type MaintainingSlideKey,
  type SectionsT,
} from '@/components/episodes/maintaining-markdown-for-ai/context';
import {
  googleOkf,
  steeringTheAi,
  theVerifyingHalfIsYours,
} from '@/components/episodes/maintaining-markdown-for-ai/slides-steering';
import {
  markdownInAiWorkflows,
  volumeOutrunsReview,
  whereTheEffortGoes,
} from '@/components/episodes/maintaining-markdown-for-ai/slides-workflows';
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

  it('provides 6 sections with 12 total slides in manuscript order', () => {
    // ARRANGE
    const t: SectionsT = (key: string) => `mock:${key}`;
    const expectedSectionCount = 6;
    const expectedTotalSlides = 12;
    const expectedSections = [
      { slug: 'markdown-in-ai-workflows', pageSlides: 0 },
      { slug: 'volume-outruns-review', pageSlides: 0 },
      { slug: 'where-the-effort-goes', pageSlides: 3 },
      { slug: 'google-okf', pageSlides: 0 },
      { slug: 'steering-the-ai', pageSlides: 3 },
      { slug: 'the-verifying-half-is-yours', pageSlides: 0 },
    ];

    // ACT
    const sections = [
      markdownInAiWorkflows(t),
      volumeOutrunsReview(t),
      whereTheEffortGoes(t),
      googleOkf(t),
      steeringTheAi(t),
      theVerifyingHalfIsYours(t),
    ];
    const totalSlides = sections.reduce((acc, sec) => acc + 1 + sec.slides.length, 0);
    const mapped = sections.map((s) => ({
      slug: s.slug,
      pageSlides: s.slides.length,
    }));

    // ASSERT
    expect(sections).toHaveLength(expectedSectionCount);
    expect(totalSlides).toBe(expectedTotalSlides);
    expect(mapped).toEqual(expectedSections);
  });

  it('defines 12 context entries matching all 12 slides with valid notes and targets', () => {
    // ARRANGE
    const keys = Object.keys(MAINTAINING_CONTEXT) as MaintainingSlideKey[];
    const expectedContextEntries = 12;
    const read = (path: string) => `str:${path}`;

    // ACT
    const results = keys.map((key) => contextFor(read, key));

    // ASSERT
    expect(keys).toHaveLength(expectedContextEntries);
    for (const result of results) {
      expect(result.anchor).toBeTruthy();
      expect(result.notes.length).toBeGreaterThan(0);
      for (const note of result.notes) {
        expect(note.slug).toBeTruthy();
        expect(note.header).toMatch(/^str:/);
        expect(note.description).toMatch(/^str:/);
        expect(note.target).toBeTruthy();
      }
    }
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
  it('returns empty voiceScript when no segments are authored', () => {
    // ARRANGE
    const key = 'markdown-in-ai-workflows';
    const read = (path: string) => `str:${path}`;

    // ACT
    const context = contextFor(read, key);

    // ASSERT
    expect(context.voiceScript).toEqual([]);
  });
});
