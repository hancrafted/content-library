// One URL x theme on its own tab: load, probe, report its health (sideways scroll, broken images), optionally
// screenshot. The tab is closed afterwards and nothing else in the shared browser is touched.
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { evaluate, eventName, type Connection, type Send } from './cdp.ts';
import { DEVICE_SCALE_FACTOR, fitScale, type InspectArgs, type Job } from './inspect-page.pure.ts';

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Count, first box and chosen computed styles for each selector. */
function probeExpression(selectors: string[], styles: string[]): string {
  return `(${JSON.stringify(selectors)}).map((selector) => {
    const all = document.querySelectorAll(selector);
    const first = all[0];
    const rect = first?.getBoundingClientRect();
    const computed = first ? getComputedStyle(first) : undefined;
    return {
      selector,
      count: all.length,
      box: rect && { x: Math.round(rect.x), y: Math.round(rect.y + scrollY), width: Math.round(rect.width), height: Math.round(rect.height) },
      styles: computed && Object.fromEntries(${JSON.stringify(styles)}.map((name) => [name, computed.getPropertyValue(name)])),
    };
  })`;
}

/**
 * Whether the page scrolls sideways at this width, and the images that did not load, by their source. A lazy or
 * still-loading image is made eager and waited for (at most 5 s), so a slow image is not reported as broken.
 */
const HEALTH = `(async () => {
  const images = [...document.images];
  const settled = (image) => image.complete || new Promise((done) => {
    image.addEventListener('load', done, { once: true });
    image.addEventListener('error', done, { once: true });
  });
  for (const image of images) image.loading = 'eager';
  await Promise.race([Promise.all(images.map(settled)), new Promise((done) => setTimeout(done, 5000))]);
  return {
    overflowX: document.documentElement.scrollWidth > innerWidth,
    brokenImages: images.filter((image) => !image.complete || image.naturalWidth === 0).map((image) => image.currentSrc || image.src),
  };
})()`;

async function load(tab: Tab, job: Job, args: InspectArgs): Promise<void> {
  const { send } = tab;
  await send('Emulation.setDeviceMetricsOverride', {
    width: args.width,
    height: args.height,
    deviceScaleFactor: DEVICE_SCALE_FACTOR,
    mobile: false,
  });
  // The site's theme defaults to the system preference, so emulating it sets the theme a fresh reader sees.
  if (job.theme)
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: job.theme }] });
  await send('Page.enable');
  const loaded = new Promise((resolve) =>
    tab.events.addEventListener(eventName(tab.sessionId, 'Page.loadEventFired'), resolve, { once: true }),
  );
  await send('Page.navigate', { url: job.url });
  await loaded;
  await delay(args.wait);
}

interface Tab {
  send: Send;
  events: EventTarget;
  sessionId: string;
}

async function clipBox(send: Send, args: InspectArgs): Promise<Box> {
  if (!args.clip) return { x: 0, y: 0, width: args.width, height: args.height };
  // Scroll the element in first: an Episode mounts a Slide's content only near the viewport.
  await evaluate(send, `document.querySelector(${JSON.stringify(args.clip)})?.scrollIntoView({ block: 'start' })`);
  await delay(args.wait);
  const [found] = await evaluate<{ box?: Box }[]>(send, probeExpression([args.clip], []));
  if (!found.box) throw new Error(`--clip selector matched nothing: ${args.clip}`);
  return found.box;
}

async function screenshot(
  send: Send,
  args: InspectArgs,
  out: string,
): Promise<{ path: string; width: number; height: number }> {
  const box = await clipBox(send, args);
  const { scale, pixels } = fitScale(box);
  const { data } = (await send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: true,
    clip: { ...box, scale },
  })) as { data: string };
  mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
  writeFileSync(out, Buffer.from(data, 'base64'));
  return { path: out, ...pixels };
}

export async function inspect(connection: Connection, args: InspectArgs, job: Job): Promise<unknown> {
  const browser = connection.sender();
  const { targetId } = (await browser('Target.createTarget', { url: 'about:blank' })) as { targetId: string };
  try {
    const { sessionId } = (await browser('Target.attachToTarget', { targetId, flatten: true })) as {
      sessionId: string;
    };
    const send = connection.sender(sessionId);
    await load({ send, events: connection.events, sessionId }, job, args);
    const probes = await evaluate<unknown[]>(send, probeExpression(args.probes, args.styles));
    const health = await evaluate<unknown>(send, HEALTH);
    const image = job.out ? await screenshot(send, args, job.out) : undefined;
    return {
      url: job.url,
      theme: job.theme,
      viewport: { width: args.width, height: args.height },
      image,
      health,
      probes,
    };
  } finally {
    await browser('Target.closeTarget', { targetId }).catch(() => undefined);
  }
}
