import { load, type CheerioAPI } from 'cheerio';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import nextConfig from '../../next.config';
import { LOCALES, localizePath } from '../../src/lib/locale.pure';
import { ROUTES } from '../../src/lib/routes';
import { exportedFile, OUT_DIR } from './exported-pages';

function resolveBasePath(): string {
  if (process.env.NEXT_PUBLIC_BASE_PATH) return process.env.NEXT_PUBLIC_BASE_PATH;
  if (process.env.SITE_URL) {
    try {
      const pathname = new URL(process.env.SITE_URL).pathname.replace(/\/+$/, '');
      if (pathname) return pathname;
    } catch {
      // ignore
    }
  }
  return nextConfig.basePath ?? '';
}

const basePath = resolveBasePath();

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

    // About remains a destination after the method rail.
    expect($('#about').length).toBe(1);
    expect($('#narrative-bridge').length).toBe(0);

    // The identified sections stand in page order, after the id-less hero
    const sections = $('main > section[id]')
      .map((_, el) => $(el).attr('id'))
      .get();
    expect(sections).toEqual(['episodes', 'services', 'about']);
  });

  it.each(LANDING_PAGES)('shows every About outcome in a collapsible case summary for $locale', ({ url, locale }) => {
    // ARRANGE
    const expected =
      locale === 'de'
        ? {
            outcomes: [
              ['RIB Software', '~5', 'Monate'],
              ['Audi', '30', 'Minuten'],
              ['Selfbits', '5', 'Werke'],
            ],
            newTab: 'neuen Tab',
          }
        : {
            outcomes: [
              ['RIB Software', '~5', 'months'],
              ['Audi', '30', 'minutes'],
              ['Selfbits', '5', 'factories'],
            ],
            newTab: 'new tab',
          };
    const linkedInUrl = 'https://www.linkedin.com/in/han-che/';
    const blankTarget = '_blank';
    const safeRel = ['noopener', 'noreferrer'];
    const caseCount = expected.outcomes.length;
    const initiallyOpenCaseCount = 1;
    const initiallyOpenCaseIndex = 0;
    const openAttribute = 'open';
    const maximumWordsPerSummary = 30;

    // ACT
    const $ = getPage(url);
    const about = $('#about');
    const cases = about.find('article');
    const caseDetails = cases.children('details');
    const caseSummaries = caseDetails.children('summary');
    const openCases = caseDetails.filter('[open]');
    const profile = about.find(`a[href="${linkedInUrl}"]`);

    // ASSERT
    expect(cases.length).toBe(caseCount);
    expected.outcomes.forEach((outcomes, index) => {
      const summaryText = caseSummaries.eq(index).text().replace(/\s+/g, ' ');
      outcomes.forEach((text) => expect(summaryText).toContain(text));
      expect(summaryText.trim().split(/\s+/).length).toBeLessThanOrEqual(maximumWordsPerSummary);
    });
    expect(caseDetails.length).toBe(caseCount);
    expect(caseSummaries.length).toBe(caseCount);
    expect(openCases.length).toBe(initiallyOpenCaseCount);
    expect(caseDetails.eq(initiallyOpenCaseIndex).attr('open')).toBe(openAttribute);
    expect(profile.attr('target')).toBe(blankTarget);
    safeRel.forEach((rel) => expect(profile.attr('rel')).toContain(rel));
    expect(profile.text()).toContain(expected.newTab);
  });

  it.each(LANDING_PAGES)('links the three social profiles from the header for $locale', ({ url, locale }) => {
    // ARRANGE
    const expectedLinks = [
      { id: 'youtube', href: 'https://www.youtube.com/@codeadjacent', name: 'YouTube' },
      { id: 'github', href: 'https://github.com/hancrafted', name: 'GitHub' },
      { id: 'linkedin', href: 'https://www.linkedin.com/in/han-che/', name: 'LinkedIn' },
    ];
    const newTabHint = locale === 'de' ? 'neuen Tab' : 'new tab';
    const blankTarget = '_blank';
    const safeRel = ['noopener', 'noreferrer'];

    // ACT
    const $ = getPage(url);
    const header = $('[data-testid="site-header"]');

    // ASSERT
    expectedLinks.forEach(({ id, href, name }) => {
      const link = header.find(`a[data-testid="social-${id}"]`);
      expect(link.length).toBe(1);
      expect(link.attr('href')).toBe(href);
      expect(link.attr('target')).toBe(blankTarget);
      safeRel.forEach((rel) => expect(link.attr('rel')).toContain(rel));
      expect(link.text()).toContain(name);
      expect(link.text()).toContain(newTabHint);
    });
  });

  it.each(LANDING_PAGES)('keeps the fuller case evidence in native disclosures for $locale', ({ url, locale }) => {
    // ARRANGE
    const expected =
      locale === 'de'
        ? {
            phases: ['Vorher', 'Mein Beitrag', 'Ergebnis'],
            evidence: ['6–8 Wochen', '6 Monaten', '200+', '3 HEPA-Linien', '2 Fabriken', '9 Monaten'],
          }
        : {
            phases: ['Before', 'My contribution', 'Result'],
            evidence: ['6–8 weeks', '6 months', '200+', '3 HEPA lines', '2 factories', '9 months'],
          };
    const expectedCount = 3;

    // ACT
    const $ = getPage(url);
    const cases = $('#about article');
    const caseDetails = cases.children('details');
    const evidenceDetails = caseDetails.find('details');
    const detailText = caseDetails.text();

    // ASSERT
    expect(caseDetails.length).toBe(expectedCount);
    expect(evidenceDetails.length).toBe(expectedCount);
    expected.phases.forEach((phase) => expect(detailText).toContain(phase));
    expected.evidence.forEach((fact) => expect(detailText).toContain(fact));
  });

  const PUBLISHED_SLUGS = ['amnesiac-freelancer', 'maintaining-markdown-for-ai', 'ai-token-economy'];

  function episodeHref(slug: string, locale: string): string {
    return `${basePath}${locale === 'de' ? `/de/episode/${slug}/` : `/episode/${slug}/`}`;
  }

  function hrefsIn($: CheerioAPI, selector: string): (string | undefined)[] {
    return $(`${selector} a`)
      .map((_, el) => $(el).attr('href'))
      .get();
  }

  it.each(LANDING_PAGES)(
    'spotlights the published Episodes by featured rank, and never an upcoming one, for locale $locale',
    ({ url, locale }) => {
      const $ = getPage(url);
      const expected = PUBLISHED_SLUGS.map((slug) => episodeHref(slug, locale));

      expect(hrefsIn($, '#episodes [data-episode-spotlight]')).toEqual(expected);
      expect($('#episodes [data-episode-spotlight] [data-spotlight="lead"]').length).toBe(1);
      expect($('#episodes [data-episode-spotlight] [data-episode-status="upcoming"]').length).toBe(0);
    },
  );

  it.each(LANDING_PAGES)(
    'lists every Episode in the browse grid, linking the published ones and no upcoming card, for locale $locale',
    ({ url, locale }) => {
      const $ = getPage(url);
      const expected = PUBLISHED_SLUGS.map((slug) => episodeHref(slug, locale));
      const publishedFirst = $('#episodes [data-episode-browse] [data-episode-card]')
        .map((_, el) => $(el).attr('data-episode-status'))
        .get();

      expect(hrefsIn($, '#episodes [data-episode-browse]')).toEqual(expected);
      expect(publishedFirst).toEqual([...publishedFirst].sort((a, b) => (a === b ? 0 : a === 'published' ? -1 : 1)));
      expect($('#episodes [data-episode-browse] [data-browse-item]').length).toBe(publishedFirst.length);
      expect($('#episodes [data-episode-browse] [data-episode-status="upcoming"] a').length).toBe(0);
      expect($('#episodes [data-episode-browse] [data-episode-status="upcoming"]').length).toBeGreaterThan(0);
    },
  );

  it.each(LANDING_PAGES)(
    'offers topic chips as toggle buttons that start on All, then the template link last, for locale $locale',
    ({ url, locale }) => {
      const $ = getPage(url);
      const chips = $('#episodes [data-browse-controls] button[aria-pressed]');
      const pressed = chips.filter('[aria-pressed="true"]');
      const order = $(
        '#episodes [data-episode-spotlight], #episodes [data-episode-browse], #episodes [data-testid="landing-page-link"]',
      )
        .map((_, el) =>
          el.attribs['data-episode-spotlight'] !== undefined
            ? 'spotlight'
            : el.attribs['data-episode-browse'] !== undefined
              ? 'browse'
              : 'template',
        )
        .get();

      expect(chips.length).toBeGreaterThan(pressed.length);
      expect(pressed.length).toBe(2);
      expect($('#episodes [role="status"]').length).toBe(1);
      expect($('#episodes a[data-testid="landing-page-link"]').attr('href')).toBe(episodeHref('page-template', locale));
      expect(order).toEqual(['spotlight', 'browse', 'template']);
    },
  );
});
