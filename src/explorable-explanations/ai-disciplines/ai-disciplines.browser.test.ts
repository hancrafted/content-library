import { expect, test, type Page } from '@playwright/test';
import { hydrated } from '../../../tests/browser/hydrated';

/*
 * The browser seam of the disciplines timeline (`npm run test:browser`), on the CyberForum intro in the built export:
 * the grounding Slide shows Preset `timeline`, the check-in-3 recap Preset `recap`. Every wait is a retrying assertion
 * or `data-motion="settled"` on the turning card (ARCH-003 §5). See docs/features/ai-disciplines.md.
 */

const EPISODE = '/events/2026-10-28-cyberforum-akademie-intro-agentic-workflow/episodes/intro/';
const TIMELINE = 'grounding';
const RECAP = 'check-in-3--disciplines-recap';
const AGENTS_SOURCE = 'Anthropic, Building effective agents';
/** An inert ancestor: a face turned away, whose link Tab never reaches. */
const INERT = 'xpath=ancestor::*[@inert]';

/** Opens the Episode at a Slide and waits until the timeline on it is hydrated. */
async function open(page: Page, anchor: string) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(EPISODE);
  await page.locator(`#${anchor}`).scrollIntoViewIfNeeded();
  const slide = page.locator(`#${anchor}`);
  const column = (discipline: string) => slide.locator(`[data-discipline="${discipline}"]`);
  await expect(column('agents')).toBeVisible();
  await hydrated(column('agents').locator('button').first());
  return { slide, column };
}

test.describe('success cases', () => {
  test('clicking a card turns it to the definition with its source', async ({ page }) => {
    // ARRANGE
    const { column } = await open(page, TIMELINE);
    const card = column('agents').locator('[data-flipped]');
    // ACT
    await card.locator('button').first().click();
    // ASSERT
    await expect(card).toHaveAttribute('data-flipped', 'true');
    await expect(card.locator('[data-motion]')).toHaveAttribute('data-motion', 'settled');
    await expect(card.getByRole('link', { name: AGENTS_SOURCE })).toBeVisible();
    await expect(card.getByRole('link', { name: AGENTS_SOURCE }).locator(INERT)).toHaveCount(0);
  });

  test('hovering a discipline lights it and dims the others', async ({ page }) => {
    // ARRANGE
    const { column } = await open(page, TIMELINE);
    // ACT
    await column('workflows').hover();
    // ASSERT
    await expect(column('workflows')).toHaveAttribute('data-on', 'true');
    await expect(column('prompting')).toHaveAttribute('data-on', 'false');
  });
});

test.describe('failure cases', () => {
  test('a card facing front keeps its source link out of the tab order', async ({ page }) => {
    // ARRANGE
    const { column } = await open(page, TIMELINE);
    // ACT
    const inertAround = column('agents').getByRole('link', { name: AGENTS_SOURCE, includeHidden: true }).locator(INERT);
    // ASSERT
    await expect(inertAround).toHaveCount(1);
  });
});

test.describe('edge cases', () => {
  test('the recap lights workflows with nothing hovered', async ({ page }) => {
    // ARRANGE
    const { column } = await open(page, RECAP);
    // ACT
    await page.mouse.move(0, 0);
    // ASSERT
    await expect(column('workflows')).toHaveAttribute('data-on', 'true');
    await expect(column('agents')).toHaveAttribute('data-on', 'false');
  });
});
