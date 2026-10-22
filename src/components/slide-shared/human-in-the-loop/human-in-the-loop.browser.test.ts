import { expect, test, type Locator, type Page } from '@playwright/test';
import axe from 'axe-core';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { hydrated } from '../../../../tests/browser/hydrated';
import { settled } from '../../../../tests/browser/settled';

/*
 * The browser seam (`npm run test:browser`, local only until the nightly lands): the Slide "Brief the venue" of the
 * onboard-ai-every-time Episode in the built export, walked end to end the way a viewer does it. Every wait is a
 * retrying assertion or `data-motion="settled"` (ARCH-003 §5). See docs/features/human-in-the-loop.md.
 */

const EPISODE = '/episodes/onboard-ai-every-time/';
const SLIDE_ANCHOR = 'five-moves-to-brief-a-freelancer--brief-the-venue';
const ROOT = '[data-human-in-the-loop]';
const MODAL = `${ROOT} dialog[data-part="modal"]`;
const COPY_PROMPT = /Copy prompt/;
const COPY_COMMAND = /Copy command/;
const SHORT = /Short/;
const TECHNICAL = /Technical/;

/** A valid Workflow of the viewer's own: the shipped summer party under another id and title. */
const OWN = readFileSync(path.join(__dirname, 'summer-party.config.yml'), 'utf8')
  .replace('id: summer-party', 'id: mine')
  .replace('title: Summer party', 'title: Mine');

/** Opens the Episode at the Slide with the clipboard recorded (a headless page's is not ours to read). */
async function open(page: Page, theme: 'light' | 'dark', width = 1440) {
  await page.setViewportSize({ width, height: 900 });
  await page.emulateMedia({ colorScheme: theme });
  await page.addInitScript(() => {
    const copied: string[] = [];
    Object.assign(window, { __copied: copied });
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          copied.push(text);
        },
      },
    });
  });
  await page.goto(EPISODE);
  // A Slide mounts when it nears the viewport: scroll to its anchor, then wait for the visual and for its hydration.
  await page.locator(`#${SLIDE_ANCHOR}`).scrollIntoViewIfNeeded();
  const root = page.locator(ROOT);
  await expect(root).toBeVisible();
  await root.scrollIntoViewIfNeeded();
  const firstButton = root.locator('button').first();
  await hydrated(firstButton);
  return {
    root,
    toolbar: root.locator('[data-part="toolbar"]'),
    modal: page.locator(MODAL),
  };
}

const copied = (page: Page) => page.evaluate(() => (window as unknown as { __copied: string[] }).__copied);
const copies = (page: Page) => copied(page).then((all) => all.length);

/** Presses a stage's "Try it" button and waits for its modal. */
async function openStage(page: Page, stage: string) {
  await page.locator(`${ROOT} [data-part="diagram"] button[data-try="${stage}"]`).click();
  await expect(page.locator(MODAL)).toBeVisible();
}

const run = (modal: Locator) => modal.locator('[data-step="run"]');

/** axe-core's serious and critical violations inside the visual, as `rule: target` lines. */
async function seriousViolations(page: Page): Promise<string[]> {
  if (!(await page.evaluate(() => 'axe' in window))) await page.addScriptTag({ content: axe.source });
  return page.evaluate(
    async (root) =>
      (window as unknown as { axe: typeof axe }).axe
        .run({ include: [[root]] }, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } })
        .then((r) =>
          r.violations
            .filter((v) => v.impact === 'serious' || v.impact === 'critical')
            .flatMap((v) => v.nodes.map((n) => `${v.id}: ${n.target.join(' ')}`)),
        ),
    ROOT,
  );
}

