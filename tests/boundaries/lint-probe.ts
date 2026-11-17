import { execFile } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import config from '../../oxlint.config.mts';

// decision: GEN-005 §1.5
const ROOT = path.join(__dirname, '../..');
const OXLINT = path.join(ROOT, 'node_modules/.bin/oxlint');
const TAILWIND_ENTRY = 'src/app/globals.css';
const run = promisify(execFile);

export interface ProbeDiagnostic {
  ruleId: string;
  message: string;
}

interface RawDiagnostic {
  code: string;
  message: string;
  filename: string;
}

export interface Probe {
  source: string;
  virtualPath: string;
}

function ruleIdOf(code: string): string {
  const match = /^([^(]+)\((.+)\)$/.exec(code);
  if (!match) return code;
  const [, plugin, rule] = match;
  return plugin === 'eslint' || plugin === 'eslint-js' ? rule : `${plugin}/${rule}`;
}

export async function lintProbe(source: string, virtualPath: string): Promise<ProbeDiagnostic[]> {
  const [diagnostics] = await lintProbes([{ source, virtualPath }]);
  return diagnostics;
}

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
    const { stdout } = await run(OXLINT, ['-c', '.oxlintrc.json', '-f', 'json', ...paths], { cwd: mirror }).catch(
      (exitOneOnReportedErrorStillCarryingJson: { stdout?: string }) => {
        if (!exitOneOnReportedErrorStillCarryingJson.stdout) throw exitOneOnReportedErrorStillCarryingJson;
        return { stdout: exitOneOnReportedErrorStillCarryingJson.stdout };
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
