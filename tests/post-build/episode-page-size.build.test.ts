// The Iceberg Episode's page weight (feedback-2 grill, decision 18 "Load"): its exported HTML, scenery and Slide
// transitions inlined, stays no larger than 6.5 MB. MB here is 2^20 bytes: on 2026-11-14 `main` exported
// 6,550,886 bytes, which Han read as "today's 6.5 MB", so the decimal reading would fail the page it was taken from.

import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { exportedFile, OUT_DIR } from './exported-pages';

const ICEBERG = '/episodes/what-lies-below-the-waterline-of-sustainable-ai-skills/';
const MEGABYTE = 1024 * 1024;
const BUDGET_BYTES = 6.5 * MEGABYTE;

const pageFile = (url: string) => join(OUT_DIR, exportedFile(url));

describe('success cases', () => {
  it('exports the Iceberg Episode page in no more than 6.5 MB of HTML', () => {
    // ARRANGE
    const file = pageFile(ICEBERG);
    // ACT
    const bytes = statSync(file).size;
    console.info(`Iceberg Episode page: ${bytes} bytes of ${BUDGET_BYTES}`);
    // ASSERT
    expect(bytes).toBeLessThanOrEqual(BUDGET_BYTES);
  });
});

describe('failure cases', () => {
  it('finds the page in the export, so a missing file cannot pass as zero bytes', () => {
    // ARRANGE
    const file = pageFile(ICEBERG);
    // ACT
    const exists = existsSync(file);
    // ASSERT
    expect(exists, `no exported page at ${file}; run \`npm run build\` first`).toBe(true);
  });
});

describe('edge cases', () => {
  it('measures a real page, not an empty shell, so the budget guards something', () => {
    // ARRANGE
    const atLeast = MEGABYTE;
    // ACT
    const bytes = statSync(pageFile(ICEBERG)).size;
    // ASSERT
    expect(bytes).toBeGreaterThan(atLeast);
  });
});
