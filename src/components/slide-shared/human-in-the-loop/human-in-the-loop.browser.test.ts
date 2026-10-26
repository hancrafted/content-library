import { expect, test, type Locator, type Page } from '@playwright/test';
import axe from 'axe-core';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { hydrated } from '../../../../tests/browser/hydrated';

/*
 * The browser seam (`npm run test:browser`, local only until the nightly lands): the Slide "Human in the loop" of the
 * Slides Episode in the built export, walked end to end the way a viewer does it. Every wait is a retrying assertion
 * (ARCH-003 §5). See docs/features/human-in-the-loop.md.
 *
 * The popover is a shadcn Dialog, portalled out of the visual: it is found on the page, not inside the root. Each stage
 * is a stepper of jobs; the first job opens with it, and every input carries `data-field` with the key it fills.
 */

const EPISODE = '/episodes/slides/';
const GERMAN_EPISODE = '/de/episodes/slides/';
const SLIDE_ANCHOR = 'agentic-workflows--human-in-the-loop';
const ROOT = '[data-human-in-the-loop]';
const MODAL = '[role="dialog"][data-part="modal"]';
const COPY_PROMPT = 'Copy prompt';
/** Two Workflows by seven stages, in one language: more than the default 30s. */
const LONG_TEST = 120_000;
/** A point on the overlay, outside the centred dialog. */
const OVERLAY = { x: 4, y: 4 };

/** A valid Workflow of the viewer's own: the shipped summer party under another id and title. */
const OWN = readFileSync(path.join(__dirname, 'summer-party.en.yml'), 'utf8')
  .replace('id: summer-party', 'id: mine')
  .replace('title: Plan company summer party', 'title: Mine');

/** Opens the Episode at the Slide with the clipboard recorded (a headless page's is not ours to read). */
async function open(page: Page, theme: 'light' | 'dark', where: { width?: number; url?: string } = {}) {
  const { width = 1440, url = EPISODE } = where;
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
  await page.goto(url);
  // A Slide mounts when it nears the viewport: scroll to its anchor, then wait for the visual and for its hydration.
  await page.locator(`#${SLIDE_ANCHOR}`).scrollIntoViewIfNeeded();
  const root = page.locator(ROOT);
  await expect(root).toBeVisible();
  await root.scrollIntoViewIfNeeded();
  await hydrated(root.locator('button').first());
  return { root, toolbar: root.locator('[data-part="toolbar"]'), modal: page.locator(MODAL) };
}

const copied = (page: Page) => page.evaluate(() => (window as unknown as { __copied: string[] }).__copied);
const copies = (page: Page) => copied(page).then((all) => all.length);

/** Presses a stage's column (its "Practice it" button) and waits for its modal. */
async function openStage(page: Page, stage: string) {
  await page.locator(`${ROOT} [data-part="diagram"] button[data-try="${stage}"]`).click();
  await expect(page.locator(MODAL)).toBeVisible();
}

/** The Copy prompt button of the open job's first step. */
const copyPrompt = (modal: Locator, name = COPY_PROMPT) => modal.getByRole('button', { name, exact: true }).first();

/** The input that fills `key`, a slot marker or a result. */
const field = (modal: Locator, key: string) => modal.locator(`[data-field="${key}"] textarea`).first();

/** Picks a Workflow in the use case picker (a shadcn Select). */
async function pickWorkflow(root: Locator, id: string) {
  await root.locator('[data-control="picker"] [role="combobox"]').click();
  await root.page().locator(`[role="option"][data-workflow="${id}"]`).click();
  await expect(root).toHaveAttribute('data-human-in-the-loop', id);
}

/** axe-core's serious and critical violations inside `selector`, as `rule: target` lines. */
async function seriousViolations(page: Page, selector: string): Promise<string[]> {
  if (!(await page.evaluate(() => 'axe' in window))) await page.addScriptTag({ content: axe.source });
  return page.evaluate(
    async (scope) =>
      (window as unknown as { axe: typeof axe }).axe
        .run({ include: [[scope]] }, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } })
        .then((r) =>
          r.violations
            .filter((v) => v.impact === 'serious' || v.impact === 'critical')
            .flatMap((v) => v.nodes.map((n) => `${v.id}: ${n.target.join(' ')}`)),
        ),
    selector,
  );
}

