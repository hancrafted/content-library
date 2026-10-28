import { expect, test, type Page } from '@playwright/test';
import { hydrated } from './hydrated';

/*
 * The header's Learn menu (spec #404): a trigger with no page, opened, moved through and closed by keyboard; its
 * entries are announced as links. Below `lg` it shows as a labelled group in the menu panel.
 */

const LEARN = '[data-testid="nav-learn"]';

/** The Events page with the Learn trigger focused and hydrated, so a key press reaches the menu's handlers. */
async function focusLearn(page: Page) {
  await page.goto('/events/');
  const trigger = page.locator(`${LEARN} button`);
  await hydrated(trigger);
  await trigger.focus();
  return trigger;
}

test.describe('success cases', () => {
  test('opens the Learn menu on Enter and shows Episodes and Resources as links', async ({ page }) => {
    // ARRANGE
    const trigger = await focusLearn(page);
    // ACT
    await page.keyboard.press('Enter');
    // ASSERT
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator(LEARN).getByRole('link')).toHaveText(['Episodes', 'Resources']);
  });

  test('moves focus through the Learn links with ArrowDown', async ({ page }) => {
    // ARRANGE
    await focusLearn(page);
    await page.keyboard.press('Enter');
    // ACT
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    // ASSERT
    await expect(page.locator(LEARN).getByRole('link', { name: 'Resources' })).toBeFocused();
  });

  test('closes the Learn menu on Escape', async ({ page }) => {
    // ARRANGE
    const trigger = await focusLearn(page);
    await page.keyboard.press('Enter');
    // ACT
    await page.keyboard.press('Escape');
    // ASSERT
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator(LEARN).getByRole('link', { name: 'Resources' })).toBeHidden();
  });

  test('follows the first Learn link on Enter to the Episodes page', async ({ page }) => {
    // ARRANGE
    await focusLearn(page);
    await page.keyboard.press('Enter');
    await page.keyboard.press('ArrowDown');
    // ACT
    await page.keyboard.press('Enter');
    // ASSERT
    await expect(page).toHaveURL(/\/episodes\/$/);
  });
});

test.describe('failure cases', () => {
  test('keeps the Learn trigger from navigating anywhere', async ({ page }) => {
    // ARRANGE
    const trigger = await focusLearn(page);
    // ACT
    await page.keyboard.press('Enter');
    // ASSERT
    await expect(trigger).toHaveJSProperty('tagName', 'BUTTON');
    await expect(page).toHaveURL(/\/events\/$/);
  });
});

test.describe('edge cases', () => {
  test.use({ viewport: { width: 390, height: 800 } });

  test('shows Learn as a labelled group with its two links in the phone menu panel', async ({ page }) => {
    // ARRANGE
    await page.goto('/events/');
    const menu = page.getByTestId('header-menu');
    await hydrated(menu);
    // ACT
    await menu.click();
    // ASSERT
    const group = page.locator(LEARN);
    await expect(group.getByTestId('nav-learn-label')).toBeVisible();
    await expect(group.getByRole('link')).toHaveText(['Episodes', 'Resources']);
    await expect(group.getByRole('link').first()).toBeVisible();
    await expect(group.locator('button')).toBeHidden();
  });
});
