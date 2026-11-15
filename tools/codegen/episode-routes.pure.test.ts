import { describe, expect, it } from 'vitest';
import { episodeRouteFiles, isGeneratedRoute } from './episode-routes.pure.ts';

const ICEBERG = {
  slug: 'what-lies-below-the-waterline-of-sustainable-ai-skills',
  folder: 'what-lies-below-the-waterline-of-sustainable-ai-skills',
  exported: 'whatLiesBelowTheWaterlineOfSustainableAiSkills',
};
const EVENT = '2026-11-16-cyberforum-akademie-hands-on-agentic-workflows';
const EVENT_COPY = { event: EVENT, slug: 'intro', folder: `by-event/${EVENT}/intro`, exported: 'cyberforumIntro' };

/** The text of one generated file. */
function fileAt(routes: Parameters<typeof episodeRouteFiles>[0], path: string): string {
  return episodeRouteFiles(routes).find((file) => file.path === path)?.text ?? '';
}

describe('success cases', () => {
  it("writes an Episode's own page at /episodes/<slug>/ and its prefixed locale's", () => {
    // ARRANGE
    const expected = [
      `src/app/(en)/episodes/${ICEBERG.slug}/page.tsx`,
      `src/app/[locale]/episodes/${ICEBERG.slug}/page.tsx`,
    ];
    // ACT
    const paths = episodeRouteFiles([ICEBERG]).map((file) => file.path);
    // ASSERT
    expect(paths).toEqual(expected);
  });

  it('imports only its own Episode record, and builds the page the catalogue lists at its slug', () => {
    // ARRANGE
    const expected = [
      `import { ${ICEBERG.exported} as episode } from '@/episodes/${ICEBERG.folder}/episode';`,
      `const PAGE_PARAMS = { episode: '${ICEBERG.slug}' };`,
      'episodesPathPageOf(PAGE_PARAMS)',
      'composition={episode}',
      'pageMetadata(',
    ];
    // ACT
    const text = fileAt([ICEBERG], `src/app/(en)/episodes/${ICEBERG.slug}/page.tsx`);
    // ASSERT
    expected.forEach((line) => expect(text).toContain(line));
  });

  it("writes an Episode under its Event at /events/<event>/episodes/<slug>/, from the Event's copy", () => {
    // ARRANGE
    const expected = [
      `import { ${EVENT_COPY.exported} as episode } from '@/episodes/${EVENT_COPY.folder}/episode';`,
      `const PAGE_PARAMS = { event: '${EVENT}', episode: 'intro' };`,
      'eventEpisodePageOf(PAGE_PARAMS)',
      "from '../../../../params';",
      'export const generateStaticParams = prefixedLocaleParams;',
      'export const dynamicParams = false;',
    ];
    // ACT
    const text = fileAt([EVENT_COPY], `src/app/[locale]/events/${EVENT}/episodes/intro/page.tsx`);
    // ASSERT
    expected.forEach((line) => expect(text).toContain(line));
  });
});

describe('failure cases', () => {
  it('refuses two Episodes at one URL', () => {
    // ARRANGE
    const other = { ...ICEBERG, folder: 'another-folder', exported: 'another' };
    // ACT
    const write = () => episodeRouteFiles([ICEBERG, other]);
    // ASSERT
    expect(write).toThrow(ICEBERG.slug);
  });

  it('takes a hand-written route for no generated one', () => {
    // ARRANGE
    const handWritten =
      "import { EpisodeOverviewPage } from '@/page-assembly/episode-overview/episode-overview-page';\n";
    // ACT
    const generated = isGeneratedRoute(handWritten);
    // ASSERT
    expect(generated).toBe(false);
  });
});

describe('edge cases', () => {
  it('knows every route it writes for a generated one, so `npm run registry` can remove it once its page is gone', () => {
    // ARRANGE
    const files = episodeRouteFiles([ICEBERG, EVENT_COPY]);
    // ACT
    const generated = files.filter(({ text }) => isGeneratedRoute(text));
    // ASSERT
    expect(generated).toEqual(files);
  });

  it('writes no route without an Episode page', () => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const files = episodeRouteFiles([]);
    // ASSERT
    expect(files).toEqual(expected);
  });
});
