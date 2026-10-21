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
 * default (docs/features/context.md).
 */

const URL_UNDER_TEST = process.env.CONTEXT_WINDOW_URL ?? 'http://localhost:3000/episodes/';
const TIMEOUT = 120_000;
const AXE = axe.source;

let connection: Connection;
let targetId = '';
let send: Send;

async function open(theme: 'light' | 'dark', url = URL_UNDER_TEST) {
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: theme }] });
  const loaded = new Promise((resolve) =>
    connection.events.addEventListener(eventName(sessionOf(send), 'Page.loadEventFired'), resolve, { once: true }),
  );
  await send('Page.navigate', { url });
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
const DIMMED = ['[data-zero]', '[data-gone]', '[data-fade] [data-role]'];

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
  const exclude = JSON.stringify(DIMMED.map((dim) => [`${root}${dim.startsWith('[data-fade') ? '' : ' '}${dim}`]));
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

/** The German gallery: the same path under `/de`. */
const germanOf = (url: string) => {
  const german = new URL(url);
  german.pathname = `/de${german.pathname}`;
  return german.href;
};

const viewport = (width: number) =>
  send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false });

/** How far the page scrolls sideways, and every element that pokes out of its cornerstone's card. */
const overflowOf = () =>
  evaluate<{ sideways: number; poking: string[] }>(
    send,
    `(() => {
      const poking = [...document.querySelectorAll('[data-cornerstone], [data-bars]')].flatMap((card) => {
        const box = card.getBoundingClientRect();
        return [...card.querySelectorAll('*')]
          .filter((el) => { const r = el.getBoundingClientRect(); return r.width && (r.right > box.right + 0.5 || r.left < box.left - 0.5); })
          .map((el) => (card.dataset.cornerstone ?? 'mini') + ' ' + el.tagName + ' ' + el.className);
      });
      return { sideways: document.documentElement.scrollWidth - innerWidth, poking };
    })()`,
  );

const attr = (preset: string, selector: string, name: string) =>
  evaluate<string | null>(
    send,
    `document.querySelector('[data-cornerstone="${preset}"] ${selector}')?.getAttribute('${name}') ?? null`,
  );

const SLIDE_4 = '[data-cornerstone="slide-4"]';
const BAR = `${SLIDE_4} [data-roving]`;
const LOUPE_ROW = `${SLIDE_4} button[class*="lrow"]`;

/** Centre of an element in viewport pixels, after scrolling it into view. */
const centreOf = (selector: string, nth = 0) =>
  evaluate<{ x: number; y: number }>(
    send,
    `(() => {
      const el = document.querySelectorAll(${JSON.stringify(selector)})[${nth}];
      el.scrollIntoView({ block: 'center', behavior: 'instant' });
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    })()`,
  );

const mouseTo = (x: number, y: number) =>
  send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y, pointerType: 'mouse' });
const click = async (x: number, y: number) => {
  await mouseTo(x, y);
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
};

/** Rests the pointer in the middle of the bar, so the zoom opens. */
async function openZoom() {
  await open('light');
  const bar = await centreOf(BAR);
  await mouseTo(bar.x, bar.y);
  await delay(300);
  return bar;
}

/** Whether a bubble sits fully inside the chat's scroll box, and whether it is lit. */
const bubbleState = (id: string) =>
  evaluate<{ inView: boolean; lit: boolean }>(
    send,
    `(() => {
      const el = document.querySelector('${SLIDE_4} [data-role][data-part="${id}"]');
      const b = el.parentElement.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      return { inView: r.top >= b.top - 1 && r.bottom <= b.bottom + 1, lit: el.hasAttribute('data-on') };
    })()`,
  );

