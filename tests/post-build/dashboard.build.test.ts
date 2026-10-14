import { load } from 'cheerio';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { exportedFile, OUT_DIR } from './exported-pages';

describe('dashboard static contract', () => {
  it('exports an English-only read-only picker page with honest navigation and metadata', () => {
    // ARRANGE
    const file = join(OUT_DIR, exportedFile('/dashboard'));
    const germanFile = join(OUT_DIR, exportedFile('/de/dashboard'));
    const expectedTitle = 'Pipeline dashboard';
    const expectedButton = 'Choose Episode folder';
    const expectedRobots = 'noindex';
    const expectedLangs = ['en', 'x-default'];
    // ACT
    const exists = existsSync(file);
    const germanExists = existsSync(germanFile);
    const $ = load(exists ? readFileSync(file, 'utf8') : '');
    // ASSERT
    expect(exists).toBe(true);
    expect(germanExists).toBe(false);
    expect($('h1').text()).toBe(expectedTitle);
    expect(
      $('main button')
        .map((_, element) => $(element).text())
        .get(),
    ).toEqual([expectedButton]);
    expect($('meta[name="robots"]').attr('content')).toContain(expectedRobots);
    expect(
      $('link[rel="alternate"]')
        .map((_, element) => $(element).attr('hreflang'))
        .get(),
    ).toEqual(expectedLangs);
    expect($('[data-testid="nav-dashboard"]').length).toBe(1);
    expect($('[data-testid="locale-de"]').length).toBe(0);
    expect($('a[href*="/de/dashboard"]').length).toBe(0);
  });

  it('keeps the dashboard out of the German header', () => {
    // ARRANGE
    const file = join(OUT_DIR, exportedFile('/de'));
    const expectedNavCount = 0;
    // ACT
    const $ = load(readFileSync(file, 'utf8'));
    // ASSERT
    expect($('[data-testid="nav-dashboard"]').length).toBe(expectedNavCount);
    expect($('a[href*="/de/dashboard"]').length).toBe(expectedNavCount);
  });
});
