import axe from 'axe-core';
import { setTimeout as delay } from 'node:timers/promises';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { ensureBrowser } from '../../../../skills/visual-check/scripts/browser';
import { connect, evaluate, eventName, type Connection, type Send } from '../../../../skills/visual-check/scripts/cdp';
import { PAIRS } from './workflow-data';

/*
 * The browser seam (`npm run test:browser`, local only, never CI): the Slide "Human in the loop" of the Slides Episode in the shared
 * chrome-headless-shell, walked end to end the way a viewer does it. It needs `next dev` (or `npm run preview`)
 * serving the Episode: HITL_URL names the page, `http://localhost:3000/episodes/slides/` by default
 * (docs/features/human-in-the-loop.md).
 */

const URL_UNDER_TEST = process.env.HITL_URL ?? 'http://localhost:3000/episodes/slides/';
const TIMEOUT = 120_000;
const ROOT = '[data-human-in-the-loop]';
const PANEL = '[data-human-in-the-loop] dialog[data-part="modal"] > div';
const SLIDE_ANCHOR = 'agentic-workflows--human-in-the-loop';
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

/** The Vacation Workflow, still on the old schema until it migrates (issue 286): the Short grill and the ticket graph live there. */
const openVacation = async () => {
  await press(`${ROOT} [data-control="picker"] button`, /Vacation/);
  await settle();
};

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
        `[...document.querySelectorAll('${toolbar} [data-tip-host]')].filter((host) => host.querySelector('[data-control]:not([data-control=picker])')).map((host) => host.querySelector('[data-control]').dataset.control + ':' + host.querySelector('[data-tip-text]').textContent)`,
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
      const exampleViews = 1;
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
      await press(`${MODAL} [data-step="do"] button[aria-label]`, /Copy prompt/);
      await settle();
      const status = await text(`${MODAL} [role="status"]`);
      const copied = await js<string[]>('window.__copied');
      const chatLinks = await js<string[]>(
        `[...document.querySelectorAll('${MODAL} [data-step="do"] a[target="_blank"]')].map((el) => el.href.split('?')[0])`,
      );
      const exampleSpec = await count(`${MODAL} [data-output="markdown"]`);
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
      expect(steps).toEqual(['do', 'review']);
      expect(status).toBe(copiedWord);
      expect(copied.length).toBe(1);
      expect(copied[0]).toContain('kind: interview');
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
      await press(`${MODAL} [data-step="do"] button[aria-expanded]`, /Prompt/);
      await settle();
      const shown = await js<boolean>(
        `!document.querySelector('${MODAL} [data-step="do"] [data-prompt-text]').parentElement.hidden`,
      );
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
      await openVacation();
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
      const shortToggles = await count(`${MODAL} [data-step] button[aria-pressed]`);
      // ASSERT
      expect(copied[0]).not.toContain('SHORT version');
      expect(copied[1]).toContain('SHORT version');
      expect(shortToggles).toBe(1);
    },
    TIMEOUT,
  );

  it(
    'copies the short command of the interview at the Technical level when Short is on',
    async () => {
      // ARRANGE
      await open('light');
      await press(`${ROOT} [data-part="toolbar"] button`, /Technical/);
      await settle();
      await openVacation();
      await openStage(/Interview/);
      const copyRun = async () => {
        await press(`${MODAL} [data-step="run"] button[aria-label]`, /Copy command/);
        await settle();
      };
      // ACT
      await copyRun();
      await press(`${MODAL} [data-step="run"] button[aria-pressed]`, /Short/);
      await settle();
      await copyRun();
      const copied = await js<string[]>('window.__copied');
      // ASSERT
      expect(copied[0]).not.toContain('Short version');
      expect(copied[1]).toContain('Short version');
      expect(copied[1]?.startsWith('/')).toBe(true);
    },
    TIMEOUT,
  );

  it(
    'returns focus to the Try it button on every close path: X, Escape and backdrop',
    async () => {
      // ARRANGE
      await open('light');
      const focused = () => js<string>('document.activeElement?.dataset?.try ?? document.activeElement?.tagName ?? ""');
      const closers = [
        () => press(`${MODAL} header button`, /Close/),
        () => escape(),
        () => js(`document.querySelector('${MODAL}').click()`),
      ];
      const landed: string[] = [];
      // ACT
      for (const close of closers) {
        await openStage(/Requirements/);
        await close();
        await settle();
        landed.push(await focused());
      }
      // ASSERT
      expect(landed).toEqual(['Requirements', 'Requirements', 'Requirements']);
    },
    TIMEOUT,
  );

  it(
    'shows one shared tooltip on focus, dismisses it with Escape before the dialog, and keeps the move circles 24px',
    async () => {
      // ARRANGE
      const minTarget = 24;
      await open('light');
      const circles = await js<number[]>(
        `[...document.querySelectorAll('${ROOT} [data-move]')].map((el) => Math.min(el.getBoundingClientRect().width, el.getBoundingClientRect().height))`,
      );
      await openStage(/Requirements/);
      const tipShown = () =>
        js<string>(
          `document.querySelector('${MODAL} header [data-tip-host] > span[data-shown]')?.dataset.shown ?? 'none'`,
        );
      // ACT
      await js(`document.querySelector('${MODAL} header button').focus()`);
      await settle();
      const onFocus = await tipShown();
      await escape();
      const afterFirstEscape = await tipShown();
      const stillOpen = await count(`${MODAL}[open]`);
      await escape();
      const afterSecondEscape = await count(MODAL);
      // ASSERT
      expect(circles.every((size) => size >= minTarget)).toBe(true);
      expect(onFocus).toBe('true');
      expect(afterFirstEscape).toBe('false');
      expect(stillOpen).toBe(1);
      expect(afterSecondEscape).toBe(0);
    },
    TIMEOUT,
  );

  it(
    'ticks a ready ticket of the example graph so its dependent becomes ready',
    async () => {
      // ARRANGE
      const doneStatus = 'done';
      await open('light');
      await openVacation();
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

  it(
    'carries a spec pasted in one stage into the copied prompt of a later stage, keeps it across close and reopen, and stores nothing',
    async () => {
      // ARRANGE
      const pasted = '# PASTED SPEC MARKER';
      await open('light');
      await js('localStorage.clear(); sessionStorage.clear()');
      // ACT
      await openStage(/Tickets/);
      await js(
        `(() => { const area = document.querySelector('${MODAL} [data-step="do"] [data-slot-entry="spec"] textarea');
          const set = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
          set.call(area, ${JSON.stringify(pasted)}); area.dispatchEvent(new Event('input', { bubbles: true })); })()`,
      );
      await settle();
      await escape();
      await openStage(/Compare/);
      await press(`${MODAL} [data-step="do"] button[aria-label]`, /Copy prompt/);
      await settle();
      const copied = await js<string[]>('window.__copied');
      await escape();
      await openStage(/Tickets/);
      const kept = await js<string>(
        `document.querySelector('${MODAL} [data-step="do"] [data-slot-entry="spec"] textarea').value`,
      );
      const stored = await js<number>('localStorage.length + sessionStorage.length');
      // ASSERT
      expect(copied.at(-1)).toContain(pasted);
      expect(kept).toBe(pasted);
      expect(stored).toBe(0);
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

  it(
    'heads the popover with the stage title, its learning goal and the simple/technical toggle beside Close',
    async () => {
      // ARRANGE
      await open('light');
      await openStage(/Plan/);
      // ACT
      const title = await text(`${MODAL} header h2`);
      const goal = await text(`${MODAL} header [data-goal]`);
      const order = await js<string[]>(
        `[...document.querySelectorAll('${MODAL} header button')].map((el) => el.getAttribute('aria-label'))`,
      );
      await press(`${MODAL} header button`, /Technical/);
      await settle();
      const level = await js<string>(`document.querySelector('${ROOT}').dataset.level`);
      const pressed = await js<string>(
        `document.querySelector('${MODAL} header button[aria-pressed]').getAttribute('aria-pressed')`,
      );
      // ASSERT
      expect(title).toBe('Plan: Try it');
      expect(goal).toMatch(/^Break it down/);
      expect(order).toEqual(['Technical', 'Close']);
      expect(level).toBe('technical');
      expect(pressed).toBe('true');
    },
    TIMEOUT,
  );

  it(
    'lays the tasks and their details in two columns on desktop, the details following the focused task, shown once',
    async () => {
      // ARRANGE
      await open('light', 1440);
      await openStage(/Requirements/);
      // ACT
      await js(`document.querySelector('${MODAL} [data-column="tasks"] [data-step="review"] button').focus()`);
      await settle();
      const rects = await js<{ tasks: number; details: number }>(
        `({ tasks: document.querySelector('${MODAL} [data-column="tasks"]').getBoundingClientRect().right,
            details: document.querySelector('${MODAL} [data-column="details"]').getBoundingClientRect().left })`,
      );
      const job = await js<string>(`document.querySelector('${MODAL} [data-job]').dataset.job`);
      const following = await js<string>(
        `document.querySelector('${MODAL} [data-column="details"] [data-details]').dataset.task`,
      );
      const good = await text(`${MODAL}`);
      // ASSERT
      expect(rects.details).toBeGreaterThanOrEqual(rects.tasks);
      expect(following).toBe(job);
      expect(await count(`${MODAL} [data-details]`)).toBe(1);
      expect(good.match(/What good looks like/g)?.length).toBe(1);
    },
    TIMEOUT,
  );

  it(
    'goes full screen on a phone: sticky header, details folded under the task',
    async () => {
      // ARRANGE
      await open('light', 390);
      await openStage(/Requirements/);
      // ACT
      const box = await js<{ w: number; h: number; iw: number; ih: number }>(
        `(() => { const r = document.querySelector('${PANEL}').getBoundingClientRect(); return { w: r.width, h: r.height, iw: innerWidth, ih: innerHeight }; })()`,
      );
      const headerBefore = await js<number>(`document.querySelector('${MODAL} header').getBoundingClientRect().top`);
      await js(`document.querySelector('${PANEL} [data-scroll]').scrollTop = 400`);
      await settle();
      const headerTop = await js<number>(`document.querySelector('${MODAL} header').getBoundingClientRect().top`);
      const folded = await js<{ inside: boolean; open: boolean; columns: number }>(
        `(() => { const d = document.querySelector('${MODAL} [data-job] details[data-details]');
          return { inside: Boolean(d), open: d?.open ?? true, columns: document.querySelectorAll('${MODAL} [data-column]').length }; })()`,
      );
      await js(`document.querySelector('${MODAL} [data-job] details[data-details] summary').click()`);
      await settle();
      const opened = await js<boolean>(`document.querySelector('${MODAL} [data-job] details[data-details]').open`);
      const sideways = await js<number>('document.documentElement.scrollWidth - innerWidth');
      // ASSERT
      expect(box.w).toBe(box.iw);
      expect(box.h).toBe(box.ih);
      expect(headerTop).toBe(headerBefore);
      expect(folded).toEqual({ inside: true, open: false, columns: 0 });
      expect(opened).toBe(true);
      expect(sideways).toBeLessThanOrEqual(0);
      expect(await count(`${MODAL} [data-details]`)).toBe(1);
    },
    TIMEOUT,
  );

  it(
    'fans a task out as Chat 1..N tabs in simple mode and one orchestrator prompt in technical mode',
    async () => {
      // ARRANGE
      const chatNames = ['Chat 1', 'Chat 2', 'Chat 3'];
      const third = 2;
      await open('light', 1440);
      await openStage(/Research/);
      const copyShown = async () => {
        await press(`${MODAL} [data-step="do"] [role="tabpanel"]:not([hidden]) button[aria-label]`, /Copy prompt/);
        await settle();
      };
      // ACT
      const tabs = await js<string[]>(
        `[...document.querySelectorAll('${MODAL} [role="tab"]')].map((el) => el.textContent)`,
      );
      const panels = await count(`${MODAL} [role="tabpanel"]:not([hidden])`);
      await copyShown();
      await press(`${MODAL} [role="tab"]`, /Chat 2/);
      await settle();
      await copyShown();
      const second = await js<string>(
        `document.querySelector('${MODAL} [role="tab"][aria-selected="true"]').textContent`,
      );
      await press(`${MODAL} header button`, /Technical/);
      await settle();
      const technicalTabs = await count(`${MODAL} [role="tab"]`);
      await press(`${MODAL} [data-step="do"] button[aria-label]`, /Copy prompt/);
      await settle();
      const copied = await js<string[]>('window.__copied');
      // ASSERT
      expect(tabs).toEqual(chatNames);
      expect(panels).toBe(1);
      expect(copied[0]).toContain('This is chat 1');
      expect(second).toBe('Chat 2');
      expect(copied[1]).toContain('This is chat 2');
      expect(technicalTabs).toBe(0);
      expect(copied[third]).toContain('one subagent per ticket');
    },
    TIMEOUT,
  );

  it(
    'writes Open in ChatGPT and Open in Claude out on desktop, icons only on a phone, every button with a tooltip',
    async () => {
      // ARRANGE
      const visibleText = (selector: string) =>
        js<string[]>(
          `[...document.querySelectorAll('${selector}')].map((el) => [...el.querySelectorAll('span')].filter((s) => s.offsetWidth > 0).map((s) => s.textContent).join('').trim())`,
        );
      const bare = () =>
        js<string[]>(
          `[...document.querySelectorAll('${MODAL} button, ${MODAL} summary')].filter((b) => !b.closest('[data-tip-host]') && b.tagName === 'BUTTON').map((b) => b.getAttribute('aria-label') ?? b.textContent)`,
        );
      // ACT
      await open('light', 1440);
      await openStage(/Requirements/);
      const desktop = await visibleText(`${MODAL} [data-step="do"] a[target="_blank"]`);
      const desktopBare = await bare();
      await open('light', 390);
      await openStage(/Requirements/);
      const phone = await visibleText(`${MODAL} [data-step="do"] a[target="_blank"]`);
      // ASSERT
      expect(desktop).toEqual(['Open in ChatGPT', 'Open in Claude']);
      expect(phone).toEqual(['', '']);
      expect(desktopBare).toEqual([]);
    },
    TIMEOUT,
  );

  it(
    'shows each Research chat pill whole, not cut to "C.", at 1280px',
    async () => {
      // ARRANGE
      const chatNames = ['Chat 1', 'Chat 2', 'Chat 3'];
      await open('light', 1280);
      // ACT
      const cut = await js<string[]>(
        `[...document.querySelectorAll('${ROOT} [data-part="diagram"] span.truncate')].filter((el) => el.scrollWidth > el.clientWidth).map((el) => el.textContent)`,
      );
      const names = await js<string[]>(
        `[...document.querySelectorAll('${ROOT} [data-part="diagram"] span.truncate')].map((el) => el.textContent)`,
      );
      // ASSERT
      expect(names).toEqual(chatNames);
      expect(cut).toEqual([]);
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