/** Scrolls the chat to the top and returns the id of the last bubble then out of view. */
const scrollChatAway = () =>
  evaluate<string>(
    send,
    `(() => {
      const box = document.querySelector('${SLIDE_4} [data-role]').parentElement;
      box.scrollTo({ top: 0, behavior: 'instant' });
      const b = box.getBoundingClientRect();
      const out = [...box.querySelectorAll('[data-role]:not([hidden])')].filter((el) => el.getBoundingClientRect().top > b.bottom);
      return out.at(-1)?.getAttribute('data-part') ?? '';
    })()`,
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

  it(
    'keeps the zoom open while the pointer crosses from the bar to it at a slow pace',
    async () => {
      // ARRANGE
      const bar = await openZoom();
      const row = await centreOf(LOUPE_ROW, 3);
      const samples: boolean[] = [];
      const minSamples = 5;
      // ACT
      for (let x = bar.x; x < row.x; x += 4) {
        await mouseTo(x, bar.y);
        await delay(60);
        samples.push(await evaluate<boolean>(send, `document.querySelector('${LOUPE_ROW}') !== null`));
      }
      // ASSERT
      expect(samples.length).toBeGreaterThan(minSamples);
      expect(samples.every(Boolean)).toBe(true);
    },
    TIMEOUT,
  );

  it(
    'scrolls the related chat bubble into view and lights it when a zoom row is clicked',
    async () => {
      // ARRANGE
      await openZoom();
      const away = await scrollChatAway();
      // ACT
      const row = await centreOf(LOUPE_ROW, 3);
      const id = await evaluate<string>(
        send,
        `document.querySelectorAll('${LOUPE_ROW}')[3].dataset.part.split('@')[0]`,
      );
      await click(row.x, row.y);
      await delay(900);
      const bubble = await bubbleState(id);
      // ASSERT
      expect(away).not.toBe('');
      expect(bubble).toEqual({ inView: true, lit: true });
    },
    TIMEOUT,
  );

  it(
    'draws the lens at half the old stroke and grows the hovered block by transform only',
    async () => {
      // ARRANGE
      await openZoom();
      // ACT
      const found = await evaluate<{ stroke: string; hot: number; scaled: string }>(
        send,
        `(() => {
          const lens = document.querySelector('${SLIDE_4} [class*="lens"]');
          const hot = [...document.querySelectorAll('${BAR} [data-hot]')];
          return {
            stroke: getComputedStyle(lens).borderTopWidth,
            hot: hot.length,
            scaled: getComputedStyle(hot[0]).transform,
          };
        })()`,
      );
      // ASSERT
      expect(found.stroke).toBe('1px');
      expect(found.hot).toBe(1);
      expect(found.scaled).not.toBe('none');
    },
    TIMEOUT,
  );

  it(
    'lists three blocks before and three after the hovered one, and the lens spans exactly those rows',
    async () => {
      // ARRANGE
      await openZoom();
      const expected = { rows: 7, cursorAt: 3 };
      const tolerance = 4;
      // ACT
      const found = await evaluate<{ rows: number; cursorAt: number; lens: number }>(
        send,
        `(() => {
          const rows = [...document.querySelectorAll('${LOUPE_ROW}')];
          const blocks = [...document.querySelectorAll('${BAR} button[data-part]')];
          const keys = rows.map((r) => r.dataset.part);
          const spans = blocks.filter((b) => keys.includes(b.dataset.part)).map((b) => b.getBoundingClientRect());
          const top = Math.min(...spans.map((r) => r.top));
          const bottom = Math.max(...spans.map((r) => r.bottom));
          const lens = document.querySelector('${SLIDE_4} [class*="lens"]').getBoundingClientRect();
          return {
            rows: rows.length,
            cursorAt: rows.findIndex((r) => r.hasAttribute('data-cursor')),
            lens: Math.abs(lens.top - top) + Math.abs(lens.bottom - bottom),
          };
        })()`,
      );
      // ASSERT
      expect({ rows: found.rows, cursorAt: found.cursorAt }).toEqual(expected);
      expect(found.lens).toBeLessThan(tolerance);
    },
    TIMEOUT,
  );

  it(
    'hovers an Attention row without remounting the list, and lights its bubble',
    async () => {
      // ARRANGE
      await open('light');
      await evaluate(
        send,
        `(() => { document.querySelector('${SLIDE_4} [class*="attRow"]').closest('[class*="card"]').firstElementChild.__mark = 'kept'; })()`,
      );
      const rows = '[class*="attRow"]';
      // ACT
      const first = await centreOf(`${SLIDE_4} ${rows}`, 2);
      await mouseTo(first.x, first.y);
      await delay(150);
      const second = await centreOf(`${SLIDE_4} ${rows}`, 4);
      await mouseTo(second.x, second.y);
      await delay(150);
      const found = await evaluate<{ kept: string | null; bubble: boolean }>(
        send,
        `(() => {
          const btn = document.elementFromPoint(${second.x}, ${second.y}).closest('[data-row]');
          const bubble = document.querySelector('${SLIDE_4} [data-role][data-part="' + btn.dataset.part + '"]');
          return {
            kept: btn.closest('[class*="card"]').firstElementChild.__mark ?? null,
            bubble: bubble.hasAttribute('data-on'),
          };
        })()`,
      );
      // ASSERT
      expect(found).toEqual({ kept: 'kept', bubble: true });
    },
    TIMEOUT,
  );

  it(
    'scrolls the chat to the bubble of a clicked Attention row',
    async () => {
      // ARRANGE
      await open('light');
      const away = await scrollChatAway();
      // ACT
      const row = await centreOf(`${SLIDE_4} [class*="attRow"][data-part="${away}"]`);
      await click(row.x, row.y);
      await delay(900);
      const bubble = await bubbleState(away);
      // ASSERT
      expect(away).not.toBe('');
      expect(bubble).toEqual({ inView: true, lit: true });
    },
    TIMEOUT,
  );

  it(
    'does not shift the chat or the page when an Attention row is hovered',
    async () => {
      // ARRANGE
      await open('light');
      const row = await centreOf(`${SLIDE_4} [class*="attRow"]`, 2);
      const measure = () =>
        evaluate<string>(
          send,
          `(() => {
            const root = document.querySelector('${SLIDE_4}');
            const phone = root.querySelector('[class*="phone"]').getBoundingClientRect().height;
            return [[...root.querySelectorAll('[data-role]:not([hidden])')].map((e) => e.dataset.part + '=' + Math.round(e.getBoundingClientRect().height)).join(), Math.round(phone), Math.round(scrollY), root.querySelector('[data-layout]').getBoundingClientRect().top | 0].join();
          })()`,
        );
      const before = await measure();
      // ACT
      await mouseTo(row.x, row.y);
      await delay(300);
      // ASSERT
      expect(await measure()).toBe(before);
    },
    TIMEOUT,
  );

  it(
    'magnifies the Attention rows under the pointer like a dock, with the total height unchanged',
    async () => {
      // ARRANGE
      await open('light');
      const list = `${SLIDE_4} [data-layout="compressed"]`;
      const heights = () =>
        evaluate<number[]>(
          send,
          `[...document.querySelectorAll('${list} [data-row]')].map((r) => r.getBoundingClientRect().height)`,
        );
      const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);
      const minRow = 3.5;
      const reach = 3;
      const tolerance = 1.5;
      const slack = 0.5;
      const rowIndex = 8;
      const target = await centreOf(`${list} [data-row]`, rowIndex);
      const resting = await heights();
      // ACT
      await mouseTo(target.x, target.y);
      await delay(400);
      const docked = await heights();
      const lit = await evaluate<string>(
        send,
        `document.querySelector('${list} [data-on]')?.getAttribute('data-part') ?? ''`,
      );
      const grown = docked.map((h, i) => h - (resting[i] ?? 0));
      const peak = grown.indexOf(Math.max(...grown));
      // ASSERT
      expect(Math.abs(sum(docked) - sum(resting))).toBeLessThan(tolerance);
      expect(Math.min(...docked)).toBeGreaterThanOrEqual(minRow);
      expect(Math.abs(peak - rowIndex)).toBeLessThanOrEqual(1);
      expect(grown.slice(peak + reach + 1).every((g) => g <= slack)).toBe(true);
      expect(lit).not.toBe('');
    },
    TIMEOUT,
  );

  it(
    'brings the chat message of a hovered compressed Attention row into view and lights it',
    async () => {
      // ARRANGE
      await open('light');
      const away = await scrollChatAway();
      const row = await centreOf(`${SLIDE_4} [class*="attRow"][data-part="${away}"]`);
      // ACT
      await mouseTo(row.x, row.y);
      await delay(900);
      const bubble = await bubbleState(away);
      // ASSERT
      expect(away).not.toBe('');
      expect(bubble.inView).toBe(true);
    },
    TIMEOUT,
  );

  it(
    'snaps the Attention rows under reduced motion, with no height transition',
    async () => {
      // ARRANGE
      const row = `${SLIDE_4} [data-layout="compressed"] [data-row]`;
      const duration = () =>
        evaluate<string>(send, `getComputedStyle(document.querySelector('${row}')).transitionDuration`);
      await open('light');
      const animated = await duration();
      // ACT
      await send('Emulation.setEmulatedMedia', {
        features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
      });
      await delay(100);
      const snapped = await duration();
      await send('Emulation.setEmulatedMedia', {
        features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }],
      });
      // ASSERT
      expect(animated).not.toBe('0s');
      expect(snapped).toBe('0s');
    },
    TIMEOUT,
  );

  it(
    'gives the Attention bar about a third of the row',
    async () => {
      // ARRANGE
      await open('light');
      const about = { min: 0.25, max: 0.4 };
      // ACT
      const share = await evaluate<number>(
        send,
        `(() => {
          const bar = document.querySelector('${SLIDE_4} [class*="attBar"]').getBoundingClientRect().width;
          const name = document.querySelector('${SLIDE_4} [class*="attName"]').getBoundingClientRect().width;
          return bar / (bar + name);
        })()`,
      );
      // ASSERT
      expect(share).toBeGreaterThan(about.min);
      expect(share).toBeLessThan(about.max);
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
    'fits a phone, a laptop and a desktop in both locales: no sideways scroll, nothing out of its card',
    async () => {
      // ARRANGE
      const widths = [375, 1100, 1440];
      const pages = [URL_UNDER_TEST, germanOf(URL_UNDER_TEST)];
      const found: string[] = [];
      // ACT
      for (const width of widths)
        for (const page of pages) {
          await viewport(width);
          await open('light', page);
          const { sideways, poking } = await overflowOf();
          found.push(...(sideways ? [`${width} ${page} scrolls ${sideways}px sideways`] : []), ...poking);
        }
      await viewport(widths[widths.length - 1]);
      // ASSERT
      expect(found).toEqual([]);
    },
    TIMEOUT,
  );

  it(
    'switches Slide 5 to the 1M window: the head reads the same chat against 1M',
    async () => {
      // ARRANGE
      await open('light');
      const preset = 'slide-5';
      const expected = { title: 'Context window (13%)', of: '128K of 200K1M' };
      // ACT
      await evaluate(
        send,
        `document.querySelectorAll('[data-cornerstone="${preset}"] [aria-label="Window size"] button')[1].click()`,
      );
      await delay(100);
      const head = await evaluate<{ title: string; of: string }>(
        send,
        `(() => {
          const head = document.querySelector('[data-cornerstone="${preset}"] section[aria-label="Context window"] > div');
          return { title: head.firstElementChild.textContent, of: head.lastElementChild.firstElementChild.textContent };
        })()`,
      );
      // ASSERT
      expect({ title: head.title, of: head.of.replace('200K', '200K') }).toEqual(expected);
    },
    TIMEOUT,
  );

  describe('context-window head', () => {
    const HEAD = `${SLIDE_4} section[aria-label="Context window"]`;
    const control = (id: string) => `${HEAD} button[data-control="${id}"]`;
    const press = (id: string) => evaluate(send, `document.querySelector('${control(id)}').click()`);
    const pressed = (id: string) =>
      evaluate<string | null>(send, `document.querySelector('${control(id)}').getAttribute('aria-pressed')`);
    const count = (selector: string) => evaluate<number>(send, `document.querySelectorAll('${selector}').length`);

    it(
      'hides and shows the context preview with the eye, in step with the toolbar chip',
      async () => {
        // ARRANGE
        await open('light');
        const expected = { before: [1, 'true'], hidden: [0, 'false', 'false'], shown: [1, 'true'] };
        const chip = `${SLIDE_4} [role="toolbar"] [role="group"] button:nth-child(4)`;
        const chipPressed = () =>
          evaluate<string | null>(send, `document.querySelector('${chip}').getAttribute('aria-pressed')`);
        // ACT
        const before = [await count(`${HEAD} [aria-label="Usage by category"]`), await pressed('preview')];
        await press('preview');
        await delay(100);
        const hidden = [
          await count(`${HEAD} [aria-label="Usage by category"]`),
          await pressed('preview'),
          await chipPressed(),
        ];
        await press('preview');
        await delay(100);
        const shown = [await count(`${HEAD} [aria-label="Usage by category"]`), await pressed('preview')];
        // ASSERT
        expect({ before, hidden, shown }).toEqual(expected);
      },
      TIMEOUT,
    );

    it(
      'hides the smart-zone column and limit label with the side-column button, and the bar widens',
      async () => {
        // ARRANGE
        await open('light');
        const width = () => evaluate<number>(send, `document.querySelector('${BAR}').getBoundingClientRect().width`);
        // ACT
        const before = { labels: await count(`${HEAD} [class*="labelLimit"]`), bar: await width() };
        await press('zone');
        await delay(100);
        const after = {
          labels: await count(`${HEAD} [class*="labelLimit"]`),
          bar: await width(),
          lines: await count(`${HEAD} [class*="line"][aria-hidden]`),
          pressed: await pressed('zone'),
        };
        // ASSERT
        expect(before.labels).toBe(1);
        expect(after.labels).toBe(0);
        expect(after.bar).toBeGreaterThan(before.bar);
        expect(after.pressed).toBe('false');
      },
      TIMEOUT,
    );

    it(
      'toggles the window to Technical locally, and the toolbar keeps the last value it set',
      async () => {
        // ARRANGE
        await open('light');
        const view = () => attr('slide-4', 'section[aria-label="Context window"]', 'data-view');
        const toolbar = `${SLIDE_4} [role="toolbar"] button[data-control="technical"]`;
        const toolbarPressed = () =>
          evaluate<string | null>(send, `document.querySelector('${toolbar}').getAttribute('aria-pressed')`);
        // ACT
        await press('windowTechnical');
        await delay(100);
        const local = [await view(), await pressed('windowTechnical'), await toolbarPressed()];
        await evaluate(send, `document.querySelector('${toolbar}').click()`);
        await delay(100);
        const global = [await view(), await pressed('windowTechnical'), await toolbarPressed()];
        // ASSERT
        expect(local).toEqual(['grid', 'true', 'false']);
        expect(global).toEqual(['grid', 'true', 'true']);
      },
      TIMEOUT,
    );

    it(
      'lights the bar from a preview row and pins it with one click',
      async () => {
        // ARRANGE
        await open('light');
        const row = `${HEAD} [aria-label="Usage by category"] button[data-part]`;
        // ACT
        const at = await centreOf(row, 1);
        await click(at.x, at.y);
        await delay(100);
        const found = await evaluate<{ pinned: string | null; lit: number }>(
          send,
          `(() => ({
          pinned: document.querySelectorAll('${row}')[1].getAttribute('aria-pressed'),
          lit: document.querySelectorAll('${HEAD} [data-roving] [data-on]').length,
        }))()`,
        );
        // ASSERT
        expect(found.pinned).toBe('true');
        expect(found.lit).toBeGreaterThan(0);
      },
      TIMEOUT,
    );
  });
});
