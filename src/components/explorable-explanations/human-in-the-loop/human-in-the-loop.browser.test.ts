import { expect, test, type Locator, type Page } from '@playwright/test';
import axe from 'axe-core';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { hydrated } from '../../../../tests/browser/hydrated';
import { settled } from '../../../../tests/browser/settled';

/*
 * The browser seam (`npm run test:browser`, local only until the nightly lands): the Slide "Human in the loop" of the
 * Slides Episode in the built export, walked end to end the way a viewer does it. Every wait is a retrying assertion
 * or `data-motion="settled"` (ARCH-003 §5). See docs/features/human-in-the-loop.md.
 */

const EPISODE = '/episodes/slides/';
const GERMAN_EPISODE = '/de/episodes/slides/';
const SLIDE_ANCHOR = 'agentic-workflows--human-in-the-loop';
const ROOT = '[data-human-in-the-loop]';
const MODAL = `${ROOT} dialog[data-part="modal"]`;
const COPY_PROMPT = /Copy prompt/;
const TECHNICAL = /Technical/;
/** Two Workflows by seven stages, in one language: more than the default 30s. */
const LONG_TEST = 120_000;
const BACKDROP = { position: { x: 4, y: 4 } };

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
  return {
    root,
    toolbar: root.locator('[data-part="toolbar"]'),
    modal: page.locator(MODAL),
  };
}

const copied = (page: Page) => page.evaluate(() => (window as unknown as { __copied: string[] }).__copied);
const copies = (page: Page) => copied(page).then((all) => all.length);

/** Presses a stage's column (its "Practice it" button) and waits for its modal. */
async function openStage(page: Page, stage: string) {
  await page.locator(`${ROOT} [data-part="diagram"] button[data-try="${stage}"]`).click();
  await expect(page.locator(MODAL)).toBeVisible();
}

const task = (modal: Locator, step = 'do') => modal.locator(`[data-step="${step}"]`);
const copyOf = (modal: Locator, step = 'do') => task(modal, step).getByRole('button', { name: COPY_PROMPT });
const promptToggle = (modal: Locator, step = 'do') =>
  task(modal, step).locator('[data-prompt] > div:first-child button[aria-expanded]').first();

/** Opens the prompt of a task, where its paste-in fields are, unless it opened with the modal. */
async function showPrompt(modal: Locator, step = 'do') {
  const toggle = promptToggle(modal, step);
  if ((await toggle.getAttribute('aria-expanded')) === 'false') await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
}

/** Fills a paste-in field the way a viewer types or pastes into it. */
const paste = (field: Locator, text: string) => field.fill(text);

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

/** What is wrong with the opened stage's popover: its title, goal, prompts, details and any unfilled marker. */
async function popoverProblems(page: Page, where: string, title: RegExp): Promise<string[]> {
  const modal = page.locator(MODAL);
  const heading = (await modal.locator('header h2').textContent()) ?? '';
  const goal = (await modal.locator('header [data-goal]').textContent()) ?? '';
  const prompts = await modal
    .locator('[data-prompt-text]')
    .evaluateAll((els) => els.map((el) => el.getAttribute('data-prompt-text') ?? ''));
  const details = await modal.locator('[data-details]').count();
  const checks: [boolean, string][] = [
    [!title.test(heading), `title "${heading}"`],
    [!goal, 'no goal'],
    [prompts.length > 0 && details !== 1, 'no prompt or details'],
    [prompts.some((prompt) => prompt.includes('{{')), 'unfilled marker'],
  ];
  return checks.filter(([wrong]) => wrong).map(([, what]) => `${where}: ${what}`);
}

/** Opens one Workflow by its use case, then every stage of it in turn, and reports what is wrong. */
async function stageProblems(page: Page, workflow: { pill: string; id: string; title: RegExp }): Promise<string[]> {
  const { pill, id, title } = workflow;
  const stages = 7;
  const root = page.locator(ROOT);
  await root.locator('[data-control="picker"] select').selectOption(id);
  await expect(root).toHaveAttribute('data-human-in-the-loop', id);
  const buttons = root.locator('[data-part="diagram"] button[data-try]');
  await expect(buttons).toHaveCount(stages);
  const names = await buttons.evaluateAll((els) => els.map((el) => el.getAttribute('data-try') ?? ''));
  const problems: string[] = [];
  for (const name of names) {
    await openStage(page, name);
    problems.push(...(await popoverProblems(page, `${pill}/${name}`, title)));
    await page.keyboard.press('Escape');
    await expect(page.locator(MODAL)).toHaveCount(0);
  }
  return problems;
}

