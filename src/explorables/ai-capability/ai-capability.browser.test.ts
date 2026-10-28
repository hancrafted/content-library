import { expect, test, type Locator, type Page } from '@playwright/test';
import { hydrated } from '../../../tests/browser/hydrated';

/*
 * The browser seam of the levels timeline (`npm run test:browser`), on the CyberForum intro in the built export:
 * the grounding Slide shows Preset `timeline`, the check-in-3 recap Preset `recap`. Every wait is a retrying assertion
 * or `data-motion="settled"` on the turning card (ARCH-003 §5). See docs/features/explorables/ai-capability.md.
 */

const EPISODE = '/events/2026-10-28-cyberforum-akademie-intro-agentic-workflow/episodes/intro/';
const TIMELINE = 'grounding';
const RECAP = 'check-in-3--disciplines-recap';
const AGENTS_SOURCE = 'Anthropic, Building effective agents';
/** The button that turns the agents card, first on its front face; the speech-bubble marker is a button too. */
const AGENTS_TURN = 'Agents: Definition';
/** What the attributes read: a turned card, a settled motion, a lit and an unlit column. */
const TURNED = 'true';
const SETTLED = 'settled';
const LIT = 'true';
const UNLIT = 'false';
/** The model band, its turn button and its source; a port on it lights while its wire is busy. */
const BAND = '[data-flipped]:has([data-port])';
const LLM_TURN = 'Large language model (LLM): Definition';
const LLM_SOURCE = 'Brown et al. 2020, Language Models are Few-Shot Learners';
const BUSY = 'true';
/** A message on a wire, and the wire itself. */
const DOT = '[data-dir]';
const WIRE = '[data-wire]';
const LEVEL_COUNT = 4;
/** An inert ancestor: a face turned away, whose link Tab never reaches. */
const INERT = 'xpath=ancestor::*[@inert]';

/** Opens the Episode at a Slide and waits until the timeline on it is hydrated. */
async function open(page: Page, anchor: string, locale = '') {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${locale}${EPISODE}`);
  await page.locator(`#${anchor}`).scrollIntoViewIfNeeded();
  const slide = page.locator(`#${anchor}`);
  const column = (level: string) => slide.locator(`[data-level="${level}"]`);
  await expect(column('agents')).toBeVisible();
  await hydrated(column('agents').locator('button').first());
  return { slide, column };
}

/** The Explorable page, where the toolbar's rows and the phone carousel are pinned. */
const PAGE = '/explorables/ai-capability/';
const PAGE_ANCHOR = 'play';
/** The viewport the Explorable must fit with one row on, and a phone. */
const DESKTOP = { width: 1440, height: 900 };
const PHONE = { width: 390, height: 844 };
const ROW = '[data-row="ceiling"]';
const IN_VIEW = 0.6;

/** Opens the Explorable page at a viewport and waits until its toolbar is hydrated. */
async function openPage(page: Page, viewport = DESKTOP) {
  await page.setViewportSize(viewport);
  await page.goto(PAGE);
  const slide = page.locator(`#${PAGE_ANCHOR}`);
  await slide.scrollIntoViewIfNeeded();
  const chip = (row: string) => slide.locator(`[data-row-toggle="${row}"]`);
  await hydrated(chip('ceiling'));
  return { slide, chip, column: (level: string) => slide.locator(`[data-level="${level}"]`) };
}

/** Where an element's bottom sits, in page pixels. */
async function bottomOf(element: Locator): Promise<number> {
  const box = await element.boundingBox();
  return box === null ? -1 : box.y + box.height;
}

/** Where an element's top sits now, in page pixels; `-1` once it has left the page. */
async function topOf(element: Locator): Promise<number> {
  return (await element.boundingBox().catch(() => null))?.y ?? -1;
}

