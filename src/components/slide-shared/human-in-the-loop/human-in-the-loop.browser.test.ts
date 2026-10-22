import axe from 'axe-core';
import { setTimeout as delay } from 'node:timers/promises';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { ensureBrowser } from '../../../../skills/visual-check/scripts/browser';
import { connect, evaluate, eventName, type Connection, type Send } from '../../../../skills/visual-check/scripts/cdp';
import { PAIRS } from './workflow-data';

/*
 * The browser seam (`npm run test:browser`, local only, never CI): the Slide "Brief the venue" in the shared
 * chrome-headless-shell, walked end to end the way a viewer does it. It needs `next dev` (or `npm run preview`)
 * serving the Episode: HITL_URL names the page, `http://localhost:3000/episodes/onboard-ai-every-time/` by default
 * (docs/features/human-in-the-loop.md).
 */

const URL_UNDER_TEST = process.env.HITL_URL ?? 'http://localhost:3000/episodes/onboard-ai-every-time/';
const TIMEOUT = 120_000;
const ROOT = '[data-human-in-the-loop]';
const SLIDE_ANCHOR = 'five-moves-to-brief-a-freelancer--brief-the-venue';
const MODAL = `${ROOT} dialog[data-part="modal"]`;

let connection: Connection;
let targetId = '';
let send: Send;
let session = '';

async function open(theme: 'light' | 'dark', width = 1440) {
  await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 600 });
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: theme }] });
  const loaded = new Promise((resolve) =>
    connection.events.addEventListener(eventName(session, 'Page.loadEventFired'), resolve, { once: true }),
  );
  await send('Page.navigate', { url: URL_UNDER_TEST });
  await loaded;
  await delay(1200);
  await evaluate(send, axe.source);
  // A Slide mounts when it nears the viewport: scroll to its anchor, then wait for the visual.
  await evaluate(send, `document.getElementById(${JSON.stringify(SLIDE_ANCHOR)})?.scrollIntoView({ block: 'start' })`);
  for (let tries = 0; tries < 40 && !(await count(ROOT)); tries++) await delay(250);
  await evaluate(send, `document.querySelector('${ROOT}').scrollIntoView({ block: 'start' })`);
  await delay(500);
  // The clipboard of a headless page is not ours to read: record what a copy writes.
  await evaluate(
    send,
    `window.__copied = []; Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async (text) => { window.__copied.push(text); } } })`,
  );
}

const js = <T>(expression: string) => evaluate<T>(send, expression);

/** Clicks the first element of the selector whose text or aria-label matches the pattern. */
const press = (selector: string, pattern: RegExp) =>
  js<boolean>(
    `(() => {
      const el = [...document.querySelectorAll(${JSON.stringify(selector)})]
        .find((each) => ${pattern}.test((each.getAttribute('aria-label') ?? '') + ' ' + each.textContent));
      el?.click();
      return Boolean(el);
    })()`,
  );

function count(selector: string) {
  return js<number>(`document.querySelectorAll(${JSON.stringify(selector)}).length`);
}
const text = (selector: string) => js<string>(`document.querySelector(${JSON.stringify(selector)})?.textContent ?? ''`);
const settle = () => delay(250);

/** axe-core's serious and critical violations inside the visual, as `rule: target` lines. */
async function seriousViolations(): Promise<string[]> {
  const { result } = (await send('Runtime.evaluate', {
    expression: `axe.run({ include: [['${ROOT}']] }, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } })
      .then((r) => r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
        .flatMap((v) => v.nodes.map((n) => v.id + ': ' + n.target.join(' '))))`,
    awaitPromise: true,
    returnByValue: true,
  })) as { result: { value: string[] } };
  return result.value;
}

