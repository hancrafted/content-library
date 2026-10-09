import { load, type CheerioAPI } from 'cheerio';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { LOCALES, localizePath } from '../../src/lib/locale.pure';
import { ROUTES } from '../../src/lib/routes';
import { exportedFile, OUT_DIR } from './exported-pages';

const LANDING_PAGES = LOCALES.map((locale) => ({
  locale,
  url: localizePath(ROUTES.home, locale),
}));

function getPage(url: string): CheerioAPI {
  const content = readFileSync(join(OUT_DIR, exportedFile(url)), 'utf8');
  return load(content);
}

describe('landing page post-build structure', () => {
  beforeAll(() => {
    if (!existsSync(OUT_DIR)) {
      throw new Error(`No out/ directory at ${OUT_DIR} — run \`npm run build\` before \`npm run test:build\`.`);
    }
  });

  it.each(LANDING_PAGES)('renders the complete landing structure for locale $locale', ({ url }) => {
    const $ = getPage(url);

    // Root container
    expect($('main[data-testid="landing-page"]').length).toBe(1);

    // Blurry liquid ink transition filter definition
    expect($('#ink-edge-liquid').length).toBe(1);

    // Services / horizontal rail section
    expect($('#services').length).toBe(1);

    // All 5 framework slides present in the HTML
    const desktopSlides = $('#services [data-method="true"] article[data-method-slide]');
    expect(desktopSlides.length).toBe(5);

    const steps = desktopSlides.map((_, el) => $(el).attr('data-method-slide')).get();
    expect(steps).toEqual(['01', '02', '03', '04', '05']);

    // About: six story cards on the matrix, after the method rail; the bridge placeholder is gone
    expect($('#about [data-story-matrix] article[data-story-cell]').length).toBe(6);
    expect($('#narrative-bridge').length).toBe(0);
    const chapters = $('main [data-chapter]')
      .map((_, el) => $(el).attr('data-chapter'))
      .get();
    expect(chapters).toEqual(['02', '03', '04']);
  });

  it.each(LANDING_PAGES)('renders all available episode cards for locale $locale', ({ url, locale }) => {
    const $ = getPage(url);
    const episodeLinks = $('#episodes a')
      .map((_, el) => $(el).attr('href'))
      .get();
    const expected = ['amnesiac-freelancer', 'maintaining-markdown-for-ai', 'ai-token-economy', 'page-template'].map(
      (slug) => (locale === 'de' ? `/de/episode/${slug}/` : `/episode/${slug}/`),
    );

    expect(episodeLinks).toEqual(expected);
  });
});
