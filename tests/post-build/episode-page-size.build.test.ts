// The Iceberg Episode's page weight (feedback-2 grill, decisions 18 and 31 "Load"): its exported HTML, scenery and
// Slide transitions inlined, in each locale, stays no larger than `main` exported it on 2026-11-14 (2e5abc74), in
// bytes. The budgets are hand-written: lowering one is a reviewed choice, raising one is Han's.

import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { exportedFile, OUT_DIR } from './exported-pages';

const ICEBERG = '/episodes/what-lies-below-the-waterline-of-sustainable-ai-skills/';
const BUDGETS = [
  { locale: 'en', url: ICEBERG, maxBytes: 6_550_886 },
  { locale: 'de', url: `/de${ICEBERG}`, maxBytes: 6_721_752 },
] as const;

const pageFile = (url: string) => join(OUT_DIR, exportedFile(url));

describe('success cases', () => {
  it.each(BUDGETS)('exports the $locale Iceberg Episode page no larger than on main', ({ url, maxBytes }) => {
    // ARRANGE
    const file = pageFile(url);
    // ACT
    const bytes = statSync(file).size;
    console.info(`Iceberg Episode page ${url}: ${bytes} bytes of ${maxBytes}`);
    // ASSERT
    expect(bytes).toBeLessThanOrEqual(maxBytes);
  });
});

describe('failure cases', () => {
  it.each(BUDGETS)('finds the $locale page in the export, so a missing file cannot pass as zero bytes', ({ url }) => {
    // ARRANGE
    const file = pageFile(url);
    // ACT
    const exists = existsSync(file);
    // ASSERT
    expect(exists, `no exported page at ${file}; run \`npm run build\` first`).toBe(true);
  });
});

describe('edge cases', () => {
  it('measures real pages, not empty shells, so the budgets guard something', () => {
    // ARRANGE
    const atLeast = 1_000_000;
    // ACT
    const smallest = Math.min(...BUDGETS.map(({ url }) => statSync(pageFile(url)).size));
    // ASSERT
    expect(smallest).toBeGreaterThan(atLeast);
  });
});
