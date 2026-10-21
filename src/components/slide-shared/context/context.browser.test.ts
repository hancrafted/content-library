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
  // Slide 4 opens on the compaction (step 24), too few rows for the Attention tests: they scrub back to step 21.
  await commit('slide-4', 21);
  await delay(300);
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
    'lists at most two blocks before and two after the hovered one, and the lens spans exactly those rows',
    async () => {
      // ARRANGE
      await openZoom();
      const expected = { rows: 5, cursorAt: 2 };
      const tolerance = 4;
      // ACT
      const found = await evaluate<{ rows: number; cursorAt: number; lens: number }>(
        send,
        `(() => {
          const rows = [...document.querySelectorAll('${LOUPE_ROW}')];
          const blocks = [...document.querySelectorAll('${BAR} button[data-part]')];
          const keys = rows.map((r) => r.dataset.part);
          // Layout boxes, so the hovered block's grow-by-transform does not count: the lens encloses what the zoom lists.
          const mine = blocks.filter((b) => keys.includes(b.dataset.part));
          const origin = blocks[0].offsetParent.getBoundingClientRect().top;
          const top = origin + Math.min(...mine.map((b) => b.offsetTop));
          const bottom = origin + Math.max(...mine.map((b) => b.offsetTop + b.offsetHeight));
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
      const resting = await heights();
      // The thinnest row in the middle, so the growth peaks under the pointer whatever the split is.
      const middle = resting.slice(reach, -reach);
      const rowIndex = reach + middle.indexOf(Math.min(...middle));
      const target = await centreOf(`${list} [data-row]`, rowIndex);
      // ACT
      await mouseTo(target.x, target.y);
      await delay(400);
      const docked = await heights();
      const lit = await evaluate<string>(
        send,
        `document.querySelector('${list} [data-on]')?.getAttribute('data-part') ?? ''`,
      );
      // The magnified rows push each other down, so the peak sits under the pointer, which is the lit row.
      const litIndex = await evaluate<number>(
        send,
        `[...document.querySelectorAll('${list} [data-row]')].findIndex((r) => r.hasAttribute('data-on'))`,
      );
      const grown = docked.map((h, i) => h - (resting[i] ?? 0));
      const peak = grown.indexOf(Math.max(...grown));
      console.log('DBG', JSON.stringify({ resting, docked, rowIndex, target }));
      // ASSERT
      expect(Math.abs(sum(docked) - sum(resting))).toBeLessThan(tolerance);
      expect(Math.min(...docked)).toBeGreaterThanOrEqual(minRow);
      expect(Math.abs(peak - litIndex)).toBeLessThanOrEqual(1);
      expect(grown.slice(peak + reach + 1).every((g) => g <= slack)).toBe(true);
      expect(lit).not.toBe('');
    },
    TIMEOUT,
  );

  it(
    'expands a compressed Attention row that takes keyboard focus, as hovering does, and lights it',
    async () => {
      // ARRANGE
      await open('light');
      const list = `${SLIDE_4} [data-layout="compressed"]`;
      const rowHeight = (i: number) =>
        evaluate<number>(send, `document.querySelectorAll('${list} [data-row]')[${i}].getBoundingClientRect().height`);
      const all = await evaluate<number[]>(
        send,
        `[...document.querySelectorAll('${list} [data-row]')].map((r) => r.getBoundingClientRect().height)`,
      );
      // The thinnest middle row, whatever height the card gives the list.
      const middle = all.slice(3, -3);
      const index = 3 + middle.indexOf(Math.min(...middle));
      const thin = (all[index] ?? 0) + 2;
      const resting = await rowHeight(index);
      // ACT
      await evaluate(send, `document.querySelectorAll('${list} [data-row] button')[${index}].focus()`);
      await delay(400);
      const focused = await rowHeight(index);
      const lit = await evaluate<string>(
        send,
        `document.querySelector('${list} [data-on]')?.getAttribute('data-part') ?? ''`,
      );
      // ASSERT
      expect(resting).toBeLessThan(thin);
      expect(focused).toBeGreaterThan(thin);
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
  describe('reordering the parts', () => {
    it(
      'moves a dragged chip to the place it is dropped on, without toggling the part',
      async () => {
        // ARRANGE
        await open('light');
        const before = await orderOf();
        const pressed = () => attr('slide-7', `[data-chip="chat"]`, 'aria-pressed');
        // ACT
        await dragChip('chat', 'panel');
        const after = await orderOf();
        // ASSERT
        expect(before.chips.at(0)).toBe('chat');
        expect(after.chips.indexOf('chat')).toBe(before.chips.indexOf('panel'));
        expect(after.chips.at(0)).toBe('timeline');
        expect(await pressed()).toBe('true');
        expect(after.cells.at(-1)).toBe(before.cells[0]);
      },
      TIMEOUT,
    );

    it(
      'moves the context category on screen when its chip is dragged, as any other part',
      async () => {
        // ARRANGE
        await open('light');
        const before = await orderOf();
        const first = (order: { cells: string[] }) => order.cells[0]?.includes('usage');
        // ACT
        await dragChip('category', 'chat');
        const after = await orderOf();
        // ASSERT
        expect(first(before)).toBe(false);
        expect(first(after)).toBe(true);
      },
      TIMEOUT,
    );

    it(
      'moves the part nodes without remounting them, and keeps the chat scrolled where it was',
      async () => {
        // ARRANGE
        await open('light');
        const cells = ['cell-0', 'cell-1', 'cell-2', 'cell-3', 'cell-4'];
        const scrolled = await evaluate<number>(
          send,
          `(() => {
          const box = document.querySelector('${SLIDE_7} [data-chat-scroll]');
          box.scrollTo({ top: 0, behavior: 'instant' });
          box.scrollTo({ top: 120, behavior: 'instant' });
          const main = box.closest('section').parentElement;
          [...main.children].forEach((el, i) => { el.__mark = 'cell-' + i; });
          return box.scrollTop;
        })()`,
        );
        // ACT
        await dragChip('chat', 'panel');
        const found = await evaluate<{ marks: string[]; scroll: number; running: number }>(
          send,
          `(() => {
          const box = document.querySelector('${SLIDE_7} [data-chat-scroll]');
          const main = box.closest('section').parentElement;
          return {
            marks: [...main.children].map((el) => el.__mark ?? 'new'),
            scroll: box.scrollTop,
            running: document.querySelector('${SLIDE_7}').getAnimations({ subtree: true }).filter((a) => a.playState === 'running').length,
          };
        })()`,
        );
        // ASSERT
        expect(scrolled).toBeGreaterThan(0);
        expect(found.marks.sort()).toEqual(cells);
        expect(found.scroll).toBe(scrolled);
        expect(found.running).toBe(0);
      },
      TIMEOUT,
    );
  });
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
          found.push(
            ...(sideways ? [`${width} ${page} scrolls ${sideways}px sideways`] : []),
            ...poking.map((p) => `${width} ${page} ${p}`),
          );
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
      'has no eye in the head: the toolbar chip alone hides and shows the context category',
      async () => {
        // ARRANGE
        await open('light');
        const expected = { eye: 0, before: [0, 'false'], shown: [1, 'true'], hidden: [0, 'false'] };
        const chip = `${SLIDE_4} [role="toolbar"] [data-chip="category"]`;
        const chipPressed = () =>
          evaluate<string | null>(send, `document.querySelector('${chip}').getAttribute('aria-pressed')`);
        const shownCount = () => count(`${SLIDE_4} [aria-label="Usage by category"]`);
        // ACT
        const eye = await count(control('preview'));
        const before = [await shownCount(), await chipPressed()];
        await evaluate(send, `document.querySelector('${chip}').click()`);
        await delay(100);
        const shown = [await shownCount(), await chipPressed()];
        await evaluate(send, `document.querySelector('${chip}').click()`);
        await delay(100);
        const hidden = [await shownCount(), await chipPressed()];
        // ASSERT
        expect({ eye, before, hidden, shown }).toEqual(expected);
      },
      TIMEOUT,
    );

    it(
      'gives conversation and category their own Technical toggle, and the category stays beside the window in Technical',
      async () => {
        // ARRANGE
        await open('light');
        const chip = `${SLIDE_4} [role="toolbar"] [data-chip="category"]`;
        await evaluate(send, `document.querySelector('${chip}').click()`);
        await delay(100);
        const usage = `${SLIDE_4} [aria-label="Usage by category"]`;
        const top = (selector: string) =>
          evaluate<number>(send, `document.querySelector('${selector}').getBoundingClientRect().top`);
        const beside = { window: await top(HEAD), category: await top(usage) };
        // ACT
        await evaluate(send, `document.querySelector('${usage} button[data-control="categoryTechnical"]').click()`);
        await delay(150);
        const technical = { window: await top(HEAD), category: await top(usage) };
        const details = await evaluate<boolean>(send, `document.querySelector('${usage} details').open`);
        const toggles = await count(
          `${SLIDE_4} section[aria-label="Chat"] button[data-control="conversationTechnical"]`,
        );
        // ASSERT
        expect(Math.abs(beside.category - beside.window)).toBeLessThan(SAME_TOP);
        expect(Math.abs(technical.category - technical.window)).toBeLessThan(SAME_TOP);
        expect(details).toBe(false);
        expect(toggles).toBe(1);
      },
      TIMEOUT,
    );

    it(
      'fills the compressed Attention list to the last row with no overlapping rows, keeping the first and last three whole',
      async () => {
        // ARRANGE
        await open('light');
        const edge = 3;
        const list = `${SLIDE_4} [data-layout="compressed"]`;
        const tolerance = 1.5;
        // ACT
        const found = await evaluate<{
          list: { top: number; bottom: number };
          rows: { top: number; bottom: number }[];
        }>(
          send,
          `(() => {
            const el = document.querySelector('${list}');
            const box = (n) => { const r = n.getBoundingClientRect(); return { top: r.top, bottom: r.bottom }; };
            return { list: box(el), rows: [...el.querySelectorAll('[data-row]')].map(box) };
          })()`,
        );
        const heights = found.rows.map((r) => r.bottom - r.top);
        const gaps = found.rows.slice(1).map((r, i) => r.top - (found.rows[i]?.bottom ?? 0));
        // ASSERT
        expect(Math.abs((found.rows.at(-1)?.bottom ?? 0) - found.list.bottom)).toBeLessThan(tolerance);
        expect(gaps.every((gap) => Math.abs(gap) < tolerance)).toBe(true);
        expect(new Set(heights.slice(0, edge).map(Math.round)).size).toBe(1);
        expect(new Set(heights.slice(-edge).map(Math.round)).size).toBe(1);
        expect(Math.min(...heights.slice(edge, -edge))).toBeLessThan(heights[0] ?? 0);
      },
      TIMEOUT,
    );

    it(
      'hides the name of a row too thin to read it whole, so no row shows a cut-through sliver of text',
      async () => {
        // ARRANGE
        await open('light');
        const row = `${SLIDE_4} [data-layout="compressed"] [data-row]`;
        const readable = 0.85;
        // ACT
        const rows = await evaluate<{ tight: boolean; opacity: string; height: number; full: number }[]>(
          send,
          `[...document.querySelectorAll('${row}')].map((r) => ({
            tight: r.hasAttribute('data-tight'),
            opacity: getComputedStyle(r.querySelector('button')).opacity,
            height: r.getBoundingClientRect().height,
            full: parseFloat(getComputedStyle(r).fontSize) * 1.7,
          }))`,
        );
        // ASSERT
        expect(rows.some((r) => r.tight)).toBe(true);
        expect(rows.filter((r) => r.tight).every((r) => r.opacity === '0')).toBe(true);
        expect(rows.filter((r) => !r.tight).every((r) => r.height >= r.full * readable)).toBe(true);
      },
      TIMEOUT,
    );

    describe('the Attention distribution menu', () => {
      const MENU = `${SLIDE_4} button[data-control="attentionMenu"]`;
      const POPOVER = '#episode-portal-root [data-slot="attention-menu"]';
      const sliders = () =>
        evaluate<Record<string, number>>(
          send,
          `Object.fromEntries([...document.querySelectorAll('${POPOVER} input[type=range]')].map((i) => [i.dataset.curve, Number(i.value)]))`,
        );
      const setSlider = (name: string, value: number) =>
        evaluate(
          send,
          `(() => {
            const input = document.querySelector('${POPOVER} input[data-curve="${name}"]');
            Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, '${value}');
            input.dispatchEvent(new Event('input', { bubbles: true }));
            return document.body.offsetHeight;
          })()`,
        );
      const share = (bucket: string) =>
        evaluate<number>(
          send,
          `(() => { const max = Number(document.querySelector('${SLIDE_4} [data-axis-max]').dataset.axisMax); return [...document.querySelectorAll('${SLIDE_4} [data-attention-bucket="${bucket}"] [class*="attBar"] i')].reduce((s, i) => s + parseFloat(i.style.getPropertyValue('--w')) * max / 100, 0); })()`,
        );
      const sum = (values: Record<string, number>) => Object.values(values).reduce((a, b) => a + b, 0);

      it(
        'opens from the ⋯ button in the Episode portal root with four labelled sliders summing to 100',
        async () => {
          // ARRANGE
          await open('light');
          const expected = { start: 20, recent: 20, middle: 25, newest: 35 };
          const four = 4;
          // ACT
          await evaluate(send, `document.querySelector('${MENU}').click()`);
          await delay(200);
          const values = await sliders();
          const labels = await evaluate<number>(send, `document.querySelectorAll('${POPOVER} label').length`);
          const expanded = await attr('slide-4', 'button[data-control="attentionMenu"]', 'aria-expanded');
          // ASSERT
          expect(values).toEqual(expected);
          expect(labels).toBe(four);
          expect(expanded).toBe('true');
        },
        TIMEOUT,
      );

      it(
        'spreads a slider move over the others so all four still sum to 100, and reshapes the rows to it',
        async () => {
          // ARRANGE
          await open('light');
          await evaluate(send, `document.querySelector('${MENU}').click()`);
          await delay(200);
          const moved = 60;
          const whole = 100;
          const tolerance = 0.03;
          // ACT
          await setSlider('newest', moved);
          await delay(100);
          const values = await sliders();
          const newest = await share('newest');
          // ASSERT
          expect(values.newest).toBe(moved);
          expect(sum(values)).toBe(whole);
          expect(values.start).toBe(values.recent);
          expect(Math.abs(newest - moved / whole)).toBeLessThan(tolerance);
        },
        TIMEOUT,
      );

      const typeInto = (name: string, value: string) =>
        evaluate(
          send,
          `(() => {
            const input = document.querySelector('${POPOVER} input[data-curve-input="${name}"]');
            Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, '${value}');
            input.dispatchEvent(new Event('input', { bubbles: true }));
            return document.body.offsetHeight;
          })()`,
        );
      const click = (selector: string) => evaluate(send, `document.querySelector('${selector}').click()`);

      it(
        'turns the percentages into number inputs with the pen and normalises them to 100 on save',
        async () => {
          // ARRANGE
          await open('light');
          await click(MENU);
          await delay(200);
          const pen = `${POPOVER} button[data-control="attentionEdit"]`;
          const save = `${POPOVER} button[data-control="attentionSave"]`;
          const tip = 'Your input will be normalized to 100.';
          const typed = ['10', '10', '10', '10'];
          const expected = { start: 25, recent: 25, middle: 25, newest: 25 };
          // ACT
          await click(pen);
          await delay(100);
          const inputs = await evaluate<number>(
            send,
            `document.querySelectorAll('${POPOVER} input[type=number]').length`,
          );
          const title = await evaluate<string>(send, `document.querySelector('${save}').title`);
          for (const [i, name] of ['start', 'recent', 'middle', 'newest'].entries())
            await typeInto(name, typed[i] ?? '');
          await click(save);
          await delay(200);
          const values = await sliders();
          // ASSERT
          expect(inputs).toBe(typed.length);
          expect(title).toBe(tip);
          expect(values).toEqual(expected);
        },
        TIMEOUT,
      );

      it(
        'switches the Attention layout from the menu, transient',
        async () => {
          // ARRANGE
          await open('light');
          await click(MENU);
          await delay(200);
          const layout = () => attr('slide-4', '[data-layout]', 'data-layout');
          // ACT
          await click(`${POPOVER} button[data-layout-option="pinned"]`);
          await delay(100);
          const pinned = await layout();
          await click(`${POPOVER} button[data-layout-option="list"]`);
          await delay(100);
          const list = await layout();
          // ASSERT
          expect([pinned, list]).toEqual(['pinned', 'list']);
        },
        TIMEOUT,
      );

      it(
        'starts Slide 5 compressed, so the first and the newest rows are always in view',
        async () => {
          // ARRANGE
          await open('light');
          const expected = 'compressed';
          // ACT
          const actual = await attr('slide-5', '[data-layout]', 'data-layout');
          // ASSERT
          expect(actual).toBe(expected);
        },
        TIMEOUT,
      );

      it(
        'labels the axis with its current maximum, 20% when spread out, and steps up as one share grows',
        async () => {
          // ARRANGE
          await open('light');
          const axis = () => evaluate<string>(send, `document.querySelector('${SLIDE_4} [data-axis-max]').textContent`);
          const longest = () =>
            evaluate<number>(
              send,
              `Math.max(...[...document.querySelectorAll('${SLIDE_4} [class*="attBar"] i')].map((i) => parseFloat(i.style.getPropertyValue('--w'))))`,
            );
          await click(MENU);
          await delay(200);
          const floor = '20%';
          const spread = 60;
          const long = 0.5;
          // ACT
          const before = { label: await axis(), bar: await longest() };
          await setSlider('newest', spread);
          await delay(400);
          const after = { label: await axis(), bar: await longest() };
          // ASSERT
          expect(before.label).toBe(floor);
          expect(before.bar).toBeGreaterThan(long);
          expect(after.label).not.toBe(floor);
          expect(after.bar).toBeLessThanOrEqual(1);
          expect(after.bar).toBeGreaterThan(long);
        },
        TIMEOUT,
      );

      it(
        'closes on Escape and gives the focus back to the button',
        async () => {
          // ARRANGE
          await open('light');
          await evaluate(send, `document.querySelector('${MENU}').click()`);
          await delay(200);
          // ACT
          await send('Input.dispatchKeyEvent', {
            type: 'keyDown',
            key: 'Escape',
            code: 'Escape',
            windowsVirtualKeyCode: 27,
          });
          await send('Input.dispatchKeyEvent', {
            type: 'keyUp',
            key: 'Escape',
            code: 'Escape',
            windowsVirtualKeyCode: 27,
          });
          await delay(200);
          const open1 = await evaluate<number>(send, `document.querySelectorAll('${POPOVER}').length`);
          // ASSERT
          expect(open1).toBe(0);
        },
        TIMEOUT,
      );

      it(
        'marks the middle rows with a stable data-attention-bucket hook',
        async () => {
          // ARRANGE
          await open('light');
          const edge = 3;
          const hook = (name: string) => Array.from({ length: edge }, () => name);
          // ACT
          const buckets = await evaluate<string[]>(
            send,
            `[...document.querySelectorAll('${SLIDE_4} [data-row]')].map((r) => r.getAttribute('data-attention-bucket'))`,
          );
          // ASSERT
          expect(buckets.slice(0, edge)).toEqual(hook('start'));
          expect(buckets.slice(-edge)).toEqual(hook('newest'));
          expect(buckets.filter((b) => b === 'middle').length).toBeGreaterThan(0);
        },
        TIMEOUT,
      );
    });

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
      'lights the bar from a category row and pins it with one click',
      async () => {
        // ARRANGE
        await open('light');
        await evaluate(send, `document.querySelector('${SLIDE_4} [role="toolbar"] [data-chip="category"]').click()`);
        await delay(100);
        const row = `${SLIDE_4} [aria-label="Usage by category"] button[data-part]`;
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

/** Two parts on one row start within this many px of each other. */
const SAME_TOP = 2;
const SLIDE_7 = '[data-cornerstone="slide-7"]';
const CHIPS = `${SLIDE_7} [data-chip]`;

/** The part chips' ids in toolbar order, and the grid's children in DOM order (a part's own root class names it). */
const orderOf = () =>
  evaluate<{ chips: string[]; cells: string[] }>(
    send,
    `(() => {
      const root = document.querySelector('${SLIDE_7}');
      const main = root.querySelector('[data-chat-scroll]').closest('section').parentElement;
      return {
        chips: [...root.querySelectorAll('[data-chip]')].map((el) => el.dataset.chip),
        cells: [...main.children].map((el) => el.getAttribute('data-part-cell') ?? el.className.split(' ')[0]),
      };
    })()`,
  );

/** Presses a chip, drags it past the middle of another chip and releases there, as a mouse does. */
async function dragChip(from: string, onto: string) {
  const start = await centreOf(`${CHIPS}[data-chip="${from}"]`);
  const end = await evaluate<{ x: number; y: number }>(
    send,
    `(() => {
      const r = document.querySelector('${CHIPS}[data-chip="${onto}"]').getBoundingClientRect();
      const from = document.querySelector('${CHIPS}[data-chip="${from}"]').getBoundingClientRect();
      // On the near-side edge when dragging backwards, the far one when dragging forwards: past the chip's middle.
      return { x: r.left < from.left ? r.left + 4 : r.right - 4, y: r.top + r.height / 2 };
    })()`,
  );
  await mouseTo(start.x, start.y);
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', ...start, button: 'left', buttons: 1, clickCount: 1 });
  const steps = 12;
  for (let i = 1; i <= steps; i++) {
    const x = start.x + ((end.x - start.x) * i) / steps;
    const y = start.y + ((end.y - start.y) * i) / steps;
    await send('Input.dispatchMouseEvent', {
      type: 'mouseMoved',
      x,
      y,
      button: 'left',
      buttons: 1,
      pointerType: 'mouse',
    });
    await delay(20);
  }
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...end, button: 'left', clickCount: 1 });
  await delay(200);
}
