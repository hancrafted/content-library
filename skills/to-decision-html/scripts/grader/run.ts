// Grades one page file: for every check and width, a fresh browser context with networking blocked loads the page,
// the check observes it, and its pure judge rules. A fresh context per check keeps an interacting check from
// changing what the next one sees.
import { chromium, type Browser } from '@playwright/test';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Check, LoadedPage, Mode } from './check.ts';
import { combine, toReport, type Report, type WidthResult } from './report.pure.ts';

/** Desktop and landscape tablet, the widths a decision page is built for. */
export const VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 1024, height: 768 },
] as const;

export const launch = (): Promise<Browser> => chromium.launch();

type Viewport = (typeof VIEWPORTS)[number];

/** The browser to grade in and the page file's URL. */
interface Target {
  readonly browser: Browser;
  readonly url: string;
}

/** Opens the page offline; every request other than the page itself is recorded and aborted. */
async function open({ browser, url }: Target, viewport: Viewport): Promise<LoadedPage> {
  const context = await browser.newContext({ viewport, serviceWorkers: 'block' });
  // Routing aborts what it intercepts; the request listener also sees file:// loads, which routing may not.
  const requests = new Set<string>();
  await context.route('**/*', (route) =>
    route.request().url() === url ? route.continue() : route.abort('blockedbyclient'),
  );
  const page = await context.newPage();
  page.on('request', (request) => {
    const requested = request.url();
    if (requested !== url && !/^(data|blob|about):/.test(requested)) requests.add(requested);
  });
  await page.goto(url, { waitUntil: 'networkidle' });
  const mode = await page.evaluate(() => document.documentElement.getAttribute('data-mode'));
  return { page, html: await page.content(), requests: [...requests], mode, width: viewport.width };
}

/** One check at one width, with the mode the page declared. */
async function atWidth(
  { browser, url }: Target,
  check: Check,
  viewport: Viewport,
): Promise<WidthResult & { mode: string | null }> {
  const loaded = await open({ browser, url }, viewport);
  const { width, mode } = loaded;
  try {
    if (check.modes && !check.modes.includes(mode as Mode)) return { width, mode, problems: null };
    return { width, mode, problems: check.judge(await check.observe(loaded)) };
  } catch (error) {
    return { width, mode, problems: [`the check crashed: ${(error as Error).message}`] };
  } finally {
    await loaded.page.context().close();
  }
}

export async function gradeFile(browser: Browser, checks: readonly Check[], file: string): Promise<Report> {
  const url = pathToFileURL(path.resolve(file)).href;
  const results = [];
  let mode: string | null = null;
  for (const check of checks) {
    const widths = [];
    for (const viewport of VIEWPORTS) widths.push(await atWidth({ browser, url }, check, viewport));
    mode = widths[0].mode;
    results.push(combine(check, widths));
  }
  return toReport(path.resolve(file), mode, results);
}
