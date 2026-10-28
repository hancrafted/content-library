import { expect, test, type Locator, type Page, type TestInfo } from '@playwright/test';
import { violations } from './axe';

/*
 * The Explorable floor (`docs/features/explorables/README.md`, `npm run test:browser`): one suite holds every Explorable page to
 * the floor, run against the page's `#play` Slide, where every option is on. A new Explorable page adds a name to PAGES and
 * needs no new spec. A case a page fails and that is too large to fix here is listed in EXPECTED_FAIL with the URL of
 * its follow-up issue.
 */

const PAGES = ['context-window', 'human-in-the-loop', 'ai-disciplines'];
const WIDTHS = [390, 1440] as const;
const HEIGHT = 900;
const SETTLE = 15_000;
const BLOCKING = ['serious', 'critical'];

type Floor = 'fits' | 'axe' | 'reduced-motion' | 'offline';
/** `<slug>:<case>` to the follow-up issue that tracks the failure. */
const EXPECTED_FAIL: Readonly<Record<string, string>> = {
  'context-window:axe': 'https://github.com/hancrafted/content-library/issues/422',
  'ai-disciplines:axe': 'https://github.com/hancrafted/content-library/issues/423',
};

/** Opens the page, scrolls its `#play` Slide into view and returns it once it has mounted. */
async function openPlaySlide(page: Page, slug: string): Promise<Locator> {
  await page.goto(`/explorables/${slug}/`);
  const slide = page.locator('[data-slide]#play');
  await slide.scrollIntoViewIfNeeded();
  await expect(slide.locator('article')).toBeVisible();
  return slide;
}

/** How far the page and the Slide's content reach past the viewport, and the Slide's frame (its own width). */
const overflowOf = (page: Page, slide: Locator) =>
  slide.evaluate((el) => {
    const frame = el.getBoundingClientRect();
    const viewport = document.documentElement.clientWidth;
    // A part inside its own horizontal scroller (a carousel) may reach past the frame: the scroller is the fit.
    const clipped = (node: Element, root: Element) => {
      for (let up = node.parentElement; up && up !== root; up = up.parentElement) {
        if (getComputedStyle(up).overflowX !== 'visible') return true;
      }
      return false;
    };
    const widest = [...el.querySelectorAll('*')].reduce((max, node) => {
      const r = node.getBoundingClientRect();
      return r.width > 0 && !node.closest('[aria-hidden="true"]') && !clipped(node, el) ? Math.max(max, r.right) : max;
    }, 0);
    return {
      page: document.documentElement.scrollWidth - viewport,
      content: Math.max(0, Math.round(widest - Math.min(frame.right, viewport))),
    };
  });

/** Marks the case expected to fail when a follow-up issue tracks it; the issue's URL is the reason. */
function expectFloorFail(info: TestInfo, slug: string, name: Floor) {
  const issue = EXPECTED_FAIL[`${slug}:${name}`];
  info.fail(issue !== undefined, issue ?? '');
}

test.describe('success cases', () => {
  for (const slug of PAGES) {
    for (const width of WIDTHS) {
      test(`${slug}: the #play Slide fits its frame at ${width}px with no horizontal overflow`, async ({
        page,
      }, info) => {
        // ARRANGE
        expectFloorFail(info, slug, 'fits');
        await page.setViewportSize({ width, height: HEIGHT });
        const expected = { page: 0, content: 0 };
        // ACT
        const slide = await openPlaySlide(page, slug);
        // ASSERT
        await expect.poll(() => overflowOf(page, slide), { timeout: SETTLE }).toEqual(expected);
      });
    }

    test(`${slug}: the #play Slide has no serious or critical axe violation`, async ({ page }, info) => {
      // ARRANGE
      expectFloorFail(info, slug, 'axe');
      const expected: string[] = [];
      // ACT
      await openPlaySlide(page, slug);
      // ASSERT
      await expect
        .poll(async () => (await violations(page)).filter((l) => BLOCKING.some((i) => l.startsWith(i))), {
          timeout: SETTLE,
        })
        .toEqual(expected);
    });

    test(`${slug}: reduced motion shows the end state of the #play Slide`, async ({ page }, info) => {
      // ARRANGE
      expectFloorFail(info, slug, 'reduced-motion');
      await page.emulateMedia({ reducedMotion: 'reduce' });
      const expected = { unsettled: 0, running: 0 };
      // ACT
      const slide = await openPlaySlide(page, slug);
      // ASSERT
      // The end state is reached: every animating element reports `settled` and the browser runs no animation on the Slide.
      const motions = await slide.locator('[data-motion]').count();
      await expect(slide.locator('[data-motion="settled"]')).toHaveCount(motions, { timeout: SETTLE });
      await expect
        .poll(
          () =>
            slide.evaluate((el) => ({
              unsettled: el.querySelectorAll('[data-motion]:not([data-motion="settled"])').length,
              running: el.getAnimations({ subtree: true }).filter((a) => a.playState === 'running').length,
            })),
          { timeout: SETTLE },
        )
        .toEqual(expected);
    });

    test(`${slug}: the #play Slide renders with every off-origin request blocked`, async ({ page }, info) => {
      // ARRANGE
      expectFloorFail(info, slug, 'offline');
      const origin = new URL(test.info().project.use.baseURL ?? 'http://localhost').origin;
      await page.route(
        (url) => url.protocol.startsWith('http') && url.origin !== origin,
        (route) => route.abort(),
      );
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      const expected: string[] = [];
      // ACT
      const slide = await openPlaySlide(page, slug);
      // ASSERT
      await expect(slide.locator('article')).toBeVisible();
      expect(errors).toEqual(expected);
    });
  }

  for (const slug of PAGES) {
    test(`${slug}: shows play as the first slide and about afterwards`, async ({ page }) => {
      // ARRANGE
      const expected = ['top', 'play', 'about'];
      // ACT
      await page.goto(`/explorables/${slug}/`);
      // ASSERT
      const slides = page.locator('[data-slot="slides"] [data-slide]');
      await expect(slides).toHaveCount(expected.length);
      expect(await slides.evaluateAll((els) => els.map((el) => el.id))).toEqual(expected);
    });
  }

  test('ai-disciplines: the #play Slide shows "Play all"', async ({ page }) => {
    // ARRANGE
    const expected = 'Play all';
    // ACT
    const slide = await openPlaySlide(page, 'ai-disciplines');
    // ASSERT
    await expect(slide.getByRole('button', { name: expected })).toBeVisible({ timeout: SETTLE });
  });
});

test.describe('failure cases', () => {
  test('reports content wider than the viewport as overflow', async ({ page }) => {
    // ARRANGE
    await page.setContent(
      '<!doctype html><html lang="en"><title>Fixture</title><main data-slide><div style="width:3000px">wide</div></main>',
    );
    const expected = { page: true, content: true };
    // ACT
    const found = await overflowOf(page, page.locator('[data-slide]'));
    // ASSERT
    expect({ page: found.page > 0, content: found.content > 0 }).toEqual(expected);
  });
});

test.describe('edge cases', () => {
  test('leaves content inside its own horizontal scroller out of the overflow', async ({ page }) => {
    // ARRANGE
    await page.setContent(
      '<!doctype html><html lang="en"><title>Fixture</title><main data-slide><div style="overflow-x:auto"><div style="width:3000px">wide</div></div></main>',
    );
    const expected = { page: 0, content: 0 };
    // ACT
    const found = await overflowOf(page, page.locator('[data-slide]'));
    // ASSERT
    expect(found).toEqual(expected);
  });
});
