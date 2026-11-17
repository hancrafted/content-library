// decision: FE-005 §5
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { EXPORTED_PAGES, exportedFile, OUT_DIR } from './exported-pages';

describe('static export', () => {
  beforeAll(() => {
    if (!existsSync(OUT_DIR)) {
      throw new Error(`No out/ directory at ${OUT_DIR} — run \`npm run build\` before \`npm run test:build\`.`);
    }
  });

  it('writes a file in out/ for every page URL the app derives', () => {
    // ARRANGE
    const expectedFiles = EXPORTED_PAGES.map((page) => exportedFile(page.url));
    // ACT
    const missing = expectedFiles.filter((file) => !existsSync(join(OUT_DIR, file)));
    console.info(
      `static export: walked ${expectedFiles.length} pages, ${missing.length} missing, since a walk over none passes silently`,
    );
    // ASSERT
    expect(missing).toEqual([]);
  });
});