test.describe('success cases', () => {
  test('has one pill toolbar: the Workflow pills, then Technical, download and upload as icon buttons with tooltips', async ({
    page,
  }) => {
    // ARRANGE
    const expectedPills = ['Summer party', 'Vacation'];
    const expectedIcons = ['level', 'download', 'upload'];
    const { root, toolbar } = await open(page, 'light');
    // ACT
    const pillButtons = toolbar.locator('[data-control="picker"] button');
    const icons = () =>
      toolbar
        .locator('[data-tip-host]')
        .filter({ has: page.locator('[data-control]:not([data-control=picker])') })
        .evaluateAll((hosts) =>
          hosts.map((host) => ({
            control: host.querySelector('[data-control]')?.getAttribute('data-control'),
            tip: host.querySelector('[data-tip-text]')?.textContent ?? '',
          })),
        );
    // ASSERT
    await expect(pillButtons).toHaveText(expectedPills);
    await expect.poll(async () => (await icons()).map((icon) => icon.control)).toEqual(expectedIcons);
    await expect.poll(async () => (await icons()).filter((icon) => icon.tip.length === 0)).toEqual([]);
    await expect(toolbar.locator('button, input')).toHaveCount(expectedPills.length + expectedIcons.length);
    await expect(root).not.toContainText(/Watch|Try it yourself/);
  });

  test('opens a stage modal from its Try it button: title, X top right, collapsed prompts, copy, then Escape and backdrop close', async ({
    page,
  }) => {
    // ARRANGE
    const expectedTitle = 'Requirements: Try it';
    const expectedSteps = ['run', 'check', 'page'];
    const expectedLinks = ['https://chatgpt.com/', 'https://claude.ai/new'];
    const exampleViews = 2;
    const backdrop = { position: { x: 4, y: 4 } };
    const handoff = 'handoff';
    const placeholder = '{{';
    const copiedStatus = 'Copied';
    const edge = 40;
    const { modal } = await open(page, 'light');
    // ACT
    await openStage(page, 'Requirements');
    const panel = () => modal.locator(':scope > div').boundingBox();
    const close = () => modal.locator('header button[aria-label="Close"]').boundingBox();
    await run(modal).getByRole('button', { name: COPY_PROMPT }).click();
    await expect(modal.getByRole('status')).toHaveText(copiedStatus);
    const links = () =>
      run(modal)
        .locator('a[target="_blank"]')
        .evaluateAll((els) => els.map((el) => (el as HTMLAnchorElement).href.split('?')[0]));
    const steps = () =>
      modal.locator('[data-step]').evaluateAll((els) => els.map((el) => el.getAttribute('data-step')));
    // ASSERT
    await expect(modal.locator('h2')).toHaveText(expectedTitle);
    await expect.poll(async () => (await close())!.y - (await panel())!.y).toBeLessThan(edge);
    await expect
      .poll(async () => (await panel())!.x + (await panel())!.width - ((await close())!.x + (await close())!.width))
      .toBeLessThan(edge);
    await expect.poll(steps).toEqual(expectedSteps);
    await expect(modal.locator('[data-prompt]')).toHaveCount(expectedSteps.length);
    await expect(modal.locator('[data-prompt] button[aria-expanded="true"]')).toHaveCount(0);
    await expect.poll(() => copied(page)).toHaveLength(1);
    await expect.poll(async () => (await copied(page))[0]).toContain(handoff);
    await expect.poll(async () => (await copied(page))[0]).not.toContain(placeholder);
    await expect.poll(links).toEqual(expectedLinks);
    await expect(modal.locator('[data-output="spec"], [data-output="tickets"]')).toHaveCount(exampleViews);
    await modal.click(backdrop);
    await expect(modal).toHaveCount(0);
    await openStage(page, 'Requirements');
    await page.keyboard.press('Escape');
    await expect(modal).toHaveCount(0);
  });

  test('closes the modal with the X button and expands a prompt on demand', async ({ page }) => {
    // ARRANGE
    const { modal } = await open(page, 'light');
    await openStage(page, 'Interview');
    // ACT
    const toggle = run(modal)
      .locator('button[aria-expanded]')
      .filter({ hasText: /Prompt/ });
    await toggle.click();
    // ASSERT
    await expect(run(modal).locator('pre')).toBeVisible();
    await settled(toggle.locator('svg'));
    await modal.getByRole('button', { name: 'Close' }).click();
    await expect(modal).toHaveCount(0);
  });

  test('copies the short grill of the interview when Short is on, and the full prompt when it is off', async ({
    page,
  }) => {
    // ARRANGE
    const shortMarker = 'SHORT version';
    const { modal } = await open(page, 'light');
    await openStage(page, 'Interview');
    const copy = run(modal).getByRole('button', { name: COPY_PROMPT });
    const short = run(modal).getByRole('button', { name: SHORT });
    // ACT
    await copy.click();
    await expect.poll(() => copies(page)).toBe(1);
    await short.click();
    await expect(short).toHaveAttribute('aria-pressed', 'true');
    await settled(short);
    await copy.click();
    await expect.poll(() => copies(page)).toBe(2);
    const written = await copied(page);
    // ASSERT
    expect(written[0]).not.toContain(shortMarker);
    expect(written[1]).toContain(shortMarker);
    await expect(modal.locator('button[aria-pressed]')).toHaveCount(1);
  });

  test('copies the short command of the interview at the Technical level when Short is on', async ({ page }) => {
    // ARRANGE
    const shortMarker = 'Short version';
    const { toolbar, modal } = await open(page, 'light');
    const technical = toolbar.getByRole('button', { name: TECHNICAL });
    await technical.click();
    await expect(technical).toHaveAttribute('aria-pressed', 'true');
    await settled(technical);
    await openStage(page, 'Interview');
    const copy = run(modal).getByRole('button', { name: COPY_COMMAND });
    const short = run(modal).getByRole('button', { name: SHORT });
    // ACT
    await copy.click();
    await expect.poll(() => copies(page)).toBe(1);
    await short.click();
    await expect(short).toHaveAttribute('aria-pressed', 'true');
    await settled(short);
    await copy.click();
    await expect.poll(() => copies(page)).toBe(2);
    const written = await copied(page);
    // ASSERT
    expect(written[0]).not.toContain(shortMarker);
    expect(written[1]).toContain(shortMarker);
    expect(written[1]?.startsWith('/')).toBe(true);
  });

  test('returns focus to the Try it button on every close path: X, Escape and backdrop', async ({ page }) => {
    // ARRANGE
    const stage = 'Requirements';
    const { modal } = await open(page, 'light');
    const closers = [
      () => modal.getByRole('button', { name: 'Close' }).click(),
      () => page.keyboard.press('Escape'),
      () => modal.click({ position: { x: 4, y: 4 } }),
    ];
    const opener = page.locator(`${ROOT} [data-try="${stage}"]`);
    // ACT
    for (const close of closers) {
      await openStage(page, stage);
      await close();
      // ASSERT
      await expect(modal).toHaveCount(0);
      await expect(opener).toBeFocused();
    }
  });

  test('shows one shared tooltip on focus, dismisses it with Escape before the dialog, and keeps the move circles 24px', async ({
    page,
  }) => {
    // ARRANGE
    const minTarget = 24;
    const { root, modal } = await open(page, 'light');
    const circles = () =>
      root
        .locator('[data-move]')
        .evaluateAll((els) =>
          els.map((el) => Math.min(el.getBoundingClientRect().width, el.getBoundingClientRect().height)),
        );
    await openStage(page, 'Requirements');
    const tip = modal.locator('header [data-tip-host] > span[data-shown]');
    // ACT
    await modal.locator('header button').focus();
    await expect(tip).toHaveAttribute('data-shown', 'true');
    await page.keyboard.press('Escape');
    // ASSERT
    await expect.poll(async () => (await circles()).length).toBeGreaterThan(0);
    await expect.poll(async () => (await circles()).filter((size) => size < minTarget)).toEqual([]);
    await expect(tip).toHaveAttribute('data-shown', 'false');
    await expect(modal).toHaveAttribute('open', '');
    await page.keyboard.press('Escape');
    await expect(modal).toHaveCount(0);
  });

  test('ticks a ready ticket of the example graph so its dependent becomes ready', async ({ page }) => {
    // ARRANGE
    const doneStatus = 'done';
    const progress = /^1 of \d+ done$/;
    const { modal } = await open(page, 'light');
    await openStage(page, 'Requirements');
    const ready = modal.locator('[data-ticket][data-status="ready"]');
    const first = ready.first();
    const firstId = await first.getAttribute('data-ticket');
    const waiting = await modal
      .locator('[data-ticket][data-status="blocked"]')
      .evaluateAll((els) => els.map((el) => el.getAttribute('data-ticket')));
    // ACT
    await first.click();
    // ASSERT
    await expect(modal.locator(`[data-ticket="${firstId}"]`)).toHaveAttribute('data-status', doneStatus);
    expect(waiting.length).toBeGreaterThan(0);
    await expect
      .poll(async () => {
        const now = await ready.evaluateAll((els) => els.map((el) => el.getAttribute('data-ticket')));
        return now.some((id) => waiting.includes(id));
      })
      .toBe(true);
    await expect(modal.locator('[data-progress]')).toHaveText(progress);
  });

  test('switches to Vacation with its own card lines, then shows the setup and a copyable /skill command in Technical', async ({
    page,
  }) => {
    // ARRANGE
    const vacation = 'vacation';
    const setupCommand = 'claude plugin install';
    const summerLine = 'At most €150 per person';
    const vacationLine = 'Sleeps 2';
    const { root, toolbar, modal } = await open(page, 'light');
    const diagram = root.locator('[data-part="diagram"]');
    await expect(diagram).toContainText(summerLine);
    // ACT
    const pill = toolbar.locator('[data-control="picker"]').getByRole('button', { name: /Vacation/ });
    await pill.click();
    await expect(root).toHaveAttribute('data-human-in-the-loop', vacation);
    await settled(pill);
    await toolbar.getByRole('button', { name: TECHNICAL }).click();
    await openStage(page, 'Interview');
    await run(modal).getByRole('button', { name: COPY_COMMAND }).click();
    await expect.poll(() => copies(page)).toBe(1);
    const written = await copied(page);
    // ASSERT
    await expect(diagram).toContainText(vacationLine);
    await expect(diagram).not.toContainText(summerLine);
    await expect(modal.locator('section[aria-label="One-time setup"]')).toContainText(setupCommand);
    expect(written[0]).toMatch(/^\/[a-z-]+/);
  });

  test('shows a valid uploaded Workflow in place of the authored one', async ({ page }) => {
    // ARRANGE
    const mine = 'mine';
    const { root } = await open(page, 'light');
    // ACT
    await root
      .locator('[data-control="upload"] input[type=file]')
      .setInputFiles({ name: 'mine.yml', mimeType: 'text/yaml', buffer: Buffer.from(OWN) });
    // ASSERT
    await expect(root).toHaveAttribute('data-human-in-the-loop', mine);
    await expect(root.locator('[data-upload-problems] li')).toHaveCount(0);
  });

  for (const theme of ['light', 'dark'] as const) {
    test(`has no serious or critical axe-core violation in ${theme}, on the diagram and with the modal open`, async ({
      page,
    }) => {
      // ARRANGE
      const expected: string[] = [];
      await open(page, theme);
      // ACT
      const violations = () => seriousViolations(page);
      // ASSERT
      await expect.poll(violations).toEqual(expected);
      await openStage(page, 'Requirements');
      await expect.poll(violations).toEqual(expected);
    });
  }
});

