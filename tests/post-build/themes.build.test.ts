import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { exportedFile, exportedPage, OUT_DIR } from './exported-pages';

describe('success cases', () => {
  it.each(['/themes/ice-berg', '/de/themes/ice-berg'])(
    'gives every gallery element its own Slide and preserves all its specimens at %s',
    (route) => {
      // ARRANGE
      const expected = [
        ['robot', 7],
        ['pilot', 5],
        ['ship', 5],
        ['captain', 8],
        ['iceberg', 5],
        ['sea-life', 7],
        ['console', 5],
        ['sky', 3],
        ['emote', 19],
        ['ai-agent', 5],
      ];
      const $ = exportedPage(route);
      // ACT
      const elements = $('[data-gallery-item]')
        .toArray()
        .map((element) => [$(element).attr('data-gallery-item'), $(element).find('[data-gallery-variant]').length]);
      const withoutUsage = $('[data-gallery-variant]')
        .toArray()
        .filter(
          (element) => $(element).find('svg[role="img"]').length === 0 || $(element).find('pre code').text() === '',
        );
      // ASSERT
      expect(elements).toEqual(expected);
      expect(withoutUsage).toEqual([]);
    },
  );

  it('exports the Ice berg Theme in English and German', () => {
    // ARRANGE
    const routes = ['/themes/ice-berg', '/de/themes/ice-berg'];
    // ACT
    const missing = routes.filter((route) => !existsSync(join(OUT_DIR, exportedFile(route))));
    // ASSERT
    expect(missing).toEqual([]);
  });
});
