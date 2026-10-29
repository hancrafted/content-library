import { expect, test, type Page } from '@playwright/test';
import { hydrated } from './hydrated';

/*
 * The Resources overview's kind filter (`docs/features/resources.md`, `npm run test:browser`): a chip narrows the
 * overview to one kind and a second click widens it again. Every card stays in the server HTML; the filter only
 * toggles `hidden`, so the visible cards are what a visitor sees.
 */

const KINDS = ['episode', 'event', 'explorable-page', 'guide', 'episode-template', 'master-slide'];
const PATHS = ['/resources/', '/de/resources/'];

const visibleKinds = (page: Page) =>
  page
    .locator('[data-resource-item]:not([hidden]) [data-resource-card]')
    .evaluateAll((cards) => [...new Set(cards.map((card) => card.getAttribute('data-resource-kind') ?? ''))].sort());

test.describe('success cases', () => {
  for (const path of PATHS) {
    for (const kind of KINDS) {
      test(`narrows ${path} to ${kind} when its chip is chosen`, async ({ page }) => {
        // ARRANGE
        await page.goto(path);
        const chip = page.locator(`[data-resource-kind-filter] [data-filter-tag="${kind}"]`);
        await hydrated(chip);
        // ACT
        await chip.click();
        // ASSERT
        await expect.poll(() => visibleKinds(page)).toEqual([kind]);
      });
    }
  }
});

test.describe('failure cases', () => {
  test('shows nothing but the empty line when a search matches no Resource', async ({ page }) => {
    // ARRANGE
    await page.goto('/resources/');
    const search = page.locator('[data-resource-search]');
    await hydrated(search);
    // ACT
    await search.fill('zzzzzz-no-such-resource');
    // ASSERT
    await expect(page.locator('[data-resource-empty="filter"]')).toBeVisible();
    expect(await visibleKinds(page)).toEqual([]);
  });
});

test.describe('edge cases', () => {
  for (const path of PATHS) {
    test(`shows every kind on ${path} before any chip is chosen and again after the chip is chosen twice`, async ({
      page,
    }) => {
      // ARRANGE
      await page.goto(path);
      const chip = page.locator(`[data-resource-kind-filter] [data-filter-tag="${KINDS[0]}"]`);
      await hydrated(chip);
      const expected = [...KINDS].sort();
      // ACT
      await chip.click();
      await chip.click();
      // ASSERT
      await expect.poll(() => visibleKinds(page)).toEqual(expected);
    });
  }
});
