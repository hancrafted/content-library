import { expect, test, type Locator, type Page } from '@playwright/test';
import axe from 'axe-core';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { hydrated } from '../../../tests/browser/hydrated';

/*
 * The browser seam (`npm run test:browser`, local only until the nightly lands): the Slide "Human in the loop" of the
 * Explorable explanations page in the built export, walked end to end the way a viewer does it. Every wait is a retrying assertion
 * (ARCH-003 §5). See docs/features/human-in-the-loop.md.
 *
 * The popover is a shadcn Dialog, portalled out of the visual: it is found on the page, not inside the root. Each stage
 * is a stepper of jobs; the first job opens with it, and every input carries `data-field` with the key it fills.
 */

const EPISODE = '/explorable-explanations/human-in-the-loop/';
const GERMAN_EPISODE = '/de/explorable-explanations/human-in-the-loop/';
const SLIDE_ANCHOR = 'agentic-workflows--human-in-the-loop';
/** Scoped to the Slide: the page shows the Workflow on four Slides, one per Preset. */
const ROOT = `#${SLIDE_ANCHOR} [data-human-in-the-loop]`;
const MODAL = '[role="dialog"][data-part="modal"]';
/** The one progress key, as `src/config.yaml` names it (FE-001 §3). */
const PROGRESS_KEY = 'hancrafted:progress';
const COPY_PROMPT = 'Copy prompt';
/** Two Workflows by six or seven stages, in one language: more than the default 30s. */
const LONG_TEST = 120_000;
/** A point on the overlay, outside the centred dialog. */
const OVERLAY = { x: 4, y: 4 };

/** A valid Workflow of the viewer's own: the shipped project plan under another id and title. */
const OWN = readFileSync(path.join(__dirname, 'project-plan.en.yml'), 'utf8')
  .replace('id: project-plan', 'id: mine')
  .replace('title: Plan a project', 'title: Mine');

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

/** The localStorage keys in use: the single progress key, never a third. */
const storedKeys = (page: Page) => page.evaluate(() => Object.keys(localStorage));

/** The text under the progress key, as the page keeps it. */
const storedProgress = (page: Page) =>
  page.evaluate((PROGRESS_KEY) => localStorage.getItem(PROGRESS_KEY), PROGRESS_KEY);

/** Puts `store` under the progress key, as an earlier visit would have left it. */
const storeProgress = (page: Page, store: object) =>
  page.evaluate(
    ([PROGRESS_KEY, text]) => localStorage.setItem(PROGRESS_KEY, text),
    [PROGRESS_KEY, JSON.stringify(store)],
  );

/** Presses Save progress and reads the YAML file the browser is handed. */
async function savedProgressFile(root: Locator): Promise<string> {
  const download = root.page().waitForEvent('download');
  await root.locator('[data-control="progressDownload"]').click();
  const stream = await (await download).createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString('utf8');
}

/** Hands the progress load a file with `text`. */
const loadProgress = (root: Locator, text: string) =>
  root
    .locator('[data-control="progressUpload"] input[type=file]')
    .setInputFiles({ name: 'progress.yml', mimeType: 'text/yaml', buffer: Buffer.from(text) });

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

/** Unfolds Step 1, Provide context, of the open job: it starts folded while every field holds a value or a sample. */
async function openContext(modal: Locator) {
  await modal
    .getByRole('button', { name: /Provide context/ })
    .first()
    .click();
}

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

/** How many stages each shipped Workflow draws. */
const STAGES: Record<string, number> = { 'project-plan': 6, vacation: 7 };

