// Drives the installed Chrome over the DevTools protocol (Node's built-in
// WebSocket, no dependency) to print DOM numbers as JSON and, with --out, save a
// screenshot capped at MAX_EDGE px on its longest side. See ../SKILL.md.
import { spawn, type ChildProcess } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { parseArgs } from 'node:util';

const MAX_EDGE = 800;
const CHROME = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}
type Send = (method: string, params?: object) => Promise<Record<string, unknown>>;

const { values: args } = parseArgs({
  options: {
    url: { type: 'string' },
    width: { type: 'string', default: '1280' },
    height: { type: 'string', default: '800' },
    clip: { type: 'string' },
    out: { type: 'string' },
    probe: { type: 'string', multiple: true, default: [] },
    styles: { type: 'string', default: '' },
    wait: { type: 'string', default: '500' },
  },
});

async function launchChrome(profile: string): Promise<{ chrome: ChildProcess; port: string }> {
  const flags = ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--hide-scrollbars'];
  const chrome = spawn(CHROME, [...flags, 'about:blank'], { stdio: 'ignore' });
  const portFile = path.join(profile, 'DevToolsActivePort');
  for (let attempt = 0; attempt < 100 && !existsSync(portFile); attempt++) await delay(100);
  if (!existsSync(portFile)) throw new Error(`Chrome did not start; set CHROME_PATH (tried ${CHROME})`);
  return { chrome, port: readFileSync(portFile, 'utf8').split('\n')[0] };
}

async function connect(port: string): Promise<{ send: Send; events: EventTarget; socket: WebSocket }> {
  const targets = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()) as {
    type: string;
    webSocketDebuggerUrl: string;
  }[];
  const socket = new WebSocket(targets.find((target) => target.type === 'page')!.webSocketDebuggerUrl);
  await new Promise((resolve) => socket.addEventListener('open', resolve, { once: true }));
  const pending = new Map<
    number,
    (message: { result?: Record<string, unknown>; error?: { message: string } }) => void
  >();
  const events = new EventTarget();
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(String(event.data));
    if (message.id) pending.get(message.id)?.(message);
    else events.dispatchEvent(new Event(message.method));
  });
  let nextId = 0;
  const send: Send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = ++nextId;
      pending.set(id, (message) =>
        message.error ? reject(new Error(message.error.message)) : resolve(message.result ?? {}),
      );
      socket.send(JSON.stringify({ id, method, params }));
    });
  return { send, events, socket };
}

async function evaluate<T>(send: Send, expression: string): Promise<T> {
  const { result } = (await send('Runtime.evaluate', { expression, returnByValue: true })) as { result: { value: T } };
  return result.value;
}

/** Count, first box and chosen computed styles for each --probe selector. */
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

async function load(send: Send, events: EventTarget, viewport: Box): Promise<void> {
  await send('Emulation.setDeviceMetricsOverride', {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await send('Page.enable');
  const loaded = new Promise((resolve) => events.addEventListener('Page.loadEventFired', resolve, { once: true }));
  await send('Page.navigate', { url: args.url });
  await loaded;
  await delay(Number(args.wait));
}

async function clipBox(send: Send, viewport: Box): Promise<Box> {
  if (!args.clip) return viewport;
  const [probe] = await evaluate<{ box?: Box }[]>(send, probeExpression([args.clip], []));
  if (!probe.box) throw new Error(`--clip selector matched nothing: ${args.clip}`);
  return probe.box;
}

async function screenshot(send: Send, viewport: Box): Promise<{ path: string; width: number; height: number }> {
  const box = await clipBox(send, viewport);
  const scale = Math.min(1, MAX_EDGE / Math.max(box.width, box.height));
  const { data } = (await send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: true,
    clip: { ...box, scale },
  })) as { data: string };
  writeFileSync(args.out!, Buffer.from(data, 'base64'));
  return { path: args.out!, width: Math.round(box.width * scale), height: Math.round(box.height * scale) };
}

async function main(): Promise<void> {
  if (!args.url)
    throw new Error('usage: npm run shot -- --url <url> [--out file.png] [--clip sel] [--probe sel]... [--styles a,b]');
  const viewport: Box = { x: 0, y: 0, width: Number(args.width), height: Number(args.height) };
  const profile = mkdtempSync(path.join(tmpdir(), 'shot-'));
  const { chrome, port } = await launchChrome(profile);
  try {
    const { send, events, socket } = await connect(port);
    await load(send, events, viewport);
    const styles = args.styles ? args.styles.split(',') : [];
    const probes = await evaluate<unknown[]>(send, probeExpression(args.probe, styles));
    const image = args.out ? await screenshot(send, viewport) : undefined;
    console.log(
      JSON.stringify(
        { url: args.url, viewport: { width: viewport.width, height: viewport.height }, image, probes },
        null,
        2,
      ),
    );
    socket.close();
  } finally {
    const exited = new Promise((resolve) => chrome.once('exit', resolve));
    chrome.kill();
    await exited;
    rmSync(profile, { recursive: true, force: true });
  }
}

main().catch((error: Error) => {
  console.error(`✖ ${error.message}`);
  process.exitCode = 1;
});
