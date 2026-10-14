// The shared chrome-headless-shell: install, start once (even across parallel
// callers), find again, stop, and end after IDLE_MS without a call.
import { execFileSync, spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { isIdle, mainCheckout, parseEndpoint, type Endpoint } from './inspect-page.pure.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const CACHE = path.join(ROOT, '.cache', 'inspect-page');
const ENDPOINT = path.join(CACHE, 'endpoint');
const LAST_USE = path.join(CACHE, 'last-use');
// The binary is shared by every worktree (one 217 MB download); the browser instance stays per worktree.
const SHARED = path.join(
  mainCheckout(execFileSync('git', ['rev-parse', '--git-common-dir'], { cwd: ROOT, encoding: 'utf8' }).trim(), ROOT),
  '.cache',
  'inspect-page-shared',
);
const BINARY = path.join(SHARED, 'binary');
const LOCK = path.join(CACHE, 'start.lock');
const ENTRY = path.join(path.dirname(fileURLToPath(import.meta.url)), 'inspect-page.ts');

const alive = (pid: number): boolean => {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
};

/** Records a call, which postpones the idle exit. */
export const touch = (): void => writeFileSync(LAST_USE, String(Date.now()));

const savedEndpoint = (): Endpoint | null =>
  existsSync(ENDPOINT) ? parseEndpoint(readFileSync(ENDPOINT, 'utf8')) : null;

// Pinned so the browser every run drives is the one this skill was checked against; bump both together.
const PUPPETEER_BROWSERS = '@puppeteer/browsers@3.2.4';
const HEADLESS_SHELL = 'chrome-headless-shell@155.0.8059.79';

/** Downloads the pinned browser into the shared cache; returns the binary's final path. */
function installShared(): string {
  // Install beside the final dir, then rename into place: a concurrent first download from another worktree
  // either wins the rename or is discarded, and nobody ever sees a half-written install.
  mkdirSync(SHARED, { recursive: true });
  const staging = path.join(SHARED, `browser.${process.pid}.tmp`);
  const final = path.join(SHARED, 'browser');
  let installed: string;
  try {
    const output = execFileSync('npx', ['--yes', PUPPETEER_BROWSERS, 'install', HEADLESS_SHELL, '--path', staging], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'inherit'],
    });
    const stagedBinary = output
      .trim()
      .split('\n')
      .at(-1)!
      .replace(/^\S+\s+/, '');
    try {
      renameSync(staging, final);
    } catch {
      if (!existsSync(final)) throw new Error(`Could not move the browser into ${final}`);
    }
    installed = path.join(final, path.relative(staging, stagedBinary));
  } finally {
    rmSync(staging, { recursive: true, force: true });
  }
  return installed;
}

/** CHROME_PATH, else the cached chrome-headless-shell, installed on first use. */
function resolveBinary(): string {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  if (existsSync(BINARY) && existsSync(readFileSync(BINARY, 'utf8'))) return readFileSync(BINARY, 'utf8');
  const installed = installShared();
  const tmp = `${BINARY}.${process.pid}.tmp`;
  writeFileSync(tmp, installed);
  renameSync(tmp, BINARY);
  return installed;
}

/** Ends the browser and its watchdog; false when none was recorded. */
export function stopBrowser(): boolean {
  const endpoint = savedEndpoint();
  rmSync(ENDPOINT, { force: true });
  if (!endpoint) return false;
  for (const pid of [endpoint.pid, endpoint.watchdog]) if (pid !== process.pid && alive(pid)) process.kill(pid);
  return true;
}

/** The watchdog process body: stops the browser once no call has touched LAST_USE for IDLE_MS. */
export async function watch(browserPid: number): Promise<void> {
  let idle = false;
  while (alive(browserPid) && !idle) {
    await delay(15_000);
    idle = isIdle(existsSync(LAST_USE) ? Number(readFileSync(LAST_USE, 'utf8')) : 0, Date.now());
  }
  stopBrowser();
}

async function responds(endpoint: Endpoint): Promise<boolean> {
  try {
    return alive(endpoint.pid) && (await fetch(`http://127.0.0.1:${endpoint.port}/json/version`)).ok;
  } catch {
    return false;
  }
}

async function startBrowser(): Promise<Endpoint> {
  const binary = resolveBinary();
  const profile = path.join(CACHE, 'profile');
  const portFile = path.join(profile, 'DevToolsActivePort');
  rmSync(portFile, { force: true });
  const flags = ['--remote-debugging-port=0', `--user-data-dir=${profile}`, '--hide-scrollbars', 'about:blank'];
  const browser = spawn(binary, flags, { detached: true, stdio: 'ignore' });
  browser.unref();
  for (let attempt = 0; attempt < 100 && !existsSync(portFile); attempt++) await delay(100);
  if (!existsSync(portFile)) throw new Error(`Browser did not start; set CHROME_PATH (tried ${binary})`);
  touch();
  const watchdog = spawn(process.execPath, [ENTRY, '--watch', String(browser.pid)], {
    detached: true,
    stdio: 'ignore',
  });
  watchdog.unref();
  const port = Number(readFileSync(portFile, 'utf8').split('\n')[0]);
  const endpoint: Endpoint = { pid: browser.pid!, port, watchdog: watchdog.pid! };
  writeFileSync(ENDPOINT, JSON.stringify(endpoint));
  return endpoint;
}

/** Under the start lock: reuse what answers, else replace the stale browser. */
async function reuseOrStart(): Promise<Endpoint> {
  const saved = savedEndpoint();
  if (saved && (await responds(saved))) return saved;
  if (saved) stopBrowser();
  return startBrowser();
}

function tryLock(): boolean {
  try {
    mkdirSync(LOCK);
    return true;
  } catch {
    return false;
  }
}

/** The running browser's endpoint; starts one, once across parallel callers, when none answers. */
export async function ensureBrowser(): Promise<Endpoint> {
  mkdirSync(CACHE, { recursive: true });
  for (let attempt = 0; attempt < 600; attempt++) {
    const saved = savedEndpoint();
    if (saved && (await responds(saved))) return saved;
    if (!tryLock()) {
      await delay(100);
      continue;
    }
    try {
      return await reuseOrStart();
    } finally {
      rmSync(LOCK, { recursive: true, force: true });
    }
  }
  throw new Error('Timed out waiting for the browser to start');
}