/** Opens one Workflow, then every stage of it in turn, and reports what is wrong. */
async function stageProblems(page: Page, id: string, language: Language): Promise<string[]> {
  const stages = STAGES[id] ?? 0;
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
  test('has one pill toolbar: the "Use case" picker showing the chosen Workflow, then Stages · Jobs, the `</>` toggle, Demo mode, loading progress (Save and Reset wait for work), download and upload', async ({
    page,
  }) => {
    // ARRANGE
    const expectedControls = ['picker', 'view', 'level', 'demo', 'progressUpload', 'download', 'upload'];
    const expectedLabel = 'Use case:';
    const expectedChosen = 'Plan a project';
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

  test('lists each use case with its description under the title, and the closed picker shows the title only', async ({
    page,
  }) => {
    // ARRANGE
    const { root } = await open(page, 'light');
    const picker = root.locator('[data-control="picker"]');
    const workflows = 2;
    // ACT
    await expect(picker.getByRole('combobox')).toHaveText('Plan a project');
    await picker.getByRole('combobox').click();
    const options = page.locator('[role="option"] [data-choice-description]');
    // ASSERT
    await expect(options).toHaveCount(workflows);
    await expect(options.first()).toContainText('Turn one big goal');
    await page.keyboard.press('Escape');
    await expect(picker.getByRole('combobox')).not.toContainText('Turn one big goal');
  });

  test('shows the Debug bug toggle, off by default, only on a page with ?debug', async ({ page }) => {
    // ARRANGE
    const plain = await open(page, 'light');
    const without = await plain.toolbar.locator('[data-control="debug"]').count();
    // ACT
    const { toolbar } = await open(page, 'light', { url: `${EPISODE}?debug` });
    const debug = toolbar.locator('[data-control="debug"]');
    await expect(debug).toHaveAttribute('aria-pressed', 'false');
    await debug.click();
    // ASSERT
    expect(without).toBe(0);
    await expect(debug).toHaveAttribute('aria-pressed', 'true');
  });

  test('opens in the Stages view: a card per stage, the two views Stages and Jobs offered, and nothing sideways on a phone', async ({
    page,
  }) => {
    // ARRANGE
    const stages = 6;
    const repeated = 2;
    const phone = 390;
    const { root } = await open(page, 'light', { width: phone });
    // ACT
    const view = root.locator('[data-control="view"]');
    const sideways = () => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    // ASSERT
    await expect(root).toHaveAttribute('data-view', 'stages');
    await expect(root.locator('[data-stage-card]')).toHaveCount(stages - repeated);
    await expect(view.locator('[aria-pressed="true"]')).toHaveText('Stages');
    await expect(view.locator('[data-view-option]')).toHaveText(['Stages', 'Jobs']);
    expect(await sideways()).toBeLessThanOrEqual(0);
  });

  test('crossfades when the view changes, and not at all under reduced motion', async ({ page }) => {
    // ARRANGE
    const { root } = await open(page, 'light');
    const fade = () =>
      root.locator('[data-view-fade]').evaluate((el) => ({
        state: el.getAttribute('data-view-fade'),
        animation: getComputedStyle(el).animationName,
      }));
    // ACT
    const first = await fade();
    await root.locator('[data-view-option="jobs"]').click();
    await expect(root).toHaveAttribute('data-view', 'jobs');
    const moving = await fade();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await root.locator('[data-view-option="stages"]').click();
    await expect(root).toHaveAttribute('data-view', 'stages');
    const still = await fade();
    // ASSERT
    expect(first).toEqual({ state: 'off', animation: 'none' });
    expect(moving).toEqual({ state: 'on', animation: 'slide-fade' });
    expect(still).toEqual({ state: 'on', animation: 'none' });
  });

  test('draws the Jobs view of a repeated stage once, in a bracket of its rounds, and a job card opens its modal', async ({
    page,
  }) => {
    // ARRANGE
    const rounds = 4;
    const brackets = 2;
    const { root, modal } = await open(page, 'light');
    // ACT
    await root.locator('[data-view-option="jobs"]').click();
    const bracket = root.locator('[data-bracket]').last();
    const card = bracket.locator('[data-job-card] button[data-try-job]');
    // ASSERT
    await expect(root).toHaveAttribute('data-view', 'jobs');
    await expect(root.locator('[data-bracket]')).toHaveCount(brackets);
    await expect(bracket.locator('[data-bracket-label]')).toHaveText(`× each ticket (${rounds})`);
    await expect(bracket.locator('[data-job-card]')).toHaveCount(1);
    await card.click();
    await expect(modal).toHaveAttribute('data-stage', 'execute');
    await page.keyboard.press('Escape');
    await expect(card).toBeFocused();
  });

  test('pasting a result in the popover shows progress in the Jobs view: the job is done, then checked, and the rounds take the pasted titles, capped by demo', async ({
    page,
  }) => {
    // ARRANGE
    const pasted = '# Plan\n## Epics\n### Payments\nA.\n### Search\nB.\n### Reports\nC.';
    const taught = ['Payments', 'Search'];
    const { root, modal } = await open(page, 'light');
    await root.locator('[data-view-option="jobs"]').click();
    const epics = root.locator('[data-job-card="epics"] [data-state]');
    const titles = root.locator('[data-bracket]').first().locator('[data-round-title]');
    // ACT
    await expect(root).toHaveAttribute('data-view', 'jobs');
    await expect(root.locator('[data-job-card] [data-state], [data-count]')).toHaveCount(0);
    await root.locator('button[data-try-job="epics"]').click();
    await field(modal, 'plan').fill(pasted);
    await modal.getByRole('button', { name: 'Close' }).click();
    // ASSERT
    await expect(epics).toHaveAttribute('data-state', 'done');
    await expect(titles).toHaveText(taught);
    await root.locator('button[data-try-job="epics"]').click();
    await modal.getByLabel('I checked this result').check();
    await modal.getByRole('button', { name: 'Close' }).click();
    await expect(epics).toHaveAttribute('data-state', 'checked');
  });

  test('shows the same progress in the Stages view: each card its count and mark, the repeated stage its pasted titles', async ({
    page,
  }) => {
    // ARRANGE
    const pasted = '# Plan\n## Epics\n### Payments\nA.\n### Search\nB.\n### Reports\nC.';
    const taught = ['Payments', 'Search'];
    const { root, modal } = await open(page, 'light');
    // ACT
    await expect(root.locator('[data-count]')).toHaveCount(0);
    await openStage(page, 'High-level plan');
    await field(modal, 'task').fill('# A plan');
    await page.keyboard.press('Escape');
    await root.locator('[data-view-option="jobs"]').click();
    await root.locator('button[data-try-job="epics"]').click();
    await field(modal, 'plan').fill(pasted);
    await modal.getByRole('button', { name: 'Close' }).click();
    await root.locator('[data-view-option="stages"]').click();
    // ASSERT
    await expect(root).toHaveAttribute('data-view', 'stages');
    await expect(root.locator('[data-stage-progress] [data-count]').first()).toBeVisible();
    await expect(root.locator('[data-branch] [data-branch-title]').first()).toHaveText(taught[0]!);
    await expect(root.locator('[data-branch] [data-branch-title]')).toContainText(taught);
  });

  test('opens a stage as a stepper: the stage title, the first job open, its prompt copied with no marker left', async ({
    page,
  }) => {
    // ARRANGE
    const expectedTitle = 'High-level plan: Practice it';
    const expectedOpen = 1;
    const interview = '## Done looks like';
    const placeholder = '{{';
    const copiedStatus = 'Copied';
    const { modal } = await open(page, 'light');
    // ACT
    await openStage(page, 'High-level plan');
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
    await root.locator('[data-control="level"]').click();
    await openStage(page, 'Interview');
    await copyPrompt(modal).click();
    // ASSERT
    await expect.poll(async () => (await copied(page)).at(-1)).toContain(command);
  });

  test.describe('the </> toggle', () => {
    for (const [name, url, tip] of [
      ['English', EPISODE, 'CLI: show the setup and /skill commands'],
      ['German', GERMAN_EPISODE, 'CLI: zeigt die Einrichtung und die /Skill-Befehle'],
    ] as const) {
      test(`is one icon toggle named CLI that is off by default and turns on in ${name}`, async ({ page }) => {
        // ARRANGE
        const { root, toolbar } = await open(page, 'light', { url });
        const toggle = toolbar.locator('[data-control="level"]');
        // ACT
        await expect(toggle).toHaveAttribute('aria-pressed', 'false');
        await toggle.click();
        // ASSERT
        await expect(toggle).toHaveAccessibleName('CLI');
        await expect(toggle).toHaveAttribute('aria-pressed', 'true');
        await expect(root).toHaveAttribute('data-level', 'technical');
        await page.mouse.move(0, 0);
        await toggle.hover();
        await expect(page.getByRole('tooltip')).toContainText(tip);
      });
    }
  });

  test('runs the Epics stage as two rounds in demo mode, each titled by an example epic, with the grill capped at five questions', async ({
    page,
  }) => {
    // ARRANGE
    const exampleTitles = ['Date and venue:', 'Travel and accommodation:'];
    const questions = 'at most 5 questions';
    const { modal } = await open(page, 'light');
    const rounds = () => modal.locator('[data-job="grill"] [data-slot="accordion-trigger"]');
    // ACT
    await openStage(page, 'Epics');
    await copyPrompt(modal).click();
    await expect.poll(() => copies(page)).toBe(1);
    // ASSERT
    await expect(rounds()).toContainText(exampleTitles);
    await expect(rounds()).toHaveCount(exampleTitles.length);
    await expect.poll(async () => (await copied(page))[0]).toContain(questions);
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
        for (const id of ['project-plan', 'vacation']) problems.push(...(await stageProblems(page, id, language)));
        // ASSERT
        expect(problems).toEqual(expected);
      });
    }
  });

  test('carries a result pasted in one stage into the copied prompt of a later stage, keeps it across close and reopen', async ({
    page,
  }) => {
    // ARRANGE
    const pasted = '# PASTED TASK MARKER';
    const { modal } = await open(page, 'light');
    // ACT
    await openStage(page, 'High-level plan');
    await field(modal, 'task').fill(pasted);
    await modal.locator('[data-job="scope"] [data-slot="accordion-trigger"]').click();
    await copyPrompt(modal).click();
    await expect.poll(() => copies(page)).toBe(1);
    const written = await copied(page);
    await modal.getByRole('button', { name: 'Close' }).click();
    await openStage(page, 'High-level plan');
    // ASSERT
    expect(written.at(-1)).toContain(pasted);
    await expect(field(modal, 'task')).toHaveValue(pasted);
  });

  test('turns demo off before the first paste so the rounds follow the pasted tickets, then locks the switch until Reset', async ({
    page,
  }) => {
    // ARRANGE
    const pasted = '# Tickets\n## Tickets\n### Camper van\nA.\n### Cabin\nB.\n### Hostel\nC.\n### Tent\nD.';
    const fullRounds = 4;
    const { modal, root, toolbar } = await open(page, 'light');
    await pickWorkflow(root, 'vacation');
    const demo = toolbar.locator('[data-control="demo"]');
    const rounds = () => modal.locator('[data-job="venue"] [data-slot="accordion-trigger"]');
    // ACT
    await expect(demo).toBeEnabled();
    await expect(demo).toHaveAttribute('aria-checked', 'true');
    await demo.click();
    await openStage(page, 'Tickets');
    await field(modal, 'tickets').fill(pasted);
    await modal.getByRole('button', { name: 'Close' }).click();
    await openStage(page, 'Research');
    // ASSERT
    await expect(rounds()).toHaveCount(fullRounds);
    await expect(modal.locator('[data-control="demo"]')).toBeDisabled();
    await modal.locator('[data-control="demo"]').locator('xpath=..').hover();
    await expect(page.getByRole('tooltip')).toContainText('Reset to change');
    await modal.locator('[data-control="reset"]').click();
    await modal.locator('[data-reset-now]').click();
    await expect(modal.locator('[data-control="demo"]')).toBeEnabled();
    await expect(modal.locator('[data-control="demo"]')).toHaveAttribute('aria-checked', 'true');
  });

  test('turns Reset to the warning colour once work is saved, confirms inside the popover and clears only this Workflow', async ({
    page,
  }) => {
    // ARRANGE
    const pasted = '# RESET MARKER';
    const other = { 'human-in-the-loop/vacation': { hash: 'h', demo: true, results: { 'a.b': 'keep' } } };
    await open(page, 'light');
    await storeProgress(page, other);
    const { modal, root } = await open(page, 'light');
    // Reset sits set apart after the toolbar pill, not inside it.
    const reset = root.locator('[data-control="reset"]');
    // ACT
    await expect(reset).toHaveCount(0);
    await openStage(page, 'High-level plan');
    await field(modal, 'task').fill(pasted);
    const popoverReset = modal.locator('[data-control="reset"]');
    await expect(popoverReset).toHaveAttribute('data-has-work', 'true');
    await popoverReset.click();
    // ASSERT
    const confirm = modal.locator('[data-reset-confirm]');
    await expect(confirm).toBeVisible();
    await expect(confirm.getByRole('button', { name: 'Download progress' })).toBeVisible();
    await confirm.locator('[data-reset-now]').click();
    await expect(confirm).toHaveCount(0);
    await expect(field(modal, 'task')).toHaveValue('');
    await expect(popoverReset).toHaveCount(0);
    await expect.poll(() => storedProgress(page)).not.toContain('RESET MARKER');
    expect(await storedProgress(page)).toContain('keep');
  });

  test('keeps a pasted result across a reload and a switch of language, under the one progress key', async ({
    page,
  }) => {
    // ARRANGE
    const pasted = '# SAVED SPEC MARKER';
    const first = 0;
    const { modal } = await open(page, 'light');
    await openStage(page, 'High-level plan');
    await field(modal, 'task').fill(pasted);
    await expect.poll(() => storedKeys(page)).toEqual([PROGRESS_KEY]);
    await modal.getByRole('button', { name: 'Close' }).click();
    // ACT
    await open(page, 'light');
    await openStage(page, 'High-level plan');
    await expect(field(modal, 'task')).toHaveValue(pasted);
    await page.keyboard.press('Escape');
    const german = await open(page, 'light', { url: GERMAN_EPISODE });
    await german.root.locator('[data-part="diagram"] button[data-try]').nth(first).click();
    // ASSERT
    await expect(field(german.modal, 'task')).toHaveValue(pasted);
  });

  test('keeps every line break of a multi-line paste in a collapsed field when the prompt is copied', async ({
    page,
  }) => {
    // ARRANGE
    const pasted = '# Pasted\n\nfirst line\nsecond line';
    const { modal } = await open(page, 'light');
    await openStage(page, 'High-level plan');
    await openContext(modal);
    const input = field(modal, 'idea');
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
    await openStage(page, 'High-level plan');
    await openContext(modal);
    const input = field(modal, 'idea');
    const eye = modal.locator('[data-field="idea"] button[aria-pressed]');
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

  test('restores the run from the progress file it downloaded, with every result as a block scalar', async ({
    page,
  }) => {
    // ARRANGE
    const first = '# First spec\n\nline two';
    const second = '# Second spec';
    const { root, modal } = await open(page, 'light');
    await openStage(page, 'High-level plan');
    await field(modal, 'task').fill(first);
    await page.keyboard.press('Escape');
    // ACT
    const file = await savedProgressFile(root);
    await openStage(page, 'High-level plan');
    await field(modal, 'task').fill(second);
    await page.keyboard.press('Escape');
    await loadProgress(root, file);
    await openStage(page, 'High-level plan');
    // ASSERT
    expect(file).toMatch(/^workflow: project-plan\nhash: [0-9a-f]{64}\ndemo: true\nresults:\n/);
    expect(file).toContain('plan.task: |-\n    # First spec\n\n    line two');
    await expect(field(modal, 'task')).toHaveValue(first);
  });

  test('shows Save progress and Reset only once the run has work, and Load progress always', async ({ page }) => {
    // ARRANGE
    const { root, modal } = await open(page, 'light');
    const save = root.locator('[data-control="progressDownload"]');
    const load = root.locator('[data-control="progressUpload"]');
    const reset = root.locator('[data-control="reset"]');
    // ACT
    const before = [await save.count(), await reset.count(), await load.count()];
    await openStage(page, 'High-level plan');
    await field(modal, 'task').fill('# Work');
    await page.keyboard.press('Escape');
    // ASSERT
    expect(before).toEqual([0, 0, 1]);
    await expect(save).toHaveCount(1);
    await expect(reset).toHaveCount(1);
    await expect(load).toHaveCount(1);
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
});

test.describe('failure cases', () => {
  test('starts fresh when the saved run belongs to an edited Workflow, keeps the old entry, and Discard clears it', async ({
    page,
  }) => {
    // ARRANGE
    const stale = { hash: 'an-older-edit', demo: true, results: { 'plan.task': '# OLD' } };
    const { modal } = await open(page, 'light');
    await storeProgress(page, { 'human-in-the-loop/project-plan': stale });
    // ACT
    const { root } = await open(page, 'light');
    const note = root.locator('[data-progress-note="stale"]');
    await expect(note).toBeVisible();
    await openStage(page, 'High-level plan');
    await expect(field(modal, 'task')).toHaveValue('');
    await page.keyboard.press('Escape');
    const kept = await storedProgress(page);
    await note.getByRole('button', { name: 'Discard' }).click();
    // ASSERT
    expect(kept).toContain('an-older-edit');
    await expect(note).toHaveCount(0);
    expect(await storedProgress(page)).not.toContain('an-older-edit');
  });

  test('tells the viewer to download their progress when the browser refuses to save it', async ({ page }) => {
    // ARRANGE
    await page.addInitScript(() => {
      Storage.prototype.setItem = () => {
        throw new Error('QuotaExceededError');
      };
    });
    const { root, modal } = await open(page, 'light');
    // ACT
    await openStage(page, 'High-level plan');
    await field(modal, 'task').fill('# NOT SAVED');
    await page.keyboard.press('Escape');
    // ASSERT
    await expect(root.locator('[data-progress-note="unsaved"]')).toBeVisible();
    await expect(root.getByRole('button', { name: 'Download progress' })).toBeVisible();
  });

  test('refuses a progress file of an edited Workflow, naming it, and keeps the run', async ({ page }) => {
    // ARRANGE
    const kept = '# Kept';
    const { root, modal } = await open(page, 'light');
    await openStage(page, 'High-level plan');
    await field(modal, 'task').fill(kept);
    await page.keyboard.press('Escape');
    const file = (await savedProgressFile(root)).replace(/hash: [0-9a-f]{64}/, 'hash: edited');
    // ACT
    await loadProgress(root, file);
    await openStage(page, 'High-level plan');
    // ASSERT
    await expect(root.locator('[data-upload-problems] li')).toContainText('Plan a project changed');
    await expect(field(modal, 'task')).toHaveValue(kept);
  });

  test('refuses a progress file of another Workflow', async ({ page }) => {
    // ARRANGE
    const { root, modal } = await open(page, 'light');
    await openStage(page, 'High-level plan');
    await field(modal, 'task').fill('# Some work');
    await page.keyboard.press('Escape');
    const file = (await savedProgressFile(root)).replace('workflow: project-plan', 'workflow: vacation');
    // ACT
    await loadProgress(root, file);
    // ASSERT
    await expect(root.locator('[data-upload-problems] li')).toContainText('another Workflow');
    await expect(root).toHaveAttribute('data-human-in-the-loop', 'project-plan');
  });

  test('has no progress save or load while an uploaded Workflow is shown, which is not kept', async ({ page }) => {
    // ARRANGE
    const { root } = await open(page, 'light');
    // ACT
    await root
      .locator('[data-control="upload"] input[type=file]')
      .setInputFiles({ name: 'mine.yml', mimeType: 'text/yaml', buffer: Buffer.from(OWN) });
    // ASSERT
    await expect(root).toHaveAttribute('data-human-in-the-loop', 'mine');
    await expect(root.locator('[data-control="progressDownload"], [data-control="progressUpload"]')).toHaveCount(0);
  });

  test('reports the problems of a broken uploaded Workflow and keeps the authored one', async ({ page }) => {
    // ARRANGE
    const authored = 'project-plan';
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
