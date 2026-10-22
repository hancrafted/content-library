import { load } from 'cheerio';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { exportedFile, exportedPage, OUT_DIR } from './exported-pages';

describe('dashboard static contract', () => {
  it('exports an English-only read-only picker page with honest navigation and metadata', () => {
    // ARRANGE
    const file = join(OUT_DIR, exportedFile('/dashboard'));
    const germanFile = join(OUT_DIR, exportedFile('/de/dashboard'));
    const expectedTitle = 'Content pipeline';
    const expectedButtons = ['Open the demo', 'Choose folder'];
    const expectedRobots = 'noindex';
    const expectedLangs = ['en', 'x-default'];
    const expectedNavigation = ['Episodes', 'Workshops', 'Content pipeline'];
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
    ).toEqual(expectedButtons);
    expect($('meta[name="robots"]').attr('content')).toContain(expectedRobots);
    expect(
      $('link[rel="alternate"]')
        .map((_, element) => $(element).attr('hreflang'))
        .get(),
    ).toEqual(expectedLangs);
    expect($('[data-testid="nav-dashboard"]').length).toBe(1);
    expect($('[data-testid="site-header"]').length).toBe(1);
    expect(
      $('[data-testid="site-nav"] a')
        .map((_, element) => $(element).text())
        .get(),
    ).toEqual(expectedNavigation);
    expect($('[data-testid="site-header"] [data-testid="header-contact"]').length).toBe(1);
    expect($('[data-testid="locale-de"]').length).toBe(0);
    expect($('a[href*="/de/dashboard"]').length).toBe(0);
  });

  it('exports the demo Run without prompts, transcript paths or local ports', () => {
    // ARRANGE
    const folder = join(OUT_DIR, 'dashboard-demo');
    const privateText = ['/Users/', 'transcript_path', 'gen_ai.input.messages', 'spec_port', 'dev_port'];
    // ACT
    const events = readFileSync(join(folder, 'events.jsonl'), 'utf8');
    const pipeline = readFileSync(join(folder, 'pipeline.yml'), 'utf8');
    // ASSERT
    expect(events.length).toBeGreaterThan(0);
    privateText.forEach((text) => {
      expect(events).not.toContain(text);
      expect(pipeline).not.toContain(text);
    });
  });

  it('keeps the dashboard out of the German header', () => {
    // ARRANGE
    const expectedNavCount = 0;
    // ACT
    const $ = exportedPage('/de');
    // ASSERT
    expect($('[data-testid="nav-dashboard"]').length).toBe(expectedNavCount);
    expect($('a[href*="/de/dashboard"]').length).toBe(expectedNavCount);
  });
});
