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

const tryIt = async () => {
  await press(`${ROOT} [data-part="toolbar"] button`, /Try it yourself/);
  await settle();
};
const openJob = async (title: RegExp) => {
  expect(await press(`${ROOT} [data-part="diagram"] button[aria-pressed]`, title)).toBe(true);
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
    'keeps Watch clean: only the Watch / Try switch, the rest appears in Try, and the diagram stays put',
    async () => {
      // ARRANGE
      const tryGroupCount = 2;
      const minTryControls = 3;
      const maxShift = 2;
      await open('light');
      const parts = `${ROOT} [data-part="toolbar"] [data-control], ${ROOT} [data-part="toolbar"] [role="group"]`;
      const top = () =>
        js<number>(`document.querySelector('${ROOT} [data-part="diagram"]').getBoundingClientRect().top`);
      // ACT
      const watchGroups = await count(`${ROOT} [data-part="toolbar"] [role="group"]`);
      const watchControls = await count(`${ROOT} [data-part="toolbar"] [data-control]`);
      const watchTop = await top();
      await tryIt();
      const tryGroups = await count(`${ROOT} [data-part="toolbar"] [role="group"]`);
      const tryControls = (await count(parts)) - tryGroups;
      const tryTop = await top();
      // ASSERT
      expect(watchGroups).toBe(1);
      expect(watchControls).toBe(0);
      expect(tryGroups).toBe(tryGroupCount);
      expect(tryControls).toBeGreaterThanOrEqual(minTryControls);
      expect(Math.abs(tryTop - watchTop)).toBeLessThanOrEqual(maxShift);
    },
    TIMEOUT,
  );

  it(
    'walks Watch, Try it, a job modal and its quick actions, then closes by backdrop and Escape',
    async () => {
      // ARRANGE
      const quickActions = 3;
      const exampleViews = 2;
      const copiedWord = 'Copied';
      await open('light');
      // ACT
      const watching = await js<string>(`document.querySelector('${ROOT}').dataset.mode`);
      await tryIt();
      await openJob(/^\d+ Requirements card /);
      const opened = await count(`${MODAL}[open]`);
      const actions = await count(`${MODAL} [role="group"] button, ${MODAL} [role="group"] a`);
      await press(`${MODAL} [role="group"] button`, /Copy prompt/);
      await settle();
      const status = await text(`${MODAL} [role="status"]`);
      const copied = await js<string[]>('window.__copied');
      const exampleSpec = await count(`${MODAL} [data-output="spec"], ${MODAL} [data-output="tickets"]`);
      await js(`document.querySelector('${MODAL}').click()`);
      await settle();
      const afterBackdrop = await count(`${MODAL}`);
      await openJob(/^\d+ Requirements card /);
      await escape();
      const afterEscape = await count(`${MODAL}`);
      // ASSERT
      expect(watching).toBe('watch');
      expect(opened).toBe(1);
      expect(actions).toBeGreaterThanOrEqual(quickActions);
      expect(status).toBe(copiedWord);
      expect(copied.length).toBe(1);
      expect(copied[0]).toContain('handoff');
      expect(exampleSpec).toBe(exampleViews);
      expect(afterBackdrop).toBe(0);
      expect(afterEscape).toBe(0);
    },
    TIMEOUT,
  );

  it(
    'ticks a ready ticket of the example graph so its dependent becomes ready',
    async () => {
      // ARRANGE
      const doneStatus = 'done';
      await open('light');
      await tryIt();
      await openJob(/^\d+ Requirements card /);
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
    'switches to Vacation and shows the one-time setup and a copyable /skill command in Technical',
    async () => {
      // ARRANGE
      const vacation = 'vacation';
      const setupCommand = 'claude plugin install';
      await open('light');
      await tryIt();
      // ACT
      await js(
        `(() => { const s = document.querySelector('${ROOT} [data-control="picker"]');
          s.value = 'vacation'; s.dispatchEvent(new Event('change', { bubbles: true })); })()`,
      );
      await settle();
      const workflow = await js<string>(`document.querySelector('${ROOT}').dataset.humanInTheLoop`);
      await press(`${ROOT} [data-part="toolbar"] button`, /Technical/);
      await settle();
      const setup = await text(`${ROOT} section[aria-label="One-time setup"]`);
      await openJob(/^2 /);
      await press(`${MODAL} [role="group"] button`, /Copy command/);
      await settle();
      const copied = await js<string[]>('window.__copied');
      // ASSERT
      expect(workflow).toBe(vacation);
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
      await tryIt();
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
    'has no serious or critical axe-core violation in %s, in Watch and with the modal open',
    async (theme) => {
      // ARRANGE
      await open(theme);
      // ACT
      const watch = await seriousViolations();
      await tryIt();
      await openJob(/^\d+ Requirements card /);
      const modal = await seriousViolations();
      // ASSERT
      expect(watch.join('; ')).toBe('');
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
      await tryIt();
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
      await tryIt();
      // ACT
      await openJob(/^\d+ Requirements card /);
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
