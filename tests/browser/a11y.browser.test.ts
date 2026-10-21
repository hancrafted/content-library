import axe from 'axe-core';
import { setTimeout as delay } from 'node:timers/promises';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { ensureBrowser } from '../../skills/visual-check/scripts/browser';
import { connect, evaluate, eventName, type Connection, type Send } from '../../skills/visual-check/scripts/cdp';

/*
 * The browser lane (`npm run test:browser`, local only, never CI): axe-core over the landing page and the three
 * workshop Episodes, light and dark, in the shared chrome-headless-shell. Serious and critical violations fail;
 * moderate and minor ones are only printed. It needs the site served: A11Y_BASE_URL names it, `http://localhost:4300`
 * by default, which is `npm run preview` over a fresh `npm run build`.
 */

const BASE_URL = (process.env.A11Y_BASE_URL ?? 'http://localhost:4300').replace(/\/+$/, '');
const PAGES = [
  '/',
  '/episodes/onboard-ai-every-time/',
  '/episodes/ai-attention-span/',
  '/episodes/ai-gives-you-more-work/',
];
const THEMES = ['light', 'dark'] as const;
const BLOCKING = ['serious', 'critical'];
const TIMEOUT = 120_000;

/*
 * Dimmed on purpose, and so left out of the contrast rule only: the back badges of the onboard-ai-every-time hero (marked `data-a11y-decorative`),
 * faded echoes of earlier "Day 1" badges whose fade is the picture. Every other rule still checks them.
 */
const DIMMED = ['[data-a11y-decorative]'];

let connection: Connection;
let targetId = '';
let send: Send;
let sessionId = '';

async function open(url: string, theme: (typeof THEMES)[number]) {
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: theme }] });
  const loaded = new Promise((resolve) =>
    connection.events.addEventListener(eventName(sessionId, 'Page.loadEventFired'), resolve, { once: true }),
  );
  await send('Page.navigate', { url });
  await loaded;
  await delay(2000);
  await evaluate(send, axe.source);
}

interface Found {
  id: string;
  impact: string;
  nodes: string[];
}

/** Every WCAG A and AA violation on the page, as `impact rule: target` lines. */
async function violations(): Promise<string[]> {
  const { result, exceptionDetails } = (await send('Runtime.evaluate', {
    expression: `(async () => {
      const tags = { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] };
      const keep = (r) => r.violations;
      const rest = await axe.run(document, { runOnly: tags, rules: { 'color-contrast': { enabled: false } } });
      const contrast = await axe.run({ exclude: ${JSON.stringify(DIMMED.map((d) => [d]))} }, { runOnly: ['color-contrast'] });
      return [...keep(rest), ...keep(contrast)];
    })()
      .then((all) => all.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.map((n) => n.target.join(' ') + (n.any[0]?.data?.contrastRatio ? ' [' + n.any[0].data.fgColor + ' on ' + n.any[0].data.bgColor + ' = ' + n.any[0].data.contrastRatio + ']' : '')) })))`,
    awaitPromise: true,
    returnByValue: true,
  })) as { result: { value: Found[] }; exceptionDetails?: { exception?: { description?: string } } };
  if (exceptionDetails) throw new Error(exceptionDetails.exception?.description ?? 'axe-core failed in the page');
  return result.value.flatMap((v) => v.nodes.map((node) => `${v.impact} ${v.id}: ${node}`));
}

beforeAll(async () => {
  const endpoint = await ensureBrowser();
  connection = await connect(endpoint.port);
  const browser = connection.sender();
  ({ targetId } = (await browser('Target.createTarget', { url: 'about:blank' })) as { targetId: string });
  ({ sessionId } = (await browser('Target.attachToTarget', { targetId, flatten: true })) as { sessionId: string });
  send = connection.sender(sessionId);
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await send('Page.enable');
}, TIMEOUT);

afterAll(async () => {
  await connection
    .sender()('Target.closeTarget', { targetId })
    .catch(() => undefined);
  connection.socket.close();
});

describe('accessibility', () => {
  for (const page of PAGES) {
    for (const theme of THEMES) {
      it(
        `has no serious or critical axe violation on ${page} in ${theme}`,
        async () => {
          // ARRANGE
          await open(`${BASE_URL}${page}`, theme);
          // ACT
          const found = await violations();
          // ASSERT
          const minor = found.filter((line) => !BLOCKING.some((impact) => line.startsWith(impact)));
          if (minor.length > 0) console.info(`${page} (${theme}) non-blocking:\n${minor.join('\n')}`);
          expect(found.filter((line) => BLOCKING.some((impact) => line.startsWith(impact)))).toEqual([]);
        },
        TIMEOUT,
      );
    }
  }
});