/** Opens the stage's prompts and panels, as a viewer would, so the longest prompt is on screen. */
async function expandAll(modal: Locator) {
  const closed = modal.locator(
    '[data-prompt] > div:first-child button[aria-expanded="false"], [data-panel-toggle][aria-expanded="false"]',
  );
  while ((await closed.count()) > 0) await closed.first().click();
}

test.describe('success cases', () => {
  test('has one pill toolbar: the "Use case" picker, then Technical, download and upload as icon buttons with tooltips', async ({
    page,
  }) => {
    // ARRANGE
    const expectedUseCases = ['Plan company summer party', 'Plan personal vacation'];
    const expectedLabel = 'Use case:';
    const expectedDefault = 'summer-party';
    const expectedIcons = ['level', 'download', 'upload'];
    const { root, toolbar } = await open(page, 'light');
    // ACT
    const picker = toolbar.locator('[data-control="picker"]');
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
    await expect(picker.locator('option')).toHaveText(expectedUseCases);
    await expect(picker.locator('label')).toHaveText(expectedLabel);
    await expect(picker.locator('select')).toHaveValue(expectedDefault);
    await expect.poll(async () => (await icons()).map((icon) => icon.control)).toEqual(expectedIcons);
    await expect.poll(async () => (await icons()).filter((icon) => icon.tip.length === 0)).toEqual([]);
    await expect(toolbar.locator('button, input, select')).toHaveCount(1 + expectedIcons.length);
    await expect(root).not.toContainText(/Watch|Try it yourself/);
  });

  test('opens a stage modal from its column: title, X top right, the first prompt open, copy, then Escape and backdrop close', async ({
    page,
  }) => {
    // ARRANGE
    const expectedTitle = 'Requirements: Practice it';
    const expectedSteps = ['do', 'review'];
    const expectedLinks = ['https://chatgpt.com/'];
    const exampleViews = 1;
    const interview = '## Questions and answers';
    const placeholder = '{{';
    const copiedStatus = 'Copied';
    const edge = 40;
    const { modal } = await open(page, 'light');
    // ACT
    await openStage(page, 'Requirements');
    const panel = () => modal.locator(':scope > div').boundingBox();
    const close = () => modal.locator('header button[aria-label="Close"]').boundingBox();
    await copyOf(modal).click();
    await expect(modal.getByRole('status')).toHaveText(copiedStatus);
    const links = () =>
      task(modal)
        .locator('a[target="_blank"]')
        .evaluateAll((els) => els.map((el) => (el as HTMLAnchorElement).href.split('?')[0]));
    const steps = () =>
      modal.locator('[data-step]').evaluateAll((els) => els.map((el) => el.getAttribute('data-step')));
    // ASSERT
    await expect(modal.locator('header h2')).toHaveText(expectedTitle);
    await expect.poll(async () => (await close())!.y - (await panel())!.y).toBeLessThan(edge);
    await expect
      .poll(async () => (await panel())!.x + (await panel())!.width - ((await close())!.x + (await close())!.width))
      .toBeLessThan(edge);
    await expect.poll(steps).toEqual(expectedSteps);
    await expect(modal.locator('[data-prompt]')).toHaveCount(expectedSteps.length);
    await expect(modal.locator('[data-prompt] > div:first-child button[aria-expanded="true"]')).toHaveCount(1);
    await expect(promptToggle(modal)).toHaveAttribute('aria-expanded', 'true');
    await expect.poll(() => copied(page)).toHaveLength(1);
    await expect.poll(async () => (await copied(page))[0]).toContain(interview);
    await expect.poll(async () => (await copied(page))[0]).not.toContain(placeholder);
    await expect.poll(links).toEqual(expectedLinks);
    await expect(modal.locator('[data-output="markdown"]')).toHaveCount(exampleViews);
    await modal.click(BACKDROP);
    await expect(modal).toHaveCount(0);
    await openStage(page, 'Requirements');
    await page.keyboard.press('Escape');
    await expect(modal).toHaveCount(0);
  });

  test('closes the modal with the X button and folds the open first prompt on demand', async ({ page }) => {
    // ARRANGE
    const { modal } = await open(page, 'light');
    await openStage(page, 'Interview');
    const toggle = promptToggle(modal);
    await expect(task(modal).locator('[data-prompt-text]')).toBeVisible();
    // ACT
    await toggle.click();
    // ASSERT
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await settled(toggle.locator('svg'));
    await modal.getByRole('button', { name: 'Close' }).click();
    await expect(modal).toHaveCount(0);
  });

  test('returns focus to the stage column on every close path: X, Escape and backdrop', async ({ page }) => {
    // ARRANGE
    const stage = 'Requirements';
    const { modal } = await open(page, 'light');
    const closers = [
      () => modal.getByRole('button', { name: 'Close' }).click(),
      () => page.keyboard.press('Escape'),
      () => modal.click(BACKDROP),
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
    await modal.locator('header button').first().focus();
    await expect(tip.first()).toHaveAttribute('data-shown', 'true');
    await page.keyboard.press('Escape');
    // ASSERT
    await expect.poll(async () => (await circles()).filter((size) => size < minTarget)).toEqual([]);
    await expect(tip.first()).toHaveAttribute('data-shown', 'false');
    await expect(modal).toHaveAttribute('open', '');
    await page.keyboard.press('Escape');
    await expect(modal).toHaveCount(0);
  });

  test('switches to Vacation with its own card lines, then copies the /grilling prompt in Technical', async ({
    page,
  }) => {
    // ARRANGE
    const vacation = 'vacation';
    const summerLine = 'At most €150 per person';
    const vacationLine = 'Sleeps 2';
    const { root, toolbar, modal } = await open(page, 'light');
    const diagram = root.locator('[data-part="diagram"]');
    await expect(diagram).toContainText(summerLine);
    // ACT
    await toolbar.locator('[data-control="picker"] select').selectOption(vacation);
    await expect(root).toHaveAttribute('data-human-in-the-loop', vacation);
    await toolbar.getByRole('button', { name: TECHNICAL }).click();
    await openStage(page, 'Interview');
    await copyOf(modal).click();
    await expect.poll(() => copies(page)).toBe(1);
    const written = await copied(page);
    // ASSERT
    await expect(diagram).toContainText(vacationLine);
    await expect(diagram).not.toContainText(summerLine);
    expect(written[0]).toContain('/grilling');
  });

  test('gives Compare one research slot: Add entry shows chats 2 and 3, and the copied prompt carries the three venue samples', async ({
    page,
  }) => {
    // ARRANGE
    const entries = 3;
    const venues = ['Old Mill', 'Grand Hotel Mainblick', 'Riverside Garden Pavilion'];
    const { modal } = await open(page, 'light');
    await openStage(page, 'Compare');
    await showPrompt(modal);
    const slot = task(modal).locator('[data-slot="research"]');
    const add = slot.locator('[data-slot-add] button');
    // ACT
    await expect(slot.locator('[data-slot-entry]')).toHaveCount(1);
    for (let at = 1; at < entries; at++) await add.click();
    await expect(slot.locator('[data-slot-entry]')).toHaveCount(entries);
    const placeholders = await slot
      .locator('textarea')
      .evaluateAll((els) =>
        els.map((el) => (el as HTMLTextAreaElement).placeholder.replace(/^Sample: (.*) · \d+ lines$/, '# $1')),
      );
    await copyOf(modal).click();
    await expect.poll(() => copies(page)).toBe(1);
    const written = await copied(page);
    // ASSERT
    await expect(slot.locator('[data-slot-add]')).toHaveCount(0);
    expect(placeholders).toEqual(venues.map((name) => `# ${name}`));
    for (const venue of venues) expect(written[0]).toContain(`# ${venue}`);
  });

  test('shows one example per Research chat in the details, and the Plan task slot with the summer party as its sample', async ({
    page,
  }) => {
    // ARRANGE
    const chats = 3;
    const { modal } = await open(page, 'light');
    // ACT
    await openStage(page, 'Research');
    const examples = modal.locator('[data-details] [data-example]');
    await expect(examples).toHaveCount(chats);
    await page.keyboard.press('Escape');
    await expect(modal).toHaveCount(0);
    await openStage(page, 'Plan');
    await showPrompt(modal);
    const sample = modal.locator('[data-slot-entry="task"] textarea');
    // ASSERT
    await expect(sample).toHaveAttribute('placeholder', /summer party/i);
    await expect(sample).not.toHaveAttribute('placeholder', /describe/);
  });

  test('lists the techniques of a task under why it matters, and those of a section with their tier in its purpose tooltip', async ({
    page,
  }) => {
    // ARRANGE
    const expectedTechniques = ['fresh-context:advanced', 'cite-sources:basic', 'separate-verification:advanced'];
    const { modal } = await open(page, 'light');
    // ACT
    await openStage(page, 'Research');
    const listed = () =>
      modal
        .locator('[data-column="details"] [data-technique]')
        .evaluateAll((els) => els.map((el) => `${el.getAttribute('data-technique')}:${el.getAttribute('data-tier')}`));
    const tip = modal
      .locator('[data-purpose][data-techniques~="cite-sources"]')
      .first()
      .locator('xpath=ancestor::*[@data-tip-host][1]')
      .locator('[data-tip-text]');
    // ASSERT
    await expect.poll(listed).toEqual(expect.arrayContaining(expectedTechniques));
    await expect(tip).toHaveText(/Cite sources \(Basic\)/);
    await expect.poll(() => modal.locator('[data-purpose]:not([data-techniques])').count()).toBeGreaterThan(0);
  });

  test.describe('every stage in both languages', () => {
    test.describe.configure({ timeout: LONG_TEST });

    for (const language of [
      {
        name: 'English',
        url: EPISODE,
        title: /Practice it$/,
        pills: { 'summer-party': 'Plan company summer party', vacation: 'Plan personal vacation' },
      },
      {
        name: 'German',
        url: GERMAN_EPISODE,
        title: /Üben$/,
        pills: { 'summer-party': 'Firmen-Sommerfest planen', vacation: 'Privaten Urlaub planen' },
      },
    ]) {
      test(`opens every stage of both Workflows in ${language.name} with its goal, prompts and no unfilled marker`, async ({
        page,
      }) => {
        // ARRANGE
        const expected: string[] = [];
        await open(page, 'light', { url: language.url });
        const problems: string[] = [];
        // ACT
        for (const [id, pill] of Object.entries(language.pills))
          problems.push(...(await stageProblems(page, { pill, id, title: language.title })));
        // ASSERT
        expect(problems).toEqual(expected);
      });
    }
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

  test('carries a spec pasted in one stage into the copied prompt of a later stage, keeps it across close and reopen, and stores nothing', async ({
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
    await openStage(page, 'Tickets');
    await showPrompt(modal);
    const spec = () => task(modal).locator('[data-slot-entry="spec"] textarea');
    await paste(spec(), pasted);
    await modal.getByRole('button', { name: 'Close' }).click();
    await expect(modal).toHaveCount(0);
    await openStage(page, 'Compare');
    await copyOf(modal).click();
    await expect.poll(() => copies(page)).toBe(1);
    const written = await copied(page);
    await modal.getByRole('button', { name: 'Close' }).click();
    await expect(modal).toHaveCount(0);
    await openStage(page, 'Tickets');
    await showPrompt(modal);
    // ASSERT
    expect(written.at(-1)).toContain(pasted);
    await expect(spec()).toHaveValue(pasted);
    expect(await page.evaluate(() => localStorage.length + sessionStorage.length)).toBe(0);
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

  test('heads the popover with the stage title, its learning goal and the simple/technical toggle beside Close', async ({
    page,
  }) => {
    // ARRANGE
    const expectedButtons = ['Technical', 'Close'];
    const { root, modal } = await open(page, 'light');
    await openStage(page, 'Plan');
    // ACT
    const buttons = () =>
      modal.locator('header button').evaluateAll((els) => els.map((el) => el.getAttribute('aria-label')));
    const toggle = modal.locator('header').getByRole('button', { name: TECHNICAL });
    await toggle.click();
    // ASSERT
    await expect(modal.locator('header h2')).toHaveText('Plan: Practice it');
    await expect(modal.locator('header [data-goal]')).toHaveText(/^Break it down/);
    await expect.poll(buttons).toEqual(expectedButtons);
    await expect(root).toHaveAttribute('data-level', 'technical');
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  });

  test('lays the tasks and their details in two columns on desktop, the details following the focused task, shown once', async ({
    page,
  }) => {
    // ARRANGE
    const { modal } = await open(page, 'light', { width: 1440 });
    await openStage(page, 'Requirements');
    // ACT
    await modal.locator('[data-column="tasks"] [data-step="review"] button').first().focus();
    const tasks = modal.locator('[data-column="tasks"]');
    const details = modal.locator('[data-column="details"]');
    // ASSERT
    await expect
      .poll(
        async () =>
          (await details.boundingBox())!.x - ((await tasks.boundingBox())!.x + (await tasks.boundingBox())!.width),
      )
      .toBeGreaterThanOrEqual(0);
    const job = await modal.locator('[data-job]').first().getAttribute('data-job');
    await expect(details.locator('[data-details]')).toHaveAttribute('data-task', job!);
    await expect(modal.locator('[data-details]')).toHaveCount(1);
    await expect(modal.getByText('What good looks like')).toHaveCount(1);
  });

  test('goes full screen on a phone: sticky header, details folded under the task', async ({ page }) => {
    // ARRANGE
    const phone = { width: 390, height: 900 };
    const { modal } = await open(page, 'light', { width: phone.width });
    await openStage(page, 'Requirements');
    const panel = modal.locator(':scope > div');
    const header = modal.locator('header');
    const folded = modal.locator('[data-job] details[data-details]');
    // ACT
    const headerBefore = (await header.boundingBox())!.y;
    await modal.locator('[data-scroll]').evaluate((el) => {
      el.scrollTop = 400;
    });
    // ASSERT
    await expect.poll(async () => (await panel.boundingBox())!.width).toBe(phone.width);
    await expect.poll(async () => (await panel.boundingBox())!.height).toBe(phone.height);
    await expect.poll(async () => (await header.boundingBox())!.y).toBe(headerBefore);
    await expect(folded).toHaveCount(1);
    await expect(folded).not.toHaveAttribute('open', '');
    await expect(modal.locator('[data-column]')).toHaveCount(0);
    await folded.locator('summary').click();
    await expect(folded).toHaveAttribute('open', '');
    await expect(modal.locator('[data-details]')).toHaveCount(1);
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth))
      .toBeLessThanOrEqual(0);
  });

  test('fans a task out as Chat 1..N tabs in simple mode and one orchestrator prompt in technical mode', async ({
    page,
  }) => {
    // ARRANGE
    const chatNames = ['Chat 1', 'Chat 2', 'Chat 3'];
    const orchestrator = 'one subagent per ticket';
    const technicalCopy = 2;
    const { modal } = await open(page, 'light', { width: 1440 });
    await openStage(page, 'Research');
    const tabs = modal.getByRole('tab');
    const shownCopy = () =>
      modal.locator('[data-step="do"] [role="tabpanel"]:not([hidden])').getByRole('button', { name: COPY_PROMPT });
    // ACT
    await expect(tabs).toHaveText(chatNames);
    await expect(modal.locator('[role="tabpanel"]:not([hidden])')).toHaveCount(1);
    await shownCopy().click();
    await expect.poll(() => copies(page)).toBe(1);
    await tabs.filter({ hasText: 'Chat 2' }).click();
    await expect(tabs.filter({ hasText: 'Chat 2' })).toHaveAttribute('aria-selected', 'true');
    await shownCopy().click();
    await expect.poll(() => copies(page)).toBe(2);
    await modal.locator('header').getByRole('button', { name: TECHNICAL }).click();
    await expect(tabs).toHaveCount(0);
    await copyOf(modal).click();
    await expect.poll(() => copies(page)).toBe(3);
    const written = await copied(page);
    // ASSERT
    expect(written[0]).toContain('This is chat 1');
    expect(written[1]).toContain('This is chat 2');
    expect(written[technicalCopy]).toContain(orchestrator);
  });

  test('writes Copy prompt and Open in ChatGPT out on desktop, icons only on a phone, and shows no tooltip in a prompt', async ({
    page,
  }) => {
    // ARRANGE
    const link = (modal: Locator) => task(modal).locator('a[target="_blank"]');
    const visibleText = (links: Locator) =>
      links.evaluateAll((els) =>
        els.map((el) =>
          [...el.querySelectorAll('span')]
            .filter((s) => s.offsetWidth > 0)
            .map((s) => s.textContent)
            .join('')
            .trim(),
        ),
      );
    const copyWritten = 'Copy prompt';
    const copyButton = (modal: Locator) => task(modal).getByRole('button', { name: COPY_PROMPT });
    const promptTips = (modal: Locator) => modal.locator('[data-prompt] [data-tip-host]:not(:has([data-purpose]))');
    const phoneWidth = 390;
    // ACT
    const desktop = await open(page, 'light', { width: 1440 });
    await openStage(page, 'Requirements');
    // ASSERT
    await expect.poll(() => visibleText(link(desktop.modal))).toEqual(['Open in ChatGPT']);
    await expect.poll(() => visibleText(copyButton(desktop.modal))).toEqual([copyWritten]);
    await expect(promptTips(desktop.modal)).toHaveCount(0);
    const phone = await open(page, 'light', { width: phoneWidth });
    await openStage(page, 'Requirements');
    await expect.poll(() => visibleText(link(phone.modal))).toEqual(['']);
  });

  test('shows each Research chat pill whole, not cut to "C.", at 1280px', async ({ page }) => {
    // ARRANGE
    const chatNames = ['Chat 1', 'Chat 2', 'Chat 3'];
    const { root } = await open(page, 'light', { width: 1280 });
    // ACT
    const pills = root.locator('[data-part="diagram"] span.truncate');
    const cut = () =>
      pills.evaluateAll((els) => els.filter((el) => el.scrollWidth > el.clientWidth).map((el) => el.textContent));
    // ASSERT
    await expect(pills).toHaveText(chatNames);
    await expect.poll(cut).toEqual([]);
  });

  for (const [width, stage] of [
    [1280, 'Review'],
    [1280, 'Compare'],
    [390, 'Review'],
    [390, 'Compare'],
  ] as const) {
    test(`keeps every element inside the modal at ${width}px with the longest prompts of ${stage} expanded`, async ({
      page,
    }) => {
      // ARRANGE
      const expected: string[] = [];
      const { modal } = await open(page, 'light', { width });
      await openStage(page, stage);
      // ACT
      await expandAll(modal);
      const right = () =>
        modal.evaluate((dialog) => {
          const panel = dialog.querySelector(':scope > div')!.getBoundingClientRect();
          return [...dialog.querySelectorAll(':scope > div *')]
            .filter((el) => el.getClientRects().length > 0 && !el.closest('[hidden]') && !el.closest('[data-tip-text]'))
            .filter((el) => el.getBoundingClientRect().right > panel.right + 1)
            .map((el) => `${el.tagName} ${String(el.className).slice(0, 40)}`);
        });
      const scrollerBelow = () =>
        modal.evaluate((dialog) => {
          const panel = dialog.querySelector(':scope > div')!.getBoundingClientRect();
          return dialog.querySelector('[data-scroll]')!.getBoundingClientRect().bottom > panel.bottom + 1;
        });
      // ASSERT
      await expect.poll(right).toEqual(expected);
      await expect.poll(scrollerBelow).toBe(false);
    });
  }

  test('opens What to do and closes Prompt preview by default, with aria-expanded on both', async ({ page }) => {
    // ARRANGE
    const { modal } = await open(page, 'light');
    await openStage(page, 'Compare');
    // ACT
    const todo = task(modal).locator('[data-panel-toggle="todo"]');
    const preview = task(modal).locator('[data-panel-toggle="preview"]');
    // ASSERT
    await expect(todo).toHaveAttribute('aria-expanded', 'true');
    await expect(preview).toHaveAttribute('aria-expanded', 'false');
  });

  test('keeps every line break of a multi-line paste in a collapsed field when the prompt is copied', async ({
    page,
  }) => {
    // ARRANGE
    const pasted = '# Pasted\n\nfirst line\nsecond line';
    const { modal } = await open(page, 'light');
    await openStage(page, 'Interview');
    await showPrompt(modal);
    const field = task(modal).locator('[data-slot] textarea').first();
    // ACT
    await paste(field, pasted);
    await copyOf(modal).click();
    await expect.poll(() => copies(page)).toBe(1);
    const written = await copied(page);
    // ASSERT
    expect(written.at(-1)).toContain(pasted);
    await expect(field).toHaveAttribute('rows', '1');
  });

  test('expands a field with the eye toggle and collapses it again', async ({ page }) => {
    // ARRANGE
    const { modal } = await open(page, 'light');
    await openStage(page, 'Interview');
    await showPrompt(modal);
    const field = task(modal).locator('[data-slot] textarea').first();
    const eye = task(modal).locator('[data-slot] button[aria-pressed]').first();
    const rows = async () => Number(await field.getAttribute('rows'));
    // ACT
    await expect(field).toHaveAttribute('rows', '1');
    await eye.click();
    // ASSERT
    await expect(eye).toHaveAttribute('aria-pressed', 'true');
    await expect(eye).toHaveAttribute('aria-label', 'Collapse');
    await expect.poll(rows).toBeGreaterThan(1);
    await eye.click();
    await expect(field).toHaveAttribute('rows', '1');
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
    const panel = () => modal.locator(':scope > div').boundingBox();
    // ASSERT
    await expect.poll(sideways).toBeLessThanOrEqual(0);
    await expect.poll(async () => (await panel())!.x).toBeGreaterThanOrEqual(0);
    await expect.poll(async () => (await panel())!.x + (await panel())!.width).toBeLessThanOrEqual(phone);
  });
});
