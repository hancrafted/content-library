// Post-build check for the Research question pages (design-ADR 0016, Citations rule 6): one English page per promoted
// Research question at /research/<id>, showing its confidence with that value's definition, the Concepts it informs,
// its body with every [n] marker linked to its Source, and none under /de. A Concept page lists every Research
// question that informs it.

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CONFIDENCE_DEFINITIONS } from '../../src/lib/confidence.pure';
import { localizePath } from '../../src/lib/locale.pure';
import { RESEARCH_IDS } from '../../src/lib/research-ids';
import { conceptRoute, researchRoute } from '../../src/lib/routes';
import { exportedFile, exportedPage, OUT_DIR } from './exported-pages';

const page = (id: string) => exportedPage(localizePath(researchRoute(id), 'en'));

describe('success cases', () => {
  it.each(RESEARCH_IDS)('A Research page exists at /research/<id> for each promoted question: %s', (id) => {
    // ARRANGE
    const $ = page(id);
    // ACT
    const confidence = $('[data-confidence]').attr('data-confidence') as keyof typeof CONFIDENCE_DEFINITIONS;
    const observed = {
      page: $('[data-research-page]').attr('data-research-page'),
      definition: $('[data-confidence-definition]').text().trim(),
      informs: $('[data-research-informs] a').length,
      sources: $('[data-research-sources] li[id^="source-"]').length,
    };
    // ASSERT
    expect(observed).toMatchObject({ page: id, definition: CONFIDENCE_DEFINITIONS[confidence] });
    expect(observed.informs).toBeGreaterThan(0);
    expect(observed.sources).toBeGreaterThan(0);
  });

  it('links each [n] marker in a Research page to the nth entry of its Sources list', () => {
    // ARRANGE
    const $ = page('LLM-0001');
    const expectedFirst = '#source-1';
    // ACT
    const targets = $('[data-evidence-body] a[data-citation]')
      .toArray()
      .map((link) => $(link).attr('href') ?? '');
    const unmatched = targets.filter((href) => $(href).length === 0);
    // ASSERT
    expect(targets[0]).toBe(expectedFirst);
    expect(unmatched).toEqual([]);
  });

  it('A Concept page lists every Research question that informs it', () => {
    // ARRANGE
    const $ = exportedPage(localizePath(conceptRoute('llm-behaviour'), 'en'));
    const expected = ['LLM-0001', 'LLM-0004'];
    // ACT
    const listed = $('[data-concept-research] [data-research-question]')
      .toArray()
      .map((item) => $(item).attr('data-research-question'));
    // ASSERT
    expect(listed).toEqual(expect.arrayContaining(expected));
  });
});

describe('failure cases', () => {
  it.each(RESEARCH_IDS)('exports no German Research page for %s', (id) => {
    // ARRANGE
    const file = join(OUT_DIR, exportedFile(localizePath(researchRoute(id), 'de')));
    // ACT
    const exists = existsSync(file);
    // ASSERT
    expect(exists).toBe(false);
  });
});

describe('edge cases', () => {
  it('exports no page for a staged Research question', () => {
    // ARRANGE
    const file = join(OUT_DIR, exportedFile(localizePath(researchRoute('LLM-0006'), 'en')));
    // ACT
    const exists = existsSync(file);
    // ASSERT
    expect(exists).toBe(false);
  });
});
