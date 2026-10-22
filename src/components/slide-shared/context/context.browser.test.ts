import { expect, test, type Locator, type Page } from '@playwright/test';
import { settled } from '../../../../tests/browser/settled';

/*
 * The browser seam of Context (`npm run test:browser`, local only until the nightly lands): the Slides Episode's
 * "Every part and control" Slide (`gallery-full`) in the built export, and Slide 5 on the AI attention span Episode.
 * Only the behaviours the user corrected after looking at them are pinned here, each titled in the user's words; the
 * logic under them lives in the `*.pure.test.ts` files beside the parts. Every wait is a retrying assertion or
 * `data-motion="settled"` (ARCH-003 §5). See docs/features/context.md.
 */

const SLIDES = '/episodes/slides/#context-window--every-part-and-control';
const ATTENTION_SPAN = '/episodes/ai-attention-span/#the-ais-attention-span--attention-is-a-budget';
const FULL = 'gallery-full';
const SLIDE_5 = 'slide-5';
/** The Preset opens past the compaction (step 25), too few rows for the Attention cases: they scrub back to this step. */
const SCRUB_TO = 21;
/** The page clock's start: virtual time, so the slow-pace case advances it by hand instead of sleeping. */
const CLOCK_START = new Date('2026-01-01T00:00:00Z');
const MENU = '[data-control="attentionMenu"]';
const POPOVER = '#episode-portal-root [data-slot="attention-menu"]';
const LROW = 'button[class*="lrow"]';
const ATT_ROW = '[class*="attRow"]';
/** Two parts on one row start within this many px of each other. */
const SAME_TOP = 2;
/** Rows pinned at each end of the compressed list, shown whole. */
const EDGE = 3;
const HEIGHT_TOLERANCE = 1.5;

interface Opened {
  readonly root: Locator;
}

/** Opens the Slide mounted and hydrated; the Attention cases scrub back to step 21. */
interface OpenOptions {
  readonly url?: string;
  readonly preset?: string;
  readonly scrub?: boolean;
  readonly clock?: boolean;
}

async function open(page: Page, options: OpenOptions = {}): Promise<Opened> {
  const { url = SLIDES, preset = FULL } = options;
  await page.emulateMedia({ colorScheme: 'light' });
  if (options.clock) await page.clock.install({ time: CLOCK_START });
  await page.goto(url);
  // A Slide mounts when it nears the viewport: scroll to the Context, then wait for its hydration.
  const root = page.locator(`[data-cornerstone="${preset}"]`);
  await root.scrollIntoViewIfNeeded();
  await expect(root).toBeVisible();
  const range = root.locator('input[type=range]');
  await expect
    .poll(() => range.evaluate((el) => Object.keys(el).some((key) => key.startsWith('__reactProps'))))
    .toBe(true);
  if (options.scrub !== false) await scrubBack(root, range);
  return { root };
}

/** Commits step 21 through the range input, as a keyboard or a drag does, and waits for the rows to arrive. */
async function scrubBack(root: Locator, range: Locator) {
  await range.fill(String(SCRUB_TO));
  await expect(root.locator('[data-row]')).toHaveCount(SCRUB_TO);
  await rowsAtRest(root);
}

/** Waits until no Attention row is still moving to its height. */
const rowsAtRest = (root: Locator) => expect(root.locator('[data-row][data-motion="running"]')).toHaveCount(0);

/** The part ids of rows, bubbles and blocks look like `m4` or `m4@2`: the bubble's own id is before the `@`. */
const bubbleOf = (root: Locator, id: string) => root.locator(`[data-role][data-part="${id}"]`);

/** Whether a bubble sits fully inside the chat's scroll box, and whether it is lit. */
const bubbleState = (root: Locator, id: string) =>
  root.evaluate((el, part) => {
    const bubble = el.querySelector(`[data-role][data-part="${part}"]`) as HTMLElement;
    const box = (bubble.parentElement as HTMLElement).getBoundingClientRect();
    const r = bubble.getBoundingClientRect();
    return { inView: r.top >= box.top - 1 && r.bottom <= box.bottom + 1, lit: bubble.hasAttribute('data-on') };
  }, id);