interface Language {
  readonly name: string;
  readonly url: string;
  readonly title: RegExp;
  readonly copy: string;
}

/** What is wrong with the open stage's popover: its title, its jobs, and a copied first prompt with a marker left. */
async function popoverProblems(page: Page, where: string, language: Language): Promise<string[]> {
  const modal = page.locator(MODAL);
  const heading = (await modal.locator('[data-slot="dialog-title"]').textContent()) ?? '';
  const jobs = await modal.locator('[data-job]').count();
  const before = await copies(page);
  await copyPrompt(modal, language.copy).click();
  await expect.poll(() => copies(page)).toBe(before + 1);
  const prompt = (await copied(page)).at(-1) ?? '';
  const checks: [boolean, string][] = [
    [!language.title.test(heading), `title "${heading}"`],
    [jobs === 0, 'no job'],
    [prompt.includes('{{'), 'unfilled marker'],
  ];
  return checks.filter(([wrong]) => wrong).map(([, what]) => `${where}: ${what}`);
}

/** Opens one Workflow, then every stage of it in turn, and reports what is wrong. */
async function stageProblems(page: Page, id: string, language: Language): Promise<string[]> {
  const stages = 7;
  const root = page.locator(ROOT);
  await pickWorkflow(root, id);
  const buttons = root.locator('[data-part="diagram"] button[data-try]');
  await expect(buttons).toHaveCount(stages);
  const names = await buttons.evaluateAll((els) => els.map((el) => el.getAttribute('data-try') ?? ''));
  const problems: string[] = [];
  for (const name of names) {
    await openStage(page, name);
    problems.push(...(await popoverProblems(page, `${id}/${name}`, language)));
    await page.keyboard.press('Escape');
    await expect(page.locator(MODAL)).toHaveCount(0);
  }
  return problems;
}

