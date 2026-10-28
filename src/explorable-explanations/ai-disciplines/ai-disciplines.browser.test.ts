import { expect, test, type Locator, type Page } from '@playwright/test';
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
const DISCIPLINE_COUNT = 4;
/** An inert ancestor: a face turned away, whose link Tab never reaches. */
const INERT = 'xpath=ancestor::*[@inert]';

/** Opens the Episode at a Slide and waits until the timeline on it is hydrated. */
async function open(page: Page, anchor: string, locale = '') {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${locale}${EPISODE}`);
  await page.locator(`#${anchor}`).scrollIntoViewIfNeeded();
  const slide = page.locator(`#${anchor}`);
  const column = (discipline: string) => slide.locator(`[data-discipline="${discipline}"]`);
  await expect(column('agents')).toBeVisible();
  await hydrated(column('agents').locator('button').first());
  return { slide, column };
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

  test('hovering a discipline lights it and dims the others', async ({ page }) => {
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
      await expect(wires).toHaveCount(DISCIPLINE_COUNT);
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
