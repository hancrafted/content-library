import { episodeRefOf, explorablePageRef, guideRef, templateRef } from '@/content-store/catalogue/episode-id.pure';
import {
  EPISODE_IDS,
  EXPLORABLE_PAGE_SLUGS,
  GUIDE_SLUGS,
  isEpisodeId,
  TEMPLATE_SLUGS,
} from '@/content-store/catalogue/record-routes';
import { describe, expect, it } from 'vitest';
import { entryOf, type ComposedPage } from './composed-page';
import summaries from './page-summaries.generated.json';
import { summaryOf } from './page-summary';

/*
 * The cross-Episode half of the composition lookup (FE-002): the invariants that span pages, read from the page
 * catalogue and the generated summaries `npm run registry` writes beside the registry, never from a composition. What a
 * page's own composition holds (its slug, its own text, its Sections, its header mode, the Playlist anchors into it, its
 * summary in step with it) is an Episode-level check (`composed-page-checks.ts`), run by each page folder's own
 * `episode-checks.test.ts`, so this test imports no Episode.
 */

const CATALOGUE: readonly ComposedPage[] = [
  ...EPISODE_IDS.map((id) => episodeRefOf(id)),
  ...TEMPLATE_SLUGS.map((slug) => templateRef(slug)),
  ...EXPLORABLE_PAGE_SLUGS.map((slug) => explorablePageRef(slug)),
  ...GUIDE_SLUGS.map((slug) => guideRef(slug)),
];

const INDEXED = [
  ...Object.keys(summaries.episodes),
  ...Object.keys(summaries.templates),
  ...Object.keys(summaries.explorablePages),
  ...Object.keys(summaries.guides),
];

describe('success cases', () => {
  it.each(CATALOGUE)('indexes $id, so its page has a summary (else run `npm run registry`)', (page) => {
    // ARRANGE
    const expected = page.id;
    // ACT
    const indexed = INDEXED.filter((id) => id === page.id);
    // ASSERT
    expect(indexed).toEqual([expected]);
  });

  it('indexes no page the catalogue does not list (else run `npm run registry`)', () => {
    // ARRANGE
    const listed = CATALOGUE.map(({ id }) => id).sort();
    // ACT
    const indexed = [...INDEXED].sort();
    // ASSERT
    expect(indexed).toEqual(listed);
  });

  it("reads an Episode's German text from its own folder", () => {
    // ARRANGE
    const expected = 'Warum KI eine seltsame Aufmerksamkeitsspanne hat, die Du managen lernen musst';
    // ACT
    const { title } = summaryOf(episodeRefOf('ai-attention-span')).de;
    // ASSERT
    expect(title).toBe(expected);
  });
});

describe('failure cases', () => {
  it('rejects an unregistered slug in the route check, in the types and in the lookup', () => {
    // ARRANGE
    const unregistered = 'non-existent-episode';
    // ACT
    const valid = isEpisodeId(unregistered);
    // @ts-expect-error
    const lookup = () => summaryOf(episodeRefOf(unregistered));
    // ASSERT
    expect(valid).toBe(false);
    expect(lookup).toThrow(unregistered);
  });

  it('finds no Template for an Episode slug', () => {
    // ARRANGE
    const episode = 'ai-attention-span';
    // ACT
    // @ts-expect-error
    const lookup = () => summaryOf(templateRef(episode));
    // ASSERT
    expect(lookup).toThrow(episode);
  });

  it('names the page and what it lacks when a table holds no entry for it', () => {
    // ARRANGE
    const table = { standalone: {}, 'event-copy': {}, template: { grids: 'grids' }, 'explorable-page': {}, guide: {} };
    const expected = 'No composition is registered for "timelines"';
    // ACT
    const lookup = () => entryOf(table, templateRef('timelines'), 'composition');
    // ASSERT
    expect(lookup).toThrow(expected);
  });
});

describe('edge cases', () => {
  it.each(TEMPLATE_SLUGS)('keeps the Template %s out of the Episode registry, so it is no Episode', (slug) => {
    // ARRANGE
    const expected = false;
    // ACT
    const valid = isEpisodeId(slug);
    // @ts-expect-error
    const lookup = () => summaryOf(episodeRefOf(slug));
    // ASSERT
    expect(valid).toBe(expected);
    expect(lookup).toThrow(slug);
  });

  it('finds no Template for the deleted slide-layouts', () => {
    // ARRANGE
    const deleted = 'slide-layouts';
    // ACT
    // @ts-expect-error
    const lookup = () => summaryOf(templateRef(deleted));
    // ASSERT
    expect(lookup).toThrow(deleted);
  });
});
