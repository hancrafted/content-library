import { expect, test } from '@playwright/test';
import { violations } from './axe';

/*
 * The browser lane (`npm run test:browser`): axe-core over the landing page and the three
 * workshop Episodes and the two Explorable explanation pages (every Context Preset), light and dark, against the built export served by Playwright's `webServer`. Serious and critical
 * violations fail; moderate and minor ones are only printed.
 */

const PAGES = [
  '/',
  '/episodes/onboard-ai-every-time/',
  '/episodes/ai-attention-span/',
  '/episodes/ai-gives-you-more-work/',
  '/explorables/context-window/',
  '/explorables/human-in-the-loop/',
];
const THEMES = ['light', 'dark'] as const;
const SETTLE = 15_000;
const BLOCKING = ['serious', 'critical'];

const blocking = (found: string[]) => found.filter((line) => BLOCKING.some((impact) => line.startsWith(impact)));

test.describe('success cases', () => {
  for (const route of PAGES) {
    for (const theme of THEMES) {
      test(`has no serious or critical axe violation on ${route} in ${theme}`, async ({ page }) => {
        // ARRANGE
        await page.emulateMedia({ colorScheme: theme });
        const expected: string[] = [];
        // ACT
        await page.goto(route);
        await expect(page.locator('main')).toBeVisible();
        // ASSERT
        // Entrance fades and pulses repaint colours for a moment: poll until the page has settled, the last read decides.
        await expect.poll(async () => blocking(await violations(page)), { timeout: SETTLE }).toEqual(expected);
        const minor = (await violations(page)).filter((line) => !blocking([line]).length);
        if (minor.length > 0) console.info(`${route} (${theme}) non-blocking:\n${minor.join('\n')}`);
      });
    }
  }
});

test.describe('failure cases', () => {
  test('reports an image with no alternative text as a critical violation', async ({ page }) => {
    // ARRANGE
    await page.setContent(
      '<!doctype html><html lang="en"><title>Fixture</title><main><h1>Fixture</h1><img src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" width="10" height="10"></main>',
    );
    const expected = ['critical image-alt: img'];
    // ACT
    const found = await violations(page);
    // ASSERT
    expect(blocking(found)).toEqual(expected);
  });
});

test.describe('edge cases', () => {
  test('leaves the decorative badges out of the contrast rule only', async ({ page }) => {
    // ARRANGE
    await page.setContent(
      '<!doctype html><html lang="en"><title>Fixture</title><main><h1>Fixture</h1><p data-a11y-decorative style="color:#ccc;background:#fff">Day 1</p></main>',
    );
    const expected: string[] = [];
    // ACT
    const found = await violations(page);
    // ASSERT
    expect(found).toEqual(expected);
  });
});
