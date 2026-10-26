// Post-build check of the Explorable explanations tooling page (/episodes/explorable-explanations): one Section per
// cornerstone, each Slide with its own anchor and the Episode chrome, and the tooling pages moved from the landing
// page to the bottom of /episodes.

import { describe, expect, it } from 'vitest';
import { episodeRoute } from '../../src/content-store/catalogue/record-routes';
import { LOCALES, localizePath } from '../../src/shared/lib/locale.pure';
import { ROUTES } from '../../src/shared/lib/static-routes';
import { exportedPage, resolveBasePath } from './exported-pages';

const basePath = resolveBasePath();
const href = (route: string, locale: (typeof LOCALES)[number]) => `${basePath}${localizePath(route, locale)}/`;

describe('/episodes/explorable-explanations', () => {
  it.each(LOCALES)(
    'shows each cornerstone Slide under its own anchor, inside the Episode container, for %s',
    (locale) => {
      // ARRANGE
      const $ = exportedPage(localizePath(episodeRoute('explorable-explanations'), locale));
      const expected = {
        anchors: [
          'top',
          'context-window',
          'context-window--every-part-and-control',
          'agentic-workflows',
          'agentic-workflows--human-in-the-loop',
        ],
        cornerstone: ['gallery-full'],
      };
      // ACT
      const anchors = $('[data-slide]')
        .toArray()
        .map((slide) => $(slide).attr('data-slide'));
      const cornerstone = $('[data-cornerstone]')
        .toArray()
        .map((part) => $(part).attr('data-cornerstone'));
      // ASSERT
      expect({ anchors, cornerstone }).toEqual(expected);
      expect($('[data-testid="episode-page"]').length).toBe(1);
    },
  );
});

describe('the tooling pages', () => {
  it.each(LOCALES)('sit at the bottom of /episodes, the Explorable explanations page among them, for %s', (locale) => {
    // ARRANGE
    const $ = exportedPage(localizePath(ROUTES.episodes, locale));
    const expected = [
      href(episodeRoute('episode-template'), locale),
      href(episodeRoute('workshop-template'), locale),
      href(episodeRoute('slide-master'), locale),
      href(episodeRoute('explorable-explanations'), locale),
    ];
    // ACT
    const links = $('[data-reference-links] a')
      .toArray()
      .map((link) => $(link).attr('href'));
    // ASSERT
    expect(links).toEqual(expected);
  });

  it.each(LOCALES)('are gone from the landing page for %s', (locale) => {
    // ARRANGE
    const $ = exportedPage(localizePath(ROUTES.home, locale));
    // ACT
    const links = $(
      '#episodes a[data-testid="landing-page-link"], #episodes a[data-testid="landing-slide-master-link"]',
    );
    // ASSERT
    expect(links.length).toBe(0);
  });
});