/** Scrolls the chat to the top and returns the id of the last bubble then out of view. */
const scrollChatAway = (root: Locator) =>
  root.evaluate((el) => {
    const box = (el.querySelector('[data-role]') as HTMLElement).parentElement as HTMLElement;
    box.scrollTo({ top: 0, behavior: 'instant' });
    const edge = box.getBoundingClientRect();
    const out = [...box.querySelectorAll('[data-role]:not([hidden])')].filter(
      (bubble) => bubble.getBoundingClientRect().top > edge.bottom,
    );
    return out.at(-1)?.getAttribute('data-part') ?? '';
  });

/** The heights of the compressed list's rows. */
const heightsOf = (root: Locator) =>
  root
    .locator('[data-layout="compressed"] [data-row]')
    .evaluateAll((rows) => rows.map((r) => r.getBoundingClientRect().height));

/** The reasons of the checks that do not hold, so a failing poll names what is wrong. */
const failed = (checks: readonly (readonly [boolean, string])[]) =>
  checks.filter(([holds]) => !holds).map(([, why]) => why);

const sum = (values: readonly number[]) => values.reduce((a, b) => a + b, 0);

/** Switches the Attention layout through the menu, then closes the menu again. */
async function setLayout(page: Page, root: Locator, layout: string) {
  await root.locator(MENU).click();
  await page.locator(`${POPOVER} button[data-layout-option="${layout}"]`).click();
  await page.keyboard.press('Escape');
  await expect(page.locator(POPOVER)).toHaveCount(0);
  await expect(root.locator('[data-layout]')).toHaveAttribute('data-layout', layout);
  await rowsAtRest(root);
}

/** Where the save check's tooltip (its `::after`) lies against the viewport and the popover, and its native titles. */
const tooltipOf = (save: Locator, tip: string) =>
  save.evaluate((b, text) => {
    const r = b.getBoundingClientRect();
    const after = getComputedStyle(b, '::after');
    const popover = document.querySelector('#episode-portal-root [data-slot="attention-menu"]') as HTMLElement;
    const pop = popover.getBoundingClientRect();
    const left = r.left + parseFloat(after.left);
    return {
      left,
      right: left + parseFloat(after.width),
      popLeft: pop.left,
      popRight: pop.right,
      width: innerWidth,
      titled: document.querySelectorAll(`[title="${text}"]`).length,
      content: after.content,
    };
  }, tip);

/** Rests the pointer in the middle of the bar, the bar centred in the viewport clear of the sticky header. */
async function restOnBar(page: Page, root: Locator) {
  const bar = root.locator('[data-roving]').first();
  await bar.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  const box = (await bar.boundingBox()) as { x: number; y: number; width: number; height: number };
  const at = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  await page.mouse.move(at.x, at.y);
  return at;
}

/** Rests the pointer on the bar and waits for the zoom to open. */
async function openZoom(page: Page, root: Locator) {
  const at = await restOnBar(page, root);
  await expect(root.locator(LROW).first()).toBeVisible();
  return at;
}

