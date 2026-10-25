// FE-011 / #52 Seam 3 post-build check: the type roles reach the exported HTML.
// Every Episode's h1 is in the hero role, a section slide's title in the heading
// role, a page slide's title in the subheading role; and no stylesheet styles
// by Episode (`[data-episode=…]`), since roles are the only way a size differs.

import { type CheerioAPI } from 'cheerio';
import { existsSync, readFileSync } from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';
import legacy from '../../src/design-system/legacy.json';
import { LOCALES, localizePath } from '../../src/lib/locale.pure';
import { EPISODE_SLUGS, episodeRoute } from '../../src/lib/routes';
import { TOOLING_SLUGS } from '../../src/lib/tooling-pages';
import { exportedPage, OUT_DIR } from './exported-pages';
import { cssFiles } from './stylesheets';

/** Episodes whose files predate the token rules (FE-011 §6): their own `[data-episode=…]` palette is exempt until migrated. */
const LEGACY_EPISODES = legacy.globs.flatMap((glob) => /^src\/components\/episodes\/([^/*]+)\//.exec(glob)?.[1] ?? []);

/** Every `[data-episode=…]` selector a stylesheet holds, as its Episode slug. */
function episodeSelectors(css: string): string[] {
  return [...css.replace(/["']/g, '').matchAll(/\[data-episode=([^\]]+)\]/g)].map((match) => match[1]);
}

const EPISODE_PAGES = [...EPISODE_SLUGS, ...TOOLING_SLUGS].flatMap((slug) =>
  LOCALES.map((locale) => ({ url: localizePath(episodeRoute(slug), locale) })),
);

function classesOf($: CheerioAPI, elements: readonly unknown[]): string[][] {
  return elements.map((element) => ($(element as never).attr('class') ?? '').split(/\s+/));
}

/** The class lists of every `tag` heading in the Slides of one kind: a Section's own (first) Slide, or a page Slide (the rest). */
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
    // A walk over zero pages passes silently, so the count is printed as a diagnostic.
    console.info(`type roles: walking ${EPISODE_PAGES.length} Episode pages`);
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