test.describe('success cases', () => {
  test('has one pill toolbar: the "Use case" picker showing the chosen Workflow, then the view, Chat · CLI, download and upload', async ({
    page,
  }) => {
    // ARRANGE
    const expectedControls = ['picker', 'view', 'level', 'download', 'upload'];
    const expectedLabel = 'Use case:';
    const expectedChosen = 'Plan company summer party';
    const { root, toolbar } = await open(page, 'light');
    // ACT
    const controls = () =>
      toolbar.locator('[data-control]').evaluateAll((els) => els.map((el) => el.getAttribute('data-control')));
    const picker = toolbar.locator('[data-control="picker"]');
    // ASSERT
    await expect.poll(controls).toEqual(expectedControls);
    await expect(picker.locator('label')).toHaveText(expectedLabel);
    await expect(picker.getByRole('combobox')).toHaveText(expectedChosen);
    await expect(root).not.toContainText(/Watch|Try it yourself/);
  });

  test('opens in the Presentation view: a card per stage, the other views disabled, and nothing sideways on a phone', async ({
    page,
  }) => {
    // ARRANGE
    const stages = 7;
    const phone = 390;
    const { root } = await open(page, 'light', { width: phone });
    // ACT
    const view = root.locator('[data-control="view"]');
    const sideways = () => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    // ASSERT
    await expect(root).toHaveAttribute('data-view', 'presentation');
    await expect(root.locator('[data-stage-card]')).toHaveCount(stages - 1);
    await expect(view.locator('[aria-pressed="true"]')).toHaveText('Presentation');
    await expect(view.locator('[aria-disabled="true"]')).toHaveText(['Detailed', 'Hands-on']);
    expect(await sideways()).toBeLessThanOrEqual(0);
  });

  test('opens a stage as a stepper: the stage title, the first job open, its prompt copied with no marker left', async ({
    page,
  }) => {
    // ARRANGE
    const expectedTitle = 'Requirements: Practice it';
    const expectedOpen = 1;
    const interview = '## Questions and answers';
    const placeholder = '{{';
    const copiedStatus = 'Copied';
    const { modal } = await open(page, 'light');
    // ACT
    await openStage(page, 'Requirements');
    await copyPrompt(modal).click();
    // ASSERT
    await expect(modal.locator('[data-slot="dialog-title"]')).toHaveText(expectedTitle);
    await expect(modal.locator('[data-job][data-state="open"]')).toHaveCount(expectedOpen);
    await expect(modal.getByRole('status')).toHaveText(copiedStatus);
    await expect.poll(() => copied(page)).toHaveLength(1);
    await expect.poll(async () => (await copied(page))[0]).toContain(interview);
    await expect.poll(async () => (await copied(page))[0]).not.toContain(placeholder);
  });

  test('hides the intro and the step explanations until Help is pressed', async ({ page }) => {
    // ARRANGE
    const { modal } = await open(page, 'light');
    await openStage(page, 'Requirements');
    const help = modal.getByRole('button', { name: 'Help' });
    // ACT
    const hidden = {
      intro: await modal.locator('[data-intro]').count(),
      explain: await modal.locator('[data-explain]').count(),
    };
    await help.click();
    // ASSERT
    expect(hidden).toEqual({ intro: 0, explain: 0 });
    await expect(help).toHaveAttribute('aria-pressed', 'true');
    await expect(modal.locator('[data-intro]')).toBeVisible();
    await expect(modal.locator('[data-explain]').first()).toBeVisible();
  });

  test('copies the explanation prompt: the prompt wrapped in a request to explain it', async ({ page }) => {
    // ARRANGE
    const coach = 'prompt engineering coach';
    const { modal } = await open(page, 'light');
    await openStage(page, 'Requirements');
    await copyPrompt(modal).click();
    await expect.poll(() => copies(page)).toBe(1);
    // ACT
    await modal.getByRole('button', { name: 'Copy explanation prompt' }).first().click();
    await expect.poll(() => copies(page)).toBe(2);
    const [prompt, explanation] = await copied(page);
    // ASSERT
    expect(explanation).toContain(coach);
    expect(explanation).toContain(prompt);
  });

  test('returns focus to the stage column on every close path: X, Escape and the overlay', async ({ page }) => {
    // ARRANGE
    const stage = 'Requirements';
    const { modal } = await open(page, 'light');
    const closers = [
      () => modal.getByRole('button', { name: 'Close' }).click(),
      () => page.keyboard.press('Escape'),
      () => page.mouse.click(OVERLAY.x, OVERLAY.y),
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

  test('switches to Vacation, then copies the /grilling prompt in CLI', async ({ page }) => {
    // ARRANGE
    const command = '/grilling';
    const { root, modal } = await open(page, 'light');
    // ACT
    await pickWorkflow(root, 'vacation');
    await root.locator('[data-control="level"]').getByRole('button', { name: 'CLI' }).click();
    await openStage(page, 'Interview');
    await copyPrompt(modal).click();
    // ASSERT
    await expect.poll(async () => (await copied(page)).at(-1)).toContain(command);
  });

  test.describe('Chat and CLI labels', () => {
    for (const [name, url] of [
      ['English', EPISODE],
      ['German', GERMAN_EPISODE],
    ] as const) {
      test(`labels the two-way control Chat and CLI in ${name}`, async ({ page }) => {
        // ARRANGE
        const expected = ['Chat', 'CLI'];
        const { toolbar } = await open(page, 'light', { url });
        // ACT
        const segments = toolbar.locator('[data-control="level"] button');
        // ASSERT
        await expect(segments).toHaveText(expected);
      });
    }
  });

  test("runs vacation's Research stage as rounds titled by the example tickets, then by the pasted tickets, capped at three", async ({
    page,
  }) => {
    // ARRANGE
    const exampleTitles = ['1. Apartment:', '2. Small hotel:', '3. Villa or guesthouse:'];
    const pastedTitles = ['Camper van:', 'Cabin:', 'Hostel:'];
    const pasted = '# Tickets\n## Tickets\n### Camper van\nA.\n### Cabin\nB.\n### Hostel\nC.\n### Tent\nD.';
    const { modal, root } = await open(page, 'light');
    await pickWorkflow(root, 'vacation');
    const rounds = () => modal.locator('[data-job="venue"] [data-slot="accordion-trigger"]');
    // ACT
    await openStage(page, 'Research');
    await expect(rounds()).toContainText(exampleTitles);
    await modal.getByRole('button', { name: 'Close' }).click();
    await openStage(page, 'Tickets');
    await field(modal, 'tickets').fill(pasted);
    await modal.getByRole('button', { name: 'Close' }).click();
    await openStage(page, 'Research');
    // ASSERT
    await expect(rounds()).toContainText(pastedTitles);
    await expect(rounds()).toHaveCount(pastedTitles.length);
  });

  test.describe('every stage in both languages', () => {
    test.describe.configure({ timeout: LONG_TEST });

    const languages: Language[] = [
      { name: 'English', url: EPISODE, title: /Practice it$/, copy: COPY_PROMPT },
      { name: 'German', url: GERMAN_EPISODE, title: /Üben$/, copy: 'Prompt kopieren' },
    ];
    for (const language of languages) {
      test(`opens every stage of both Workflows in ${language.name} with its title, jobs and no unfilled marker`, async ({
        page,
      }) => {
        // ARRANGE
        const expected: string[] = [];
        await open(page, 'light', { url: language.url });
        const problems: string[] = [];
        // ACT
        for (const id of ['summer-party', 'vacation']) problems.push(...(await stageProblems(page, id, language)));
        // ASSERT
        expect(problems).toEqual(expected);
      });
    }
  });

  test('carries a result pasted in one stage into the copied prompt of a later stage, keeps it across close and reopen, and stores nothing', async ({
    page,
  }) => {
    // ARRANGE
    const pasted = '# PASTED SPEC MARKER';
    const { modal } = await open(page, 'light');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    // ACT
    await openStage(page, 'Requirements');
    await field(modal, 'spec').fill(pasted);
    await modal.getByRole('button', { name: 'Close' }).click();
    await expect(modal).toHaveCount(0);
    await openStage(page, 'Tickets');
    await copyPrompt(modal).click();
    await expect.poll(() => copies(page)).toBe(1);
    const written = await copied(page);
    await modal.getByRole('button', { name: 'Close' }).click();
    await openStage(page, 'Requirements');
    // ASSERT
    expect(written.at(-1)).toContain(pasted);
    await expect(field(modal, 'spec')).toHaveValue(pasted);
    expect(await page.evaluate(() => localStorage.length + sessionStorage.length)).toBe(0);
  });

  test('keeps every line break of a multi-line paste in a collapsed field when the prompt is copied', async ({
    page,
  }) => {
    // ARRANGE
    const pasted = '# Pasted\n\nfirst line\nsecond line';
    const { modal } = await open(page, 'light');
    await openStage(page, 'Plan');
    const input = field(modal, 'task');
    // ACT
    await input.fill(pasted);
    await copyPrompt(modal).click();
    await expect.poll(() => copies(page)).toBe(1);
    const written = await copied(page);
    // ASSERT
    expect(written.at(-1)).toContain(pasted);
    await expect(input).toHaveAttribute('rows', '1');
  });

  test('expands a field with the eye toggle and collapses it again', async ({ page }) => {
    // ARRANGE
    const { modal } = await open(page, 'light');
    await openStage(page, 'Plan');
    const input = field(modal, 'task');
    const eye = modal.locator('[data-field="task"] button[aria-pressed]');
    const rows = async () => Number(await input.getAttribute('rows'));
    // ACT
    await expect(input).toHaveAttribute('rows', '1');
    await eye.click();
    // ASSERT
    await expect(eye).toHaveAttribute('aria-pressed', 'true');
    await expect(eye).toHaveAttribute('aria-label', 'Collapse');
    await expect.poll(rows).toBeGreaterThan(1);
    await eye.click();
    await expect(input).toHaveAttribute('rows', '1');
  });

  for (const theme of ['light', 'dark'] as const) {
    test(`has no serious or critical axe-core violation in ${theme}, on the diagram and with the modal open`, async ({
      page,
    }) => {
      // ARRANGE
      const expected: string[] = [];
      await open(page, theme);
      // ACT
      const violations = (selector: string) => () => seriousViolations(page, selector);
      // ASSERT
      await expect.poll(violations(ROOT)).toEqual(expected);
      await openStage(page, 'Requirements');
      await expect.poll(violations(MODAL)).toEqual(expected);
    });
  }

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
    const { modal } = await open(page, 'light', { width: phone });
    // ACT
    await openStage(page, 'Requirements');
    const sideways = () => page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    const box = () => modal.boundingBox();
    // ASSERT
    await expect.poll(sideways).toBeLessThanOrEqual(0);
    await expect.poll(async () => (await box())!.x).toBeGreaterThanOrEqual(0);
    await expect.poll(async () => (await box())!.x + (await box())!.width).toBeLessThanOrEqual(phone);
  });
});