test.describe('success cases', () => {
  test('keeps the zoom open while the pointer crosses from the bar to it at a slow pace', async ({ page }) => {
    // ARRANGE
    const step = 4;
    const paceMs = 60;
    const { root } = await open(page, { clock: true });
    await page.clock.pauseAt(new Date(CLOCK_START.getTime() + 60_000));
    const bar = await restOnBar(page, root);
    await page.clock.runFor(paceMs);
    await expect(root.locator(LROW).first()).toBeVisible();
    const row = (await root.locator(LROW).nth(3).boundingBox()) as { x: number; width: number };
    const closed: number[] = [];
    // ACT
    for (let x = bar.x; x < row.x + row.width / 2; x += step) {
      await page.mouse.move(x, bar.y);
      await page.clock.runFor(paceMs);
      closed.push(await root.locator(LROW).count());
    }
    // ASSERT
    expect(closed.length).toBeGreaterThan(1);
    expect(closed.filter((count) => count === 0)).toEqual([]);
  });

  test('scrolls the related chat bubble into view and lights it when a zoom row is clicked', async ({ page }) => {
    // ARRANGE
    const { root } = await open(page);
    await openZoom(page, root);
    const away = await scrollChatAway(root);
    const expected = { inView: true, lit: true };
    // ACT
    const row = root.locator(LROW).nth(3);
    const id = ((await row.getAttribute('data-part')) ?? '').split('@')[0] ?? '';
    // The zoom lives only while the pointer is near: Playwright's own scroll-and-retry would close it, so the click lands where the row is.
    await row.click({ force: true });
    // ASSERT
    expect(away).not.toBe('');
    await expect.poll(() => bubbleState(root, id)).toEqual(expected);
  });

  test('hovers an Attention row without remounting the list, and lights its bubble', async ({ page }) => {
    // ARRANGE
    const { root } = await open(page);
    const mark = 'kept';
    const rows = root.locator(ATT_ROW);
    const card = root.locator('[class*="attCard"]');
    await card.evaluate((el, value) => ((el.firstElementChild as unknown as { __mark: string }).__mark = value), mark);
    // ACT
    await rows.nth(2).hover();
    await rows.nth(4).hover();
    const lit = root.locator('[data-row][data-on]');
    await expect(lit).toHaveCount(1);
    const part = (await lit.getAttribute('data-part')) ?? '';
    const kept = await card.evaluate((el) => (el.firstElementChild as unknown as { __mark?: string }).__mark ?? null);
    // ASSERT
    expect(kept).toBe(mark);
    await expect(bubbleOf(root, part)).toHaveAttribute('data-on', '');
  });

  test('scrolls the chat to the bubble of a clicked Attention row', async ({ page }) => {
    // ARRANGE
    const { root } = await open(page);
    const away = await scrollChatAway(root);
    const expected = { inView: true, lit: true };
    // ACT
    await root.locator(`${ATT_ROW}[data-part="${away}"]`).click();
    // ASSERT
    expect(away).not.toBe('');
    await expect.poll(() => bubbleState(root, away)).toEqual(expected);
  });

  test('magnifies the Attention rows under the pointer like a dock, with the total height unchanged', async ({
    page,
  }) => {
    // ARRANGE
    const { root } = await open(page);
    const minRow = 3.5;
    const reach = 3;
    const slack = 0.5;
    const resting = await heightsOf(root);
    // The thinnest row in the middle, so the growth peaks under the pointer whatever the split is.
    const middle = resting.slice(reach, -reach);
    const index = reach + middle.indexOf(Math.min(...middle));
    const target = root.locator('[data-layout="compressed"] [data-row]').nth(index);
    await target.scrollIntoViewIfNeeded();
    const box = (await target.boundingBox()) as { x: number; y: number; width: number; height: number };
    const restingAfterScroll = await heightsOf(root);
    // ACT
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await settled(root.locator('[data-row][data-on]'));
    // The magnified rows push each other down, so the peak sits under the pointer, which is the lit row.
    const problems = async () => {
      const docked = await heightsOf(root);
      const litIndex = await root
        .locator('[data-layout="compressed"] [data-row]')
        .evaluateAll((rows) => rows.findIndex((r) => r.hasAttribute('data-on')));
      const grown = docked.map((h, i) => h - (restingAfterScroll[i] ?? 0));
      const peak = grown.indexOf(Math.max(...grown));
      return failed([
        [Math.abs(sum(docked) - sum(restingAfterScroll)) < HEIGHT_TOLERANCE, 'the total height changed'],
        [Math.min(...docked) >= minRow, 'a row fell under the minimum'],
        [Math.abs(peak - litIndex) <= 1, 'the peak is not under the pointer'],
        [grown.slice(peak + reach + 1).every((g) => g <= slack), 'rows beyond the reach grew'],
        [Math.max(...grown) > 1, 'no row grew'],
      ]);
    };
    // ASSERT
    await expect.poll(problems).toEqual([]);
  });

  for (const layout of ['compressed', 'pinned', 'list']) {
    test(`shows the percentage at the right of a hovered or focused Attention row in the ${layout} layout, moving nothing`, async ({
      page,
    }) => {
      // ARRANGE
      const { root } = await open(page);
      if (layout !== 'compressed') await setLayout(page, root, layout);
      const hidden = '0';
      const shown = '1';
      const percent = /^\d+%$/;
      const rows = root.locator('[data-row]');
      const middle = Math.floor((await rows.count()) / 2);
      const boxOf = () =>
        root.evaluate((el) => {
          const bar = (el.querySelector('[class*="attBar"]') as HTMLElement).getBoundingClientRect();
          const card = (el.querySelector('[class*="attCard"]') as HTMLElement).getBoundingClientRect();
          return [bar.left, bar.width, card.height].map(Math.round);
        });
      await rows.nth(middle).scrollIntoViewIfNeeded();
      await page.mouse.move(5, 5);
      await rowsAtRest(root);
      const resting = await boxOf();
      // ACT
      await rows.nth(middle).hover();
      const hovered = root.locator('[data-row]:hover [data-pct]');
      await expect(hovered).toHaveCSS('opacity', shown);
      await rowsAtRest(root);
      const whileHovered = await boxOf();
      const text = (await hovered.textContent()) ?? '';
      await page.mouse.move(5, 5);
      await expect(root.locator('[data-row] [data-pct]').first()).toHaveCSS('opacity', hidden);
      await rows.nth(middle).locator('button').focus();
      await expect(rows.nth(middle).locator('[data-pct]')).toHaveCSS('opacity', shown);
      await rowsAtRest(root);
      const whileFocused = await boxOf();
      // ASSERT
      expect(text).toMatch(percent);
      expect(whileHovered).toEqual(resting);
      expect(whileFocused).toEqual(resting);
    });
  }

  test('gives the Attention bar about a third of the row', async ({ page }) => {
    // ARRANGE
    const { root } = await open(page);
    const about = { min: 0.25, max: 0.4 };
    const share = () =>
      root.evaluate((el) => {
        const bar = (el.querySelector('[class*="attBar"]') as HTMLElement).getBoundingClientRect().width;
        const name = (el.querySelector('[class*="attName"]') as HTMLElement).getBoundingClientRect().width;
        return bar / (bar + name);
      });
    // ACT
    const actual = await share();
    // ASSERT
    expect(actual).toBeGreaterThan(about.min);
    expect(actual).toBeLessThan(about.max);
  });
});

