import { execFile } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import config from '../../oxlint.config.mts';

/*
 * Probe helper for the lint boundary suites (GEN-005): lints one snippet through the repo's oxlint config as if it
 * sat at a virtual path. The config's per-file overrides are globs relative to the config, so the snippet is written
 * under a temporary mirror of the path, beside the config written out as JSON, with the installed plugins and the Tailwind
 * entry stylesheet linked in.
 */

const ROOT = path.join(__dirname, '../..');
const OXLINT = path.join(ROOT, 'node_modules/.bin/oxlint');
const TAILWIND_ENTRY = 'src/app/globals.css';
const run = promisify(execFile);

export interface ProbeDiagnostic {
  /** The rule id as the lint config names it: `no-restricted-syntax`, `better-tailwindcss/no-unknown-classes`. */
  ruleId: string;
  message: string;
}

interface RawDiagnostic {
  code: string;
  message: string;
  filename: string;
}

/** A snippet and the virtual path, relative to the repo root, it is linted at. */
export interface Probe {
  source: string;
  virtualPath: string;
}

/** `better-tailwindcss(no-unknown-classes)` becomes `better-tailwindcss/no-unknown-classes`; `eslint-js(x)` and `eslint(x)` become `x`. */
function ruleIdOf(code: string): string {
  const match = /^([^(]+)\((.+)\)$/.exec(code);
  if (!match) return code;
  const [, plugin, rule] = match;
  return plugin === 'eslint' || plugin === 'eslint-js' ? rule : `${plugin}/${rule}`;
}

/** The diagnostics a snippet draws when linted at `virtualPath`, relative to the repo root. */
export async function lintProbe(source: string, virtualPath: string): Promise<ProbeDiagnostic[]> {
  const [diagnostics] = await lintProbes([{ source, virtualPath }]);
  return diagnostics;
}

/**
 * The diagnostics each probe draws, in the probes' order, from one oxlint run. A run's cost is starting oxlint and its
 * plugins (about a second), not the files it lints, so a test that probes several paths pays it once. Paths must differ.
 */
export async function lintProbes(probes: readonly Probe[]): Promise<ProbeDiagnostic[][]> {
  const paths = probes.map((p) => p.virtualPath);
  if (new Set(paths).size !== paths.length) throw new Error(`lintProbes: each probe needs its own path: ${paths}`);
  const mirror = mkdtempSync(path.join(tmpdir(), 'lint-probe-'));
  try {
    writeFileSync(path.join(mirror, '.oxlintrc.json'), JSON.stringify(config));
    symlinkSync(path.join(ROOT, 'node_modules'), path.join(mirror, 'node_modules'));
    mkdirSync(path.join(mirror, path.dirname(TAILWIND_ENTRY)), { recursive: true });
    symlinkSync(path.join(ROOT, TAILWIND_ENTRY), path.join(mirror, TAILWIND_ENTRY));
    for (const { source, virtualPath } of probes) {
      mkdirSync(path.join(mirror, path.dirname(virtualPath)), { recursive: true });
      writeFileSync(path.join(mirror, virtualPath), source);
    }
    // oxlint exits 1 when it reports an error; the JSON on stdout is the answer either way.
    const { stdout } = await run(OXLINT, ['-c', '.oxlintrc.json', '-f', 'json', ...paths], { cwd: mirror }).catch(
      (error: { stdout?: string }) => {
        if (!error.stdout) throw error;
        return { stdout: error.stdout };
      },
    );
    const { diagnostics } = JSON.parse(stdout) as { diagnostics: RawDiagnostic[] };
    return paths.map((file) =>
      diagnostics
        .filter((d) => path.normalize(d.filename) === path.normalize(file))
        .map((d) => ({ ruleId: ruleIdOf(d.code), message: d.message })),
    );
  } finally {
    rmSync(mirror, { recursive: true, force: true });
  }
}
