import axe from 'axe-core';
import { setTimeout as delay } from 'node:timers/promises';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { ensureBrowser } from '../../../../skills/visual-check/scripts/browser';
import { connect, evaluate, eventName, type Connection, type Send } from '../../../../skills/visual-check/scripts/cdp';
import { CONTEXT_PRESETS } from './context-data';

/*
 * The browser lane (`npm run test:browser`, local only, never CI): the cornerstone's dev gallery in the shared
 * chrome-headless-shell. axe-core checks every Preset in both themes; a scrub of the grid Preset stays under 16ms a
 * step. It needs `next dev` serving the gallery: CONTEXT_WINDOW_URL names it, `http://localhost:3000/episodes/` by
 * default (docs/features/context-window.md).
 */

const URL_UNDER_TEST = process.env.CONTEXT_WINDOW_URL ?? 'http://localhost:3000/episodes/';
const TIMEOUT = 120_000;
const AXE = axe.source;

let connection: Connection;
let targetId = '';
let send: Send;

async function open(theme: 'light' | 'dark') {
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: theme }] });
  const loaded = new Promise((resolve) =>
    connection.events.addEventListener(eventName(sessionOf(send), 'Page.loadEventFired'), resolve, { once: true }),
  );
  await send('Page.navigate', { url: URL_UNDER_TEST });
  await loaded;
  await delay(1500);
  await evaluate(send, AXE);
}

const sessions = new WeakMap<Send, string>();
const sessionOf = (s: Send) => sessions.get(s) ?? '';

/*
 * Dimmed on purpose, and so left out of the contrast rule only: an empty category row, a bubble a compaction removed,
 * and the Attention view's bubbles, whose fade is the picture (Spec, Visual language). Every other rule checks them.
 */
const DIMMED = ['[data-zero]', '[data-gone]', '[data-mode="attention"] [data-role]'];

async function run(expression: string): Promise<string[]> {
  const { result, exceptionDetails } = (await send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  })) as { result: { value: string[] }; exceptionDetails?: { exception?: { description?: string } } };
  if (exceptionDetails) throw new Error(exceptionDetails.exception?.description ?? 'axe-core failed in the page');
  return result.value;
}

/** axe-core's WCAG A and AA violations inside one Preset, as `rule: target` lines. */
function axeOf(preset: string): Promise<string[]> {
  const root = `[data-cornerstone="${preset}"]`;
  const lines = `.then((r) => r.violations.flatMap((v) => v.nodes.map((n) => v.id + ': ' + n.target.join(' '))))`;
  const tags = `runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] }`;
  const exclude = JSON.stringify(DIMMED.map((dim) => [`${root}${dim.startsWith('[data-mode') ? '' : ' '}${dim}`]));
  // axe runs one audit at a time: the contrast pass waits for the rest.
  return run(`(async () => [
    ...(await axe.run({ include: [['${root}']] }, { ${tags}, rules: { 'color-contrast': { enabled: false } } })${lines}),
    ...(await axe.run({ include: [['${root}']], exclude: ${exclude} }, { runOnly: ['color-contrast'] })${lines}),
  ])()`);
}

/** Commits one step through the range input, as a keyboard or a drag does, and forces the layout. */
const commit = (preset: string, step: number) =>
  evaluate(
    send,
    `(() => {
      const range = document.querySelector('[data-cornerstone="${preset}"] input[type=range]');
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(range, '${step}');
      range.dispatchEvent(new Event('input', { bubbles: true }));
      return document.body.offsetHeight;
    })()`,
  );

/** The page's main-thread task time in ms, from the DevTools protocol's own counter. */
async function taskMs(): Promise<number> {
  const { metrics } = (await send('Performance.getMetrics')) as { metrics: { name: string; value: number }[] };
  return (metrics.find((m) => m.name === 'TaskDuration')?.value ?? 0) * 1000;
}

const attr = (preset: string, selector: string, name: string) =>
  evaluate<string | null>(
    send,
    `document.querySelector('[data-cornerstone="${preset}"] ${selector}')?.getAttribute('${name}') ?? null`,
  );

beforeAll(async () => {
  const endpoint = await ensureBrowser();
  connection = await connect(endpoint.port);
  const browser = connection.sender();
  ({ targetId } = (await browser('Target.createTarget', { url: 'about:blank' })) as { targetId: string });
  const { sessionId } = (await browser('Target.attachToTarget', { targetId, flatten: true })) as { sessionId: string };
  send = connection.sender(sessionId);
  sessions.set(send, sessionId);
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await send('Page.enable');
  await send('Performance.enable');
}, TIMEOUT);

afterAll(async () => {
  await connection
    .sender()('Target.closeTarget', { targetId })
    .catch(() => undefined);
  connection.socket.close();
});

describe('success cases', () => {
  it(
    'has no axe-core violation in any Preset, light and dark',
    async () => {
      // ARRANGE
      const found: string[] = [];
      // ACT
      for (const theme of ['light', 'dark'] as const) {
        await open(theme);
        for (const preset of CONTEXT_PRESETS)
          found.push(...(await axeOf(preset)).map((v) => `${theme} ${preset} ${v}`));
      }
      // ASSERT
      expect(found).toEqual([]);
    },
    TIMEOUT,
  );

  it(
    'scrubs the grid Preset end to end in under 16ms a step',
    async () => {
      // ARRANGE
      await open('light');
      const preset = 'slide-7';
      const steps = 21;
      const budget = 16;
      // ACT
      // The protocol round trip itself costs task time: the same number of empty calls is the baseline.
      const idle = await taskMs();
      for (let step = 1; step <= steps; step++) await evaluate(send, 'document.body.offsetHeight');
      const before = await taskMs();
      for (let step = 1; step <= steps; step++) await commit(preset, step);
      const perStep = ((await taskMs()) - before - (before - idle)) / steps;
      // ASSERT
      expect(perStep).toBeLessThan(budget);
    },
    TIMEOUT,
  );
});

describe('failure cases', () => {
  it(
    'unpins on Escape: a pinned part does not stay lit',
    async () => {
      // ARRANGE
      await open('light');
      const preset = 'slide-8';
      // ACT
      const pinned = await attr(preset, '', 'data-lit');
      await evaluate(
        send,
        `document.querySelector('[data-cornerstone="${preset}"]').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`,
      );
      await delay(100);
      const after = await evaluate<boolean>(
        send,
        `document.querySelector('[data-cornerstone="${preset}"]').hasAttribute('data-lit')`,
      );
      // ASSERT
      expect(pinned).toBe('');
      expect(after).toBe(false);
    },
    TIMEOUT,
  );
});

describe('edge cases', () => {
  it(
    'switches Slide 5 to the 1M window: the meter reads the same chat against 1M',
    async () => {
      // ARRANGE
      await open('light');
      const preset = 'slide-5';
      const expected = '13% used · 128k of 1M';
      // ACT
      await evaluate(
        send,
        `document.querySelectorAll('[data-cornerstone="${preset}"] [aria-label="Window size"] button')[1].click()`,
      );
      await delay(100);
      const meter = await evaluate<string>(
        send,
        `document.querySelector('[data-cornerstone="${preset}"] section[aria-label="Context window"] > div').lastElementChild.textContent`,
      );
      // ASSERT
      expect(meter).toBe(expected);
    },
    TIMEOUT,
  );
});
