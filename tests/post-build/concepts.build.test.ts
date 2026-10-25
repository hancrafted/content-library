// Post-build check for the Concept pages (design-ADR 0016, Evidence vocabulary): one English page per Concept at
// /concepts/<id>, none under /de, and German Episode cards link the English page marked as English.

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { localizePath } from '../../src/lib/locale.pure';
import { CONCEPT_IDS, conceptRoute, ROUTES } from '../../src/lib/routes';
import { exportedFile, exportedPage, OUT_DIR } from './exported-pages';

const CARD = 'ai-token-economy';

describe('success cases', () => {
  it.each(CONCEPT_IDS)('A Concept page exists at /concepts/<id> for each of the seven: %s', (id) => {
    // ARRANGE
    const url = localizePath(conceptRoute(id), 'en');
    const expected = id;
    // ACT
    const $ = exportedPage(url);
    // ASSERT
    expect($('[data-concept-page]').attr('data-concept-page')).toBe(expected);
    expect($('h1').text().trim()).not.toBe('');
    expect($('[data-evidence-body] p').length).toBeGreaterThan(0);
  });

  it('links each Concept on an English card to its Concept page, unmarked', () => {
    // ARRANGE
    const $ = exportedPage(localizePath(ROUTES.episodes, 'en'));
    const expected = ['/concepts/ai-cost', '/concepts/agentic-ai'];
    // ACT
    const links = $(`[data-episode-slug="${CARD}"] [data-concept] a`);
    const hrefs = links.toArray().map((link) => ($(link).attr('href') ?? '').replace(/\/$/, ''));
    const marks = links.find('[data-concept-in-english]').length;
    // ASSERT
    expect(hrefs.map((href) => href.slice(href.indexOf('/concepts/')))).toEqual(expected);
    expect(marks).toBe(0);
  });
});

describe('failure cases', () => {
  it.each(CONCEPT_IDS)('exports no German Concept page for %s', (id) => {
    // ARRANGE
    const file = join(OUT_DIR, exportedFile(localizePath(conceptRoute(id), 'de')));
    // ACT
    const exists = existsSync(file);
    // ASSERT
    expect(exists).toBe(false);
  });
});

describe('edge cases', () => {
  it('links each Concept on a German card to the English page, marked as English', () => {
    // ARRANGE
    const $ = exportedPage(localizePath(ROUTES.episodes, 'de'));
    const expected = { hrefLang: ['en', 'en'], marks: 2, german: 0 };
    // ACT
    const links = $(`[data-episode-slug="${CARD}"] [data-concept] a`);
    const observed = {
      hrefLang: links.toArray().map((link) => $(link).attr('hreflang')),
      marks: links.find('[data-concept-in-english]').length,
      german: links.toArray().filter((link) => ($(link).attr('href') ?? '').includes('/de/')).length,
    };
    // ASSERT
    expect(observed).toEqual(expected);
  });
});
