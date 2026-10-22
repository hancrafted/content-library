// The pure parts of `npm run inspect-page`: arguments, the url x theme job list,
// the screenshot size cap, the saved browser endpoint and the idle rule.
import path from 'node:path';

export const IDLE_MS = 10 * 60 * 1000;
export const DEVICE_SCALE_FACTOR = 2;
export const MAX_EDGE = 1568;

/** The main checkout: the parent of `git rev-parse --git-common-dir`, the same from every worktree. */
export const mainCheckout = (commonDir: string, cwd: string): string => path.dirname(path.resolve(cwd, commonDir));

export type Theme = 'light' | 'dark';

export interface InspectArgs {
  urls: string[];
  /** One entry per requested theme, or [null] for the browser default. */
  themes: (Theme | null)[];
  width: number;
  height: number;
  clip?: string;
  out?: string;
  probes: string[];
  styles: string[];
  wait: number;
  stop: boolean;
}

export interface Job {
  url: string;
  theme: Theme | null;
  /** Where to save this job's screenshot. */
  out?: string;
}

export interface Endpoint {
  pid: number;
  port: number;
  watchdog: number;
}

export const USAGE =
  'usage: npm run inspect-page -- --url <url>... [--theme light,dark] [--out file.png] [--clip sel] [--probe sel]... [--styles a,b] [--width n --height n] [--wait ms] | --stop';

const VALUE_FLAGS = ['--url', '--theme', '--width', '--height', '--clip', '--out', '--probe', '--styles', '--wait'];

type RawFlags = Record<string, string[]>;

function collectFlags(argv: readonly string[]): { raw: RawFlags; stop: boolean } | { error: string } {
  const raw: RawFlags = {};
  let stop = false;
  for (let index = 0; index < argv.length; index++) {
    const flag = argv[index];
    if (flag === '--stop') stop = true;
    else if (VALUE_FLAGS.includes(flag) && argv[index + 1] !== undefined) (raw[flag] ??= []).push(argv[++index]);
    else return { error: `unknown or incomplete argument '${flag}'\n${USAGE}` };
  }
  return { raw, stop };
}

function parseThemes(values: string[] = []): (Theme | null)[] | { error: string } {
  const names = values.flatMap((value) => value.split(',')).filter(Boolean);
  const bad = names.find((name) => name !== 'light' && name !== 'dark');
  if (bad) return { error: `--theme must be light or dark, got ${bad}` };
  return names.length > 0 ? (names as Theme[]) : [null];
}

function buildArgs(raw: RawFlags, themes: (Theme | null)[], stop: boolean): InspectArgs {
  const last = (flag: string, fallback?: string): string | undefined => raw[flag]?.at(-1) ?? fallback;
  return {
    urls: raw['--url'] ?? [],
    themes,
    width: Number(last('--width', '1280')),
    height: Number(last('--height', '800')),
    clip: last('--clip'),
    out: last('--out'),
    probes: raw['--probe'] ?? [],
    styles: (last('--styles', '') ?? '').split(',').filter(Boolean),
    wait: Number(last('--wait', '500')),
    stop,
  };
}

export function parseArgs(argv: readonly string[]): InspectArgs | { error: string } {
  const flags = collectFlags(argv);
  if ('error' in flags) return flags;
  const themes = parseThemes(flags.raw['--theme']);
  if ('error' in themes) return themes;
  if (!flags.stop && !flags.raw['--url']) return { error: USAGE };
  return buildArgs(flags.raw, themes, flags.stop);
}

export function expandJobs(urls: readonly string[], themes: readonly (Theme | null)[]): Job[] {
  return urls.flatMap((url) => themes.map((theme) => ({ url, theme })));
}

/**
 * The `clip.scale` for a capture at device pixel ratio 2 whose longest edge is
 * capped at MAX_EDGE pixels, and the resulting image size.
 */
export function fitScale(box: { width: number; height: number }): {
  scale: number;
  pixels: { width: number; height: number };
} {
  const scale = Math.min(1, MAX_EDGE / (Math.max(box.width, box.height) * DEVICE_SCALE_FACTOR));
  return {
    scale,
    pixels: {
      width: Math.round(box.width * DEVICE_SCALE_FACTOR * scale),
      height: Math.round(box.height * DEVICE_SCALE_FACTOR * scale),
    },
  };
}

const isPid = (value: unknown): value is number => Number.isInteger(value);

export function parseEndpoint(text: string): Endpoint | null {
  let value: Record<string, unknown> | null;
  try {
    value = JSON.parse(text);
  } catch {
    return null;
  }
  const { pid, port, watchdog } = value ?? {};
  return isPid(pid) && isPid(port) && isPid(watchdog) ? { pid, port, watchdog } : null;
}

export function isIdle(lastUse: number, now: number): boolean {
  return now - lastUse >= IDLE_MS;
}

/**
 * Chrome's launch flags. A Linux CI runner (Ubuntu 24.04) forbids the unprivileged user namespace Chrome's sandbox
 * needs, so Chrome exits before it writes its debugging port; there the sandbox goes, as Playwright's own launch does.
 */
export function chromeFlags(profile: string, host: { platform: string; ci: boolean }): string[] {
  const flags = ['--remote-debugging-port=0', `--user-data-dir=${profile}`, '--hide-scrollbars', 'about:blank'];
  return host.platform === 'linux' && host.ci ? ['--no-sandbox', ...flags] : flags;
}
