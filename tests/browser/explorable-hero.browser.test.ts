import { expect, test, type Page } from '@playwright/test';
import { hydrated } from './hydrated';

/*
 * The Explorable pages' hero (Message drift behind the Title slide): its pause button, its reduced-motion end state and
 * the way it stops when its Slide is not the active one. Waits on the page's own `data-hero-motion`, never on time.
 */

const PAGES = ['context-window', 'human-in-the-loop', 'ai-disciplines'];
const BUTTON = '[data-hero-motion-button]';
const CANVAS = '[data-hero-motion]';

async function openHero(page: Page, slug: string, path = '') {
  await page.goto(`${path}/explorables/${slug}/`);
  await hydrated(page.locator(BUTTON));
}

/** The pixels of the canvas that are orange: the subject beat, the only accent in the background. */
const orangePixels = (page: Page) =>
  page.locator(CANVAS).evaluate((canvas: HTMLCanvasElement) => {
    const data = canvas.getContext('2d')?.getImageData(0, 0, canvas.width, canvas.height).data ?? [];
    let count = 0;
    for (let i = 0; i < data.length; i += 4) if (data[i] > data[i + 2] + 40 && data[i + 3] > 20) count++;
    return count;
  });

test.describe('success cases', () => {
  for (const slug of PAGES) {
    test(`${slug}: the pause button stops the background and names the way back`, async ({ page }) => {
      // ARRANGE
      await openHero(page, slug);
      const button = page.locator(BUTTON);
      await expect(page.locator(CANVAS)).toHaveAttribute('data-hero-motion', 'running');
      // ACT
      await button.click();
      // ASSERT
      await expect(page.locator(CANVAS)).toHaveAttribute('data-hero-motion', 'paused');
      await expect(button).toHaveAttribute('aria-pressed', 'true');
      await expect(button).toHaveAccessibleName(/play/i);
    });

    test(`${slug}: the pause button plays the background again`, async ({ page }) => {
      // ARRANGE
      await openHero(page, slug);
      const button = page.locator(BUTTON);
      await button.click();
      await expect(page.locator(CANVAS)).toHaveAttribute('data-hero-motion', 'paused');
      // ACT
      await button.click();
      // ASSERT
      await expect(page.locator(CANVAS)).toHaveAttribute('data-hero-motion', 'running');
      await expect(button).toHaveAttribute('aria-pressed', 'false');
    });
  }

  test('human-in-the-loop in German: the button is named in German', async ({ page }) => {
    // ARRANGE
    await openHero(page, 'human-in-the-loop', '/de');
    // ACT
    const name = page.locator(BUTTON);
    // ASSERT
    await expect(name).toHaveAccessibleName(/pausieren/i);
  });
});

test.describe('failure cases', () => {
  test('reduced motion loads a still end state: no loop, button disabled and pressed, the checked Human bubble drawn', async ({
    page,
  }) => {
    // ARRANGE
    await page.emulateMedia({ reducedMotion: 'reduce' });
    // ACT
    await openHero(page, 'human-in-the-loop');
    // ASSERT
    await expect(page.locator(CANVAS)).toHaveAttribute('data-hero-motion', 'reduced');
    await expect(page.locator(BUTTON)).toBeDisabled();
    await expect(page.locator(BUTTON)).toHaveAttribute('aria-pressed', 'true');
    await expect.poll(() => orangePixels(page)).toBeGreaterThan(0);
  });

  test('reduced motion forgets the Context bubble: none of the accent is drawn', async ({ page }) => {
    // ARRANGE
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openHero(page, 'context-window');
    await expect(page.locator(CANVAS)).toHaveAttribute('data-hero-motion', 'reduced');
    // ACT
    const orange = await orangePixels(page);
    // ASSERT
    expect(orange).toBe(0);
  });

  test('a live change to reduced motion stills a running background', async ({ page }) => {
    // ARRANGE
    await openHero(page, 'ai-disciplines');
    await expect(page.locator(CANVAS)).toHaveAttribute('data-hero-motion', 'running');
    // ACT
    await page.emulateMedia({ reducedMotion: 'reduce' });
    // ASSERT
    await expect(page.locator(CANVAS)).toHaveAttribute('data-hero-motion', 'reduced');
  });
});

test.describe('edge cases', () => {
  test('the background stops when its Slide is not the active one', async ({ page }) => {
    // ARRANGE
    await openHero(page, 'ai-disciplines');
    await expect(page.locator(CANVAS)).toHaveAttribute('data-hero-motion', 'running');
    // ACT
    await page.locator('[data-slide]#about').scrollIntoViewIfNeeded();
    // ASSERT
    await expect(page.locator(CANVAS)).toHaveCount(0);
  });

  test('the background runs again on return to its Slide', async ({ page }) => {
    // ARRANGE
    await openHero(page, 'ai-disciplines');
    await page.locator('[data-slide]#about').scrollIntoViewIfNeeded();
    await expect(page.locator(CANVAS)).toHaveCount(0);
    // ACT
    await page.evaluate(() => window.scrollTo(0, 0));
    // ASSERT
    await expect(page.locator(CANVAS)).toHaveAttribute('data-hero-motion', 'running');
  });

  test('a phone gets the whole hero: no horizontal overflow and a pause button of at least 44 by 44', async ({
    page,
  }) => {
    // ARRANGE
    const minimum = 44;
    await page.setViewportSize({ width: 390, height: 844 });
    await openHero(page, 'context-window');
    // ACT
    const box = await page.locator(BUTTON).boundingBox();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    // ASSERT
    expect(box?.width).toBeGreaterThanOrEqual(minimum);
    expect(box?.height).toBeGreaterThanOrEqual(minimum);
    expect(overflow).toBe(0);
  });
});