test.describe('failure cases', () => {
  test('shows no Attention percentage at rest in Technical mode, only on hover as in Simple', async ({ page }) => {
    // ARRANGE
    const { root } = await open(page);
    const expected = { numbers: '', visible: 0 };
    const technical = root.locator('[role="toolbar"] button[data-control="technical"]');
    // ACT
    await technical.click();
    await expect(technical).toHaveAttribute('aria-pressed', 'true');
    await page.mouse.move(5, 5);
    await rowsAtRest(root);
    const rest = () =>
      root.locator('[data-row]').evaluateAll((rows) => ({
        numbers: rows
          .flatMap((r) => [...r.children].filter((c) => c.tagName === 'SPAN' && !c.hasAttribute('data-pct')))
          .map((c) => c.textContent)
          .join(''),
        visible: rows.filter((r) => Number(getComputedStyle(r.querySelector('[data-pct]') as Element).opacity) > 0)
          .length,
      }));
    // ASSERT
    await expect.poll(rest).toEqual(expected);
  });

  test('does not shift the chat or the page when an Attention row is hovered', async ({ page }) => {
    // ARRANGE
    const { root } = await open(page);
    const row = root.locator(ATT_ROW).nth(2);
    await row.scrollIntoViewIfNeeded();
    await page.mouse.move(5, 5);
    await rowsAtRest(root);
    const measure = () =>
      root.evaluate((el) => {
        const phone = (el.querySelector('[class*="phone"]') as HTMLElement).getBoundingClientRect().height;
        const bubbles = [...el.querySelectorAll('[data-role]:not([hidden])')]
          .map((b) => `${b.getAttribute('data-part')}=${Math.round(b.getBoundingClientRect().height)}`)
          .join();
        const layout =
          (el.querySelector('[data-layout]') as HTMLElement).getBoundingClientRect().top -
          el.getBoundingClientRect().top;
        return [bubbles, Math.round(phone), Math.round(scrollY), Math.trunc(layout)].join();
      });
    const before = await measure();
    // ACT
    await row.hover();
    await expect(root.locator('[data-row][data-on]')).toHaveCount(1);
    await rowsAtRest(root);
    // ASSERT
    await expect.poll(measure).toBe(before);
  });

  test('hides the name of a row too thin to read it whole, so no row shows a cut-through sliver of text', async ({
    page,
  }) => {
    // ARRANGE
    const { root } = await open(page);
    const readable = 0.85;
    const hidden = '0';
    // ACT
    const problems = async () => {
      const rows = await root.locator('[data-layout="compressed"] [data-row]').evaluateAll((all) =>
        all.map((r) => ({
          tight: r.hasAttribute('data-tight'),
          opacity: getComputedStyle(r.querySelector('button') as Element).opacity,
          height: r.getBoundingClientRect().height,
          full: parseFloat(getComputedStyle(r).fontSize) * 1.7,
        })),
      );
      return failed([
        [rows.some((r) => r.tight), 'no row is tight'],
        [rows.filter((r) => r.tight).every((r) => r.opacity === hidden), 'a tight row shows its name'],
        [rows.filter((r) => !r.tight).every((r) => r.height >= r.full * readable), 'a thin row is not tight'],
      ]);
    };
    // ASSERT
    await expect.poll(problems).toEqual([]);
  });

  test('has no eye in the head: the toolbar chip alone hides and shows the context category', async ({ page }) => {
    // ARRANGE
    const { root } = await open(page);
    const chip = root.locator('[role="toolbar"] [data-chip="category"]');
    const category = root.locator('[aria-label="Usage by category"]');
    const eye = root.locator('section[aria-label="Context window"] button[data-control="preview"]');
    const on = 'true';
    const off = 'false';
    // ACT
    await expect(category).toHaveCount(1);
    await expect(chip).toHaveAttribute('aria-pressed', on);
    await chip.click();
    // ASSERT
    await expect(eye).toHaveCount(0);
    await expect(category).toHaveCount(0);
    await expect(chip).toHaveAttribute('aria-pressed', off);
    await chip.click();
    await expect(category).toHaveCount(1);
    await expect(chip).toHaveAttribute('aria-pressed', on);
  });
});