const openStage = async (stage: RegExp) => {
  expect(await press(`${ROOT} [data-part="diagram"] button[data-try]`, stage)).toBe(true);
  await settle();
};
const escape = async () => {
  for (const type of ['keyDown', 'keyUp'])
    await send('Input.dispatchKeyEvent', { type, key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await settle();
};

/** A valid Workflow of the viewer's own: the shipped summer party under another id and title. */
const OWN = PAIRS['summer-party'].config
  .replace('id: summer-party', 'id: mine')
  .replace('title: Summer party', 'title: Mine');

/** Chooses a file in the upload control as a viewer does: the input's files, then its change event. */
const upload = (yaml: string) =>
  js<boolean>(
    `(() => {
      const input = document.querySelector('${ROOT} [data-control="upload"] input[type=file]');
      const data = new DataTransfer();
      data.items.add(new File([${JSON.stringify(yaml)}], 'mine.yml', { type: 'text/yaml' }));
      input.files = data.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    })()`,
  );

beforeAll(async () => {
  const endpoint = await ensureBrowser();
  connection = await connect(endpoint.port);
  const browser = connection.sender();
  ({ targetId } = (await browser('Target.createTarget', { url: 'about:blank' })) as { targetId: string });
  const attached = (await browser('Target.attachToTarget', { targetId, flatten: true })) as { sessionId: string };
  session = attached.sessionId;
  send = connection.sender(session);
  await send('Page.enable');
}, TIMEOUT);

afterAll(async () => {
  await connection
    .sender()('Target.closeTarget', { targetId })
    .catch(() => undefined);
  connection.socket.close();
});

describe('success cases', () => {
  it(
    'has one pill toolbar: the Workflow pills, then Technical, download and upload as icon buttons with tooltips',
    async () => {
      // ARRANGE
      await open('light');
      const toolbar = `${ROOT} [data-part="toolbar"]`;
      // ACT
      const pills = await js<string[]>(
        `[...document.querySelectorAll('${toolbar} [data-control="picker"] button')].map((el) => el.textContent)`,
      );
      const icons = await js<string[]>(
        `[...document.querySelectorAll('${toolbar} [data-tip]')].map((el) => el.dataset.control + ':' + el.dataset.tip)`,
      );
      const buttons = await count(`${toolbar} button, ${toolbar} input`);
      // ASSERT
      expect(pills).toEqual(['Summer party', 'Vacation']);
      expect(icons.map((icon) => icon.split(':')[0])).toEqual(['level', 'download', 'upload']);
      expect(icons.every((icon) => icon.split(':')[1]?.length)).toBe(true);
      expect(buttons).toBe(pills.length + icons.length);
      expect(await text(`${ROOT}`)).not.toMatch(/Watch|Try it yourself/);
    },
    TIMEOUT,
  );

  it(
    'opens a stage modal from its Try it button: title, X top right, collapsed prompts, copy, then Escape and backdrop close',
    async () => {
      // ARRANGE
      const copiedWord = 'Copied';
      const exampleViews = 2;
      await open('light');
      // ACT
      await openStage(/Requirements/);
      const opened = await count(`${MODAL}[open]`);
      const title = await text(`${MODAL} h2`);
      const closeIsTopRight = await js<boolean>(
        `(() => { const panel = document.querySelector('${MODAL} > div').getBoundingClientRect();
          const x = document.querySelector('${MODAL} header button[aria-label="Close"]').getBoundingClientRect();
          return x.top - panel.top < 40 && panel.right - x.right < 40; })()`,
      );
      const prompts = await count(`${MODAL} [data-prompt]`);
      const expanded = await count(`${MODAL} [data-prompt] button[aria-expanded="true"]`);
      const steps = await js<string[]>(
        `[...document.querySelectorAll('${MODAL} [data-step]')].map((el) => el.dataset.step)`,
      );
      await press(`${MODAL} [data-step="run"] button[aria-label]`, /Copy prompt/);
      await settle();
      const status = await text(`${MODAL} [role="status"]`);
      const copied = await js<string[]>('window.__copied');
      const chatLinks = await js<string[]>(
        `[...document.querySelectorAll('${MODAL} [data-step="run"] a[target="_blank"]')].map((el) => el.href.split('?')[0])`,
      );
      const exampleSpec = await count(`${MODAL} [data-output="spec"], ${MODAL} [data-output="tickets"]`);
      await js(`document.querySelector('${MODAL}').click()`);
      await settle();
      const afterBackdrop = await count(`${MODAL}`);
      await openStage(/Requirements/);
      await escape();
      const afterEscape = await count(`${MODAL}`);
      // ASSERT
      expect(opened).toBe(1);
      expect(title).toBe('Requirements: Try it');
      expect(closeIsTopRight).toBe(true);
      expect(prompts).toBe(steps.length);
      expect(expanded).toBe(0);
      expect(steps).toEqual(['run', 'check', 'page']);
      expect(status).toBe(copiedWord);
      expect(copied.length).toBe(1);
      expect(copied[0]).toContain('handoff');
      expect(copied[0]).not.toContain('{{');
      expect(chatLinks).toEqual(['https://chatgpt.com/', 'https://claude.ai/new']);
      expect(exampleSpec).toBe(exampleViews);
      expect(afterBackdrop).toBe(0);
      expect(afterEscape).toBe(0);
    },
    TIMEOUT,
  );

  it(
    'closes the modal with the X button and expands a prompt on demand',
    async () => {
      // ARRANGE
      await open('light');
      await openStage(/Interview/);
      // ACT
      await press(`${MODAL} [data-step="run"] button[aria-expanded]`, /Prompt/);
      await settle();
      const shown = await js<boolean>(`!document.querySelector('${MODAL} [data-step="run"] pre').hidden`);
      await press(`${MODAL} header button`, /Close/);
      await settle();
      // ASSERT
      expect(shown).toBe(true);
      expect(await count(MODAL)).toBe(0);
    },
    TIMEOUT,
  );

  it(
    'copies the short grill of the interview when Short is on, and the full prompt when it is off',
    async () => {
      // ARRANGE
      await open('light');
      await openStage(/Interview/);
      const copyRun = async () => {
        await press(`${MODAL} [data-step="run"] button[aria-label]`, /Copy prompt/);
        await settle();
      };
      // ACT
      await copyRun();
      await press(`${MODAL} [data-step="run"] button[aria-pressed]`, /Short/);
      await settle();
      await copyRun();
      const copied = await js<string[]>('window.__copied');
      const shortToggles = await count(`${MODAL} button[aria-pressed]`);
      // ASSERT
      expect(copied[0]).not.toContain('SHORT version');
      expect(copied[1]).toContain('SHORT version');
      expect(shortToggles).toBe(1);
    },
    TIMEOUT,
  );

  it(
    'ticks a ready ticket of the example graph so its dependent becomes ready',
    async () => {
      // ARRANGE
      const doneStatus = 'done';
      await open('light');
      await openStage(/Requirements/);
      const status = (id: string) =>
        js<string | null>(`document.querySelector('${MODAL} [data-ticket="${id}"]')?.dataset.status ?? null`);
      const first = await js<string>(
        `document.querySelector('${MODAL} [data-ticket][data-status="ready"]').dataset.ticket`,
      );
      const waiting = await js<string[]>(
        `[...document.querySelectorAll('${MODAL} [data-ticket][data-status="blocked"]')].map((el) => el.dataset.ticket)`,
      );
      // ACT
      await js(`document.querySelector('${MODAL} [data-ticket="${first}"]').click()`);
      await settle();
      const progress = await text(`${MODAL} [data-progress]`);
      const nowReady = await js<string[]>(
        `[...document.querySelectorAll('${MODAL} [data-ticket][data-status="ready"]')].map((el) => el.dataset.ticket)`,
      );
      // ASSERT
      expect(await status(first)).toBe(doneStatus);
      expect(waiting.length).toBeGreaterThan(0);
      expect(nowReady.some((id) => waiting.includes(id))).toBe(true);
      expect(progress).toMatch(/^1 of \d+ done$/);
    },
    TIMEOUT,
  );

  it(
    'switches to Vacation with its own card lines, then shows the setup and a copyable /skill command in Technical',
    async () => {
      // ARRANGE
      const vacation = 'vacation';
      const setupCommand = 'claude plugin install';
      await open('light');
      const card = () => text(`${ROOT} [data-part="diagram"]`);
      const before = await card();
      // ACT
      await press(`${ROOT} [data-control="picker"] button`, /Vacation/);
      await settle();
      const workflow = await js<string>(`document.querySelector('${ROOT}').dataset.humanInTheLoop`);
      const after = await card();
      await press(`${ROOT} [data-part="toolbar"] button`, /Technical/);
      await settle();
      await openStage(/Interview/);
      const setup = await text(`${MODAL} section[aria-label="One-time setup"]`);
      await press(`${MODAL} [data-step="run"] button[aria-label]`, /Copy command/);
      await settle();
      const copied = await js<string[]>('window.__copied');
      // ASSERT
      expect(workflow).toBe(vacation);
      expect(before).toContain('At most €150 per person');
      expect(after).toContain('Sleeps 2');
      expect(after).not.toContain('At most €150 per person');
      expect(setup).toContain(setupCommand);
      expect(copied[0]).toMatch(/^\/[a-z-]+/);
    },
    TIMEOUT,
  );

  it(
    'shows a valid uploaded Workflow in place of the authored one',
    async () => {
      // ARRANGE
      const mine = 'mine';
      await open('light');
      // ACT
      await upload(OWN);
      await settle();
      const shown = await js<string>(`document.querySelector('${ROOT}').dataset.humanInTheLoop`);
      const problems = await count(`${ROOT} [data-upload-problems] li`);
      // ASSERT
      expect(shown).toBe(mine);
      expect(problems).toBe(0);
    },
    TIMEOUT,
  );

  it.each(['light', 'dark'] as const)(
    'has no serious or critical axe-core violation in %s, on the diagram and with the modal open',
    async (theme) => {
      // ARRANGE
      await open(theme);
      // ACT
      const diagram = await seriousViolations();
      await openStage(/Requirements/);
      const modal = await seriousViolations();
      // ASSERT
      expect(diagram.join('; ')).toBe('');
      expect(modal.join('; ')).toBe('');
    },
    TIMEOUT,
  );
});

describe('failure cases', () => {
  it(
    'reports the problems of a broken uploaded Workflow and keeps the authored one',
    async () => {
      // ARRANGE
      const authored = 'summer-party';
      await open('light');
      // ACT
      await upload('stages: [');
      await settle();
      const problems = await count(`${ROOT} [data-upload-problems] li`);
      const shown = await js<string>(`document.querySelector('${ROOT}').dataset.humanInTheLoop`);
      // ASSERT
      expect(problems).toBeGreaterThan(0);
      expect(shown).toBe(authored);
    },
    TIMEOUT,
  );
});

describe('edge cases', () => {
  it(
    'keeps the page from scrolling sideways at phone width with the modal open',
    async () => {
      // ARRANGE
      await open('light', 390);
      // ACT
      await openStage(/Requirements/);
      const sideways = await js<number>('document.documentElement.scrollWidth - innerWidth');
      const modalFits = await js<boolean>(
        `(() => { const r = document.querySelector('${MODAL} > div').getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth; })()`,
      );
      // ASSERT
      expect(sideways).toBeLessThanOrEqual(0);
      expect(modalFits).toBe(true);
    },
    TIMEOUT,
  );
});