test.describe('failure cases', () => {
  test('reports the problems of a broken uploaded Workflow and keeps the authored one', async ({ page }) => {
    // ARRANGE
    const authored = 'summer-party';
    const { root } = await open(page, 'light');
    // ACT
    await root
      .locator('[data-control="upload"] input[type=file]')
      .setInputFiles({ name: 'broken.yml', mimeType: 'text/yaml', buffer: Buffer.from('stages: [') });
    // ASSERT
    await expect(root.locator('[data-upload-problems] li').first()).toBeVisible();
    await expect(root).toHaveAttribute('data-human-in-the-loop', authored);
  });
});

test.describe('edge cases', () => {
  test('keeps the page from scrolling sideways at phone width with the modal open', async ({ page }) => {
    // ARRANGE
    const phone = 390;
    const { modal } = await open(page, 'light', phone);
    // ACT
    await openStage(page, 'Requirements');
    const sideways = () => page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    const panel = () => modal.locator(':scope > div').boundingBox();
    // ASSERT
    await expect.poll(sideways).toBeLessThanOrEqual(0);
    await expect.poll(async () => (await panel())!.x).toBeGreaterThanOrEqual(0);
    await expect.poll(async () => (await panel())!.x + (await panel())!.width).toBeLessThanOrEqual(phone);
  });
});