test.describe('edge cases', () => {
  test('draws the lens at half the old stroke and grows the hovered block by transform only', async ({ page }) => {
    // ARRANGE
    const { root } = await open(page);
    const stroke = '1px';
    const unmoved = 'none';
    // ACT
    await openZoom(page, root);
    const hot = root.locator('[data-roving] [data-hot]');
    // ASSERT
    await expect(root.locator('[class*="lens"]')).toHaveCSS('border-top-width', stroke);
    await expect(hot).toHaveCount(1);
    await expect(hot).not.toHaveCSS('transform', unmoved);
  });

  test('gives conversation and category their own Technical toggle, and the category stays beside the window in Technical', async ({
    page,
  }) => {
    // ARRANGE
    const { root } = await open(page);
    const head = root.locator('section[aria-label="Context window"]');
    const usage = root.locator('[aria-label="Usage by category"]');
    const topGap = async () => {
      const window = (await head.boundingBox()) as { y: number };
      const category = (await usage.boundingBox()) as { y: number };
      return Math.abs(category.y - window.y);
    };
    await expect.poll(topGap).toBeLessThan(SAME_TOP);
    // ACT
    await usage.locator('button[data-control="categoryTechnical"]').click();
    await expect(usage.locator('button[data-control="categoryTechnical"]')).toHaveAttribute('aria-pressed', 'true');
    // ASSERT
    await expect.poll(topGap).toBeLessThan(SAME_TOP);
    await expect(usage.locator('details')).not.toHaveAttribute('open', '');
    await expect(root.locator('section[aria-label="Chat"] button[data-control="conversationTechnical"]')).toHaveCount(
      1,
    );
  });

  test('fills the compressed Attention list to the last row with no overlapping rows, keeping the first and last three whole', async ({
    page,
  }) => {
    // ARRANGE
    const { root } = await open(page);
    const list = root.locator('[data-layout="compressed"]');
    // ACT
    const problems = async () => {
      const found = await list.evaluate((el) => {
        const box = (n: Element) => {
          const r = n.getBoundingClientRect();
          return { top: r.top, bottom: r.bottom };
        };
        return { list: box(el), rows: [...el.querySelectorAll('[data-row]')].map(box) };
      });
      const heights = found.rows.map((r) => r.bottom - r.top);
      const gaps = found.rows.slice(1).map((r, i) => r.top - (found.rows[i]?.bottom ?? 0));
      return failed([
        [Math.abs((found.rows.at(-1)?.bottom ?? 0) - found.list.bottom) < HEIGHT_TOLERANCE, 'a gap at the end'],
        [gaps.every((gap) => Math.abs(gap) < HEIGHT_TOLERANCE), 'rows overlap or gap'],
        [new Set(heights.slice(0, EDGE).map(Math.round)).size === 1, 'the first rows differ'],
        [new Set(heights.slice(-EDGE).map(Math.round)).size === 1, 'the last rows differ'],
        [Math.min(...heights.slice(EDGE, -EDGE)) < (heights[0] ?? 0), 'no middle row is compressed'],
      ]);
    };
    // ASSERT
    await expect.poll(problems).toEqual([]);
  });

  for (const width of [1280, 1440]) {
    test(`shows the save tooltip once, inside the viewport and the popover, at ${width}`, async ({ page }) => {
      // ARRANGE
      await page.setViewportSize({ width, height: 900 });
      const { root } = await open(page);
      const tip = 'Your input will be normalized to 100.';
      const save = page.locator(`${POPOVER} button[data-control="attentionSave"]`);
      const slack = 1;
      await root.locator(MENU).click();
      await page.locator(`${POPOVER} button[data-control="attentionEdit"]`).click();
      // ACT
      await page.mouse.move(0, 0);
      await root.locator(MENU).scrollIntoViewIfNeeded();
      await save.hover();
      const read = () => tooltipOf(save, tip);
      await expect.poll(async () => (await read()).content).toContain(tip);
      const state = await read();
      // ASSERT
      expect(state.titled).toBe(0);
      expect(state.left).toBeGreaterThanOrEqual(Math.max(0, state.popLeft) - slack);
      expect(state.right).toBeLessThanOrEqual(Math.min(state.width, state.popRight) + slack);
    });
  }

  test('starts Slide 5 compressed, so the first and the newest rows are always in view', async ({ page }) => {
    // ARRANGE
    const expected = 'compressed';
    const { root } = await open(page, { url: ATTENTION_SPAN, preset: SLIDE_5, scrub: false });
    // ACT
    const list = root.locator('[data-layout]');
    // ASSERT
    await expect(list).toHaveAttribute('data-layout', expected);
  });
});