test.describe('success cases', () => {
  test('clicking a card turns it to the definition with its source', async ({ page }) => {
    // ARRANGE
    const { column } = await open(page, TIMELINE);
    const card = column('agents').locator('[data-flipped]');
    // ACT
    await card.getByRole('button', { name: AGENTS_TURN }).first().click();
    // ASSERT
    await expect(card).toHaveAttribute('data-flipped', TURNED);
    await expect(card.locator('[data-motion]')).toHaveAttribute('data-motion', SETTLED);
    await expect(card.getByRole('link', { name: AGENTS_SOURCE })).toBeVisible();
    await expect(card.getByRole('link', { name: AGENTS_SOURCE }).locator(INERT)).toHaveCount(0);
  });

  test('hovering a level lights it and dims the others', async ({ page }) => {
    // ARRANGE
    const { column } = await open(page, TIMELINE);
    // ACT
    await column('workflows').hover();
    // ASSERT
    await expect(column('workflows')).toHaveAttribute('data-on', LIT);
    await expect(column('prompting')).toHaveAttribute('data-on', UNLIT);
  });

  test('the square animates towards the LLM and back, synced to its message', async ({ page }) => {
    // ARRANGE
    const { column } = await open(page, TIMELINE);
    await column('prompting').hover();
    const dot = column('prompting').locator(DOT).first();
    await expect(dot).toBeAttached();
    const start = await topOf(dot);
    // ACT
    const moved = expect.poll(() => topOf(dot));
    // ASSERT
    await moved.not.toBe(start);
  });

  test('LLM card can be flipped as well with a definition', async ({ page }) => {
    // ARRANGE
    const { slide } = await open(page, TIMELINE);
    const band = slide.locator(BAND);
    // ACT
    await band.getByRole('button', { name: LLM_TURN }).first().click();
    // ASSERT
    await expect(band).toHaveAttribute('data-flipped', TURNED);
    await expect(band.locator('[data-motion]')).toHaveAttribute('data-motion', SETTLED);
    await expect(band.getByRole('link', { name: LLM_SOURCE })).toBeVisible();
    await expect(band.getByRole('link', { name: LLM_SOURCE }).locator(INERT)).toHaveCount(0);
  });

  test('a toolbar chip blends its row into every Level and takes it out again', async ({ page }) => {
    // ARRANGE
    const { slide, chip } = await openPage(page);
    await chip('ceiling').click();
    await expect(slide.locator(ROW)).toHaveCount(LEVEL_COUNT);
    // ACT
    await chip('ceiling').click();
    // ASSERT
    await expect(slide.locator(ROW)).toHaveCount(0);
    await expect(chip('ceiling')).toHaveAttribute('aria-pressed', UNLIT);
  });

  test('more is visible without scrolling: with one row on, toolbar to model band fits 1440×900', async ({ page }) => {
    // ARRANGE
    const { slide, chip } = await openPage(page);
    const band = slide.locator(BAND);
    await chip('mismatch').click();
    await expect(slide.locator('[data-row="mismatch"]')).toHaveCount(LEVEL_COUNT);
    // ACT
    const height = expect.poll(async () => (await bottomOf(band)) - (await topOf(chip('mismatch'))));
    // ASSERT
    await height.toBeLessThanOrEqual(DESKTOP.height);
  });

  test('on a phone the Levels are swipeable left to right, the arrow moving to the next Level', async ({ page }) => {
    // ARRANGE
    const { slide, column } = await openPage(page, PHONE);
    await expect(column('prompting')).toBeInViewport({ ratio: IN_VIEW });
    // ACT
    await slide.getByRole('button', { name: 'Next Level' }).click();
    // ASSERT
    await expect(column('agents')).toBeInViewport({ ratio: IN_VIEW });
    await expect(column('prompting')).not.toBeInViewport({ ratio: IN_VIEW });
  });

  test('on a phone the Level swiped to plays its scene once, then comes to rest', async ({ page }) => {
    // ARRANGE
    const { slide, column } = await openPage(page, PHONE);
    const playing = 'playing';
    /** Long enough for the agent scene's three loops, short of a second run. */
    const sceneEnds = { timeout: 15_000 };
    await expect(column('agents')).toHaveAttribute('data-motion', SETTLED);
    // ACT
    await slide.getByRole('button', { name: 'Next Level' }).click();
    // ASSERT
    await expect(column('agents')).toHaveAttribute('data-motion', playing);
    await expect(column('agents')).toHaveAttribute('data-motion', SETTLED, sceneEnds);
  });
});

test.describe('failure cases', () => {
  test('on a phone the previous arrow is off at the first Level', async ({ page }) => {
    // ARRANGE
    const { slide } = await openPage(page, PHONE);
    // ACT
    const previous = slide.getByRole('button', { name: 'Previous Level' });
    // ASSERT
    await expect(previous).toBeDisabled();
  });

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
  test('rows stack in the toolbar order, whichever chip is pressed first', async ({ page }) => {
    // ARRANGE
    const { chip, column } = await openPage(page);
    const prompting = column('prompting');
    // ACT
    await chip('mismatch').click();
    await chip('role').click();
    // ASSERT
    await expect(prompting.locator('[data-row="role"]')).toBeVisible();
    await expect
      .poll(
        async () =>
          (await topOf(prompting.locator('[data-row="mismatch"]'))) -
          (await topOf(prompting.locator('[data-row="role"]'))),
      )
      .toBeGreaterThan(0);
  });

  test("at initial rest the animations don't play and only start when mouse enters", async ({ page }) => {
    // ARRANGE
    const { slide, column } = await open(page, TIMELINE);
    await page.mouse.move(0, 0);
    await expect(slide.locator(DOT)).toHaveCount(0);
    // ACT
    await column('prompting').hover();
    // ASSERT
    await expect(column('prompting').locator(DOT).first()).toBeAttached();
    await expect(slide.locator('[data-port="prompting"]')).toHaveAttribute('data-on', BUSY);
  });

  for (const locale of ['', '/de']) {
    test(`align the dashed lines to the bottom (${locale || '/en'})`, async ({ page }) => {
      // ARRANGE
      const { slide } = await open(page, TIMELINE, locale);
      const wires = slide.locator(WIRE);
      await expect(wires).toHaveCount(LEVEL_COUNT);
      // ACT
      const bottoms = await wires.evaluateAll((all) => [
        ...new Set(all.map((wire) => wire.getBoundingClientRect().bottom)),
      ]);
      // ASSERT
      expect(bottoms).toHaveLength(1);
    });
  }

  test('the recap lights workflows with nothing hovered', async ({ page }) => {
    // ARRANGE
    const { column } = await open(page, RECAP);
    // ACT
    await page.mouse.move(0, 0);
    // ASSERT
    await expect(column('workflows')).toHaveAttribute('data-on', LIT);
    await expect(column('agents')).toHaveAttribute('data-on', UNLIT);
  });
});
