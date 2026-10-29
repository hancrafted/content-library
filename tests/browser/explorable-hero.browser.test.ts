import { expect, test, type Page } from '@playwright/test';
import { hydrated } from './hydrated';

/*
 * The Explorable pages' hero (Message drift behind the Title slide): its pause button, its reduced-motion end state and
 * the way it stops when its Slide is not the active one. Waits on the page's own `data-hero-motion`, never on time.
 */

const PAGES = ['context-window', 'human-in-the-loop', 'ai-capability'];
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

/** WCAG's floors: 4.5 for text, 3 for an icon or the logo's glyph. */
const MIN_TEXT = 4.5;
const MIN_ICON = 3;

interface HeaderContrast {
  readonly text: Record<string, number>;
  readonly icons: Record<string, number>;
}

/**
 * Contrast of each header item against what it is drawn on, measured in the page: every ancestor background is
 * composited down to the header and over the tone's paper, so a translucent cell is judged on what shows through.
 */
const headerContrast = (page: Page) =>
  page.evaluate((): HeaderContrast => {
    const rgba = (css: string) => {
      const c = document.createElement('canvas');
      c.width = c.height = 1;
      const g = c.getContext('2d', { willReadFrequently: true });
      if (!g) return [0, 0, 0, 0];
      g.clearRect(0, 0, 1, 1);
      g.fillStyle = css;
      g.fillRect(0, 0, 1, 1);
      const d = g.getImageData(0, 0, 1, 1).data;
      return [d[0], d[1], d[2], d[3] / 255];
    };
    const over = (top: number[], below: number[]) =>
      [0, 1, 2].map((i) => top[i] * top[3] + below[i] * (1 - top[3])).concat([1]);
    const lum = (c: number[]) =>
      [0.2126, 0.7152, 0.0722].reduce((sum, w, i) => {
        const v = c[i] / 255;
        return sum + w * (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
      }, 0);
    const ratio = (a: number[], b: number[]) => {
      const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
      return (hi + 0.05) / (lo + 0.05);
    };
    const paper = rgba(getComputedStyle(document.documentElement).getPropertyValue('--tone-paper'));
    const behind = (el: Element) => {
      let colour = paper;
      const chain: Element[] = [];
      for (let e: Element | null = el; e; e = e.parentElement) {
        chain.push(e);
        if (e.matches('[data-testid="site-header"]')) break;
      }
      for (const e of chain.reverse()) colour = over(rgba(getComputedStyle(e).backgroundColor), colour);
      return colour;
    };
    const textOf = (selector: string) => {
      const el = document.querySelector(selector);
      if (!el) return 0;
      const bg = behind(el);
      return ratio(over(rgba(getComputedStyle(el).color), bg), bg);
    };
    const glyph = document.querySelector('[data-testid="brand-symbol"]');
    const coin = glyph?.querySelector('circle');
    const stroke = glyph?.querySelector('path');
    const logo = coin && stroke ? ratio(rgba(getComputedStyle(stroke).stroke), rgba(getComputedStyle(coin).fill)) : 0;
    return {
      text: {
        nav: textOf('[data-testid="site-header"] nav a[aria-current]'),
        workWithMe: textOf('[data-testid="header-contact"]'),
        selectedLanguage: textOf('[data-testid="locale-en"]'),
        otherLanguage: textOf('[data-testid="locale-de"]'),
      },
      icons: {
        logo,
        selectedTheme: textOf('[data-testid="theme-toggle"] [data-active="true"]'),
        otherTheme: textOf(
          '[data-testid="theme-light"][data-active="false"], [data-testid="theme-dark"][data-active="false"]',
        ),
        social: textOf('[data-testid="site-header"] a[href*="github.com"]'),
      },
    };
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

  for (const scheme of ['light', 'dark'] as const) {
    test(`header items stay visible over the inverse hero in the ${scheme} site theme`, async ({ page }) => {
      // ARRANGE
      await page.emulateMedia({ colorScheme: scheme });
      await openHero(page, 'context-window');
      await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; }' });
      await expect(page.locator('html')).toHaveAttribute('data-page-tone', 'inverse');
      // ACT
      const { text, icons } = await headerContrast(page);
      // ASSERT
      for (const ratio of Object.values(text)) expect(ratio).toBeGreaterThanOrEqual(MIN_TEXT);
      for (const ratio of Object.values(icons)) expect(ratio).toBeGreaterThanOrEqual(MIN_ICON);
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
    await openHero(page, 'ai-capability');
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
    await openHero(page, 'ai-capability');
    await expect(page.locator(CANVAS)).toHaveAttribute('data-hero-motion', 'running');
    // ACT
    await page.locator('[data-slide]#about').scrollIntoViewIfNeeded();
    // ASSERT
    await expect(page.locator(CANVAS)).toHaveCount(0);
  });

  test('the background runs again on return to its Slide', async ({ page }) => {
    // ARRANGE
    await openHero(page, 'ai-capability');
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
    const tolerance = 0.01;
    await page.setViewportSize({ width: 390, height: 844 });
    await openHero(page, 'context-window');
    // ACT
    const box = await page.locator(BUTTON).boundingBox();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    // ASSERT
    expect(box?.width).toBeGreaterThanOrEqual(minimum - tolerance);
    expect(box?.height).toBeGreaterThanOrEqual(minimum - tolerance);
    expect(overflow).toBe(0);
  });

  test('an open Context drawer does not cover the pause button', async ({ page }) => {
    // ARRANGE
    await openHero(page, 'context-window');
    const centre = 2;
    // ACT
    await page.keyboard.press('Alt+n');
    // ASSERT
    await expect(page.locator('[data-slot="title-slide"] h1')).toHaveCSS('max-width', /px/);
    await expect
      .poll(() =>
        page.locator(BUTTON).evaluate((button, half) => {
          const box = button.getBoundingClientRect();
          return button.contains(document.elementFromPoint(box.x + box.width / half, box.y + box.height / half));
        }, centre),
      )
      .toBe(true);
  });
});
