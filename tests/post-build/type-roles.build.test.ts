// decision: FE-011 §3.1
import { type CheerioAPI } from 'cheerio';
import { existsSync, readFileSync } from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';
import legacy from '../../src/shared/design-system/legacy.json';
import { LOCALES, localizePath } from '../../src/shared/lib/locale.pure';
import { EXPORTED_EPISODE_SHAPED_PAGES, exportedPage, OUT_DIR } from './exported-pages';
import { cssFiles } from './stylesheets';

// decision: FE-011 §6.1
const LEGACY_EPISODES = legacy.globs.flatMap(
  (glob) => /^src\/episodes\/(?!components\/)([^/*]+)\//.exec(glob)?.[1] ?? [],
);

function episodeSelectors(css: string): string[] {
  return [...css.replace(/["']/g, '').matchAll(/\[data-episode=([^\]]+)\]/g)].map((match) => match[1]);
}

const EPISODE_PAGES = EXPORTED_EPISODE_SHAPED_PAGES.flatMap(({ route }) =>
  LOCALES.map((locale) => ({ url: localizePath(route, locale) })),
);

function classesOf($: CheerioAPI, elements: readonly unknown[]): string[][] {
  return elements.map((element) => ($(element as never).attr('class') ?? '').split(/\s+/));
}

function titleClasses($: CheerioAPI, kind: 'section' | 'page', tag: 'h2' | 'h3'): string[][] {
  const headings = $('[data-slot="slides"] > section[data-section]')
    .toArray()
    .flatMap((section) => {
      const slides = $(section).children('[data-slide]').toArray();
      return kind === 'section' ? slides.slice(0, 1) : slides.slice(1);
    })
    .flatMap((slide) => $(slide).find(tag).toArray());
  return classesOf($, headings);
}

describe('type roles in the export', () => {
  beforeAll(() => {
    if (!existsSync(OUT_DIR)) {
      throw new Error(`No out/ directory at ${OUT_DIR} — run \`npm run build\` before \`npm run test:build\`.`);
    }
    console.info(`type roles: walking ${EPISODE_PAGES.length} Episode pages, since a walk over none passes silently`);
  });

  describe('success cases', () => {
    it.each(EPISODE_PAGES)('puts the h1 of $url in the hero role', ({ url }) => {
      // ARRANGE
      const hero = 'text-hero';
      const $ = exportedPage(url);
      // ACT
      const titles = classesOf($, $('h1').toArray());
      // ASSERT
      expect(titles.length).toBeGreaterThan(0);
      for (const own of titles) expect(own).toContain(hero);
    });

    it.each(EPISODE_PAGES)('puts section slide titles of $url in the heading role', ({ url }) => {
      // ARRANGE
      const heading = 'text-heading';
      // ACT
      const titles = titleClasses(exportedPage(url), 'section', 'h2');
      // ASSERT
      expect(titles.length).toBeGreaterThan(0);
      for (const own of titles) expect(own).toContain(heading);
    });

    it.each(EPISODE_PAGES)('puts page slide titles of $url in the subheading role', ({ url }) => {
      // ARRANGE
      const subheading = 'text-subheading';
      // ACT
      const titles = titleClasses(exportedPage(url), 'page', 'h3');
      // ASSERT
      for (const own of titles) expect(own).toContain(subheading);
    });
  });

  describe('failure cases', () => {
    it('ships no stylesheet selector that styles by Episode, legacy Episodes aside', () => {
      // ARRANGE
      const sheets = cssFiles(OUT_DIR);
      // ACT
      const hits = sheets.flatMap((file) =>
        episodeSelectors(readFileSync(file, 'utf8'))
          .filter((slug) => !LEGACY_EPISODES.includes(slug))
          .map((slug) => `${file}: [data-episode=${slug}]`),
      );
      // ASSERT
      expect(sheets.length).toBeGreaterThan(0);
      expect(hits).toEqual([]);
    });
  });

  describe('edge cases', () => {
    it('finds Episode pages to check', () => {
      // ARRANGE
      const none = 0;
      // ACT
      const count = EPISODE_PAGES.length;
      // ASSERT
      expect(count).toBeGreaterThan(none);
    });
  });
});
