import { ESLint } from 'eslint';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

// Probe and ratchet tests for the thin-shell lint rules (FE-014, eslint.config.mjs,
// src/shared/design-system/legacy-shells.json):
// - Hooks (src/{shared,episodes,pipeline}/hooks/**/*.ts, src/explorable-explanations/*/use-*.ts)
//   and client components (src/**/*.client.tsx) are capped at complexity: 3 and max-depth: 1.
// - Existing offenders listed in legacy-shells.json keep the global complexity: 7 and max-depth: 3 budget.
// - Every file in legacy-shells.json must exist and still exceed the shell budget, so the list can only shrink.

const ROOT = path.join(__dirname, '../..');
const LEGACY_SHELLS_PATH = path.join(ROOT, 'src/shared/design-system/legacy-shells.json');
const TIMEOUT = 30_000;

const eslint = new ESLint({ cwd: ROOT });
const shellCapEslint = new ESLint({
  cwd: ROOT,
  overrideConfig: [
    {
      files: ['**/*.{ts,tsx}'],
      rules: {
        complexity: ['error', 3],
        'max-depth': ['error', 1],
      },
    },
  ],
});

const HOOK_PROBE = 'src/shared/hooks/use-probe.ts';
const EXPLORABLE_HOOK_PROBE = 'src/explorable-explanations/context/use-probe.ts';
const CLIENT_PROBE = 'src/shared/page-chrome/toggles/probe.client.tsx';
const PURE_IN_HOOKS_PROBE = 'src/shared/hooks/use-probe.pure.ts';

const THIN_HOOK_FIXTURE = [
  'export function useProbe(active: boolean, fallback: string): string {',
  '  return active ? "on" : fallback;',
  '}',
  '',
].join('\n');

const THIN_CLIENT_FIXTURE = [
  "'use client';",
  'export function Probe({ label, active }: { label: string; active: boolean }) {',
  '  return <button type="button">{active ? label : "idle"}</button>;',
  '}',
  '',
].join('\n');

const BRANCHING_HOOK_FIXTURE = [
  'export function useProbe(a: number, b: number, c: number): number {',
  '  if (a > 0 && b > 0 && c > 0) return a + b + c;',
  '  return 0;',
  '}',
  '',
].join('\n');

const BRANCHING_CLIENT_FIXTURE = [
  "'use client';",
  'export function Probe({ a, b, c }: { a: boolean; b: boolean; c: boolean }) {',
  '  if (a && b && c) return <div />;',
  '  return <span />;',
  '}',
  '',
].join('\n');

const DEEP_HOOK_FIXTURE = [
  'export function useProbe(items: readonly number[]): number {',
  '  for (const item of items) {',
  '    if (item > 0) return item;',
  '  }',
  '  return 0;',
  '}',
  '',
].join('\n');

const OVER_GLOBAL_BUDGET_FIXTURE = [
  'export function useProbe(n: number): number {',
  '  if (n === 1 || n === 2 || n === 3 || n === 4 || n === 5 || n === 6 || n === 7) return n;',
  '  return 0;',
  '}',
  '',
].join('\n');

function readLegacyShellFiles(): string[] {
  const raw = JSON.parse(readFileSync(LEGACY_SHELLS_PATH, 'utf8')) as { files: string[] };
  return raw.files;
}

function isShellCapViolation(message: { ruleId: string | null }): boolean {
  return message.ruleId === 'complexity' || message.ruleId === 'max-depth';
}

/** The complexity / max-depth rule ids a snippet breaks when linted as `file` with the repo config. */
async function shellViolations(code: string, file: string, linter: ESLint = eslint): Promise<string[]> {
  const [result] = await linter.lintText(code, { filePath: path.join(ROOT, file) });
  return result.messages.filter(isShellCapViolation).map((m) => m.ruleId ?? '');
}

/** Listed entries that either do not exist on disk or no longer exceed the shell budget. */
async function staleLegacyEntries(files: readonly string[]): Promise<string[]> {
  const existing = files.filter((file) => existsSync(path.join(ROOT, file)));
  const missing = files.filter((file) => !existsSync(path.join(ROOT, file)));
  const results = await shellCapEslint.lintFiles(existing.map((file) => path.join(ROOT, file)));
  const underBudget = results
    .filter((r) => !r.messages.some(isShellCapViolation))
    .map((r) => path.relative(ROOT, r.filePath));
  return [...missing, ...underBudget];
}

describe('success cases', () => {
  it(
    'passes a thin hook and a thin *.client.tsx component within the shell budget',
    async () => {
      // ARRANGE
      const expected: [string[], string[], string[]] = [[], [], []];
      // ACT
      const found = await Promise.all([
        shellViolations(THIN_HOOK_FIXTURE, HOOK_PROBE),
        shellViolations(THIN_HOOK_FIXTURE, EXPLORABLE_HOOK_PROBE),
        shellViolations(THIN_CLIENT_FIXTURE, CLIENT_PROBE),
      ]);
      // ASSERT
      expect(found).toEqual(expected);
    },
    TIMEOUT,
  );

  it(
    'passes a listed offender at the old budget',
    async () => {
      // ARRANGE
      const [listedHook] = readLegacyShellFiles();
      const expected: string[] = [];
      // ACT
      const found = await shellViolations(BRANCHING_HOOK_FIXTURE, listedHook);
      // ASSERT
      expect(found).toEqual(expected);
    },
    TIMEOUT,
  );

  it(
    'keeps only existing files that still exceed the shell budget in legacy-shells.json',
    async () => {
      // ARRANGE
      const files = readLegacyShellFiles();
      const expected: string[] = [];
      // ACT
      const stale = await staleLegacyEntries(files);
      // ASSERT
      expect(stale).toEqual(expected);
    },
    TIMEOUT,
  );
});

describe('failure cases', () => {
  it.each([
    { label: 'a hook in src/*/hooks/**', fixture: BRANCHING_HOOK_FIXTURE, file: HOOK_PROBE, expected: ['complexity'] },
    {
      label: 'a hook in src/explorable-explanations/*/use-*.ts',
      fixture: BRANCHING_HOOK_FIXTURE,
      file: EXPLORABLE_HOOK_PROBE,
      expected: ['complexity'],
    },
    {
      label: 'a *.client.tsx component',
      fixture: BRANCHING_CLIENT_FIXTURE,
      file: CLIENT_PROBE,
      expected: ['complexity'],
    },
    { label: 'a hook nesting past max-depth 1', fixture: DEEP_HOOK_FIXTURE, file: HOOK_PROBE, expected: ['max-depth'] },
  ])(
    'fails $label that exceeds the shell budget',
    async ({ fixture, file, expected }) => {
      // ARRANGE
      const target = file;
      // ACT
      const found = await shellViolations(fixture, target);
      // ASSERT
      expect(found).toEqual(expected);
    },
    TIMEOUT,
  );

  it(
    'fails a listed offender that exceeds the old global complexity budget',
    async () => {
      // ARRANGE
      const [listedHook] = readLegacyShellFiles();
      const expected = ['complexity'];
      // ACT
      const found = await shellViolations(OVER_GLOBAL_BUDGET_FIXTURE, listedHook);
      // ASSERT
      expect(found).toEqual(expected);
    },
    TIMEOUT,
  );
});

describe('edge cases', () => {
  it(
    'lets a *.pure.ts sibling inside a hooks folder use the global complexity budget',
    async () => {
      // ARRANGE
      const expected: string[] = [];
      // ACT
      const found = await shellViolations(BRANCHING_HOOK_FIXTURE, PURE_IN_HOOKS_PROBE);
      // ASSERT
      expect(found).toEqual(expected);
    },
    TIMEOUT,
  );

  it(
    'flags a thin shell under the shell-cap linter so a refactored override entry cannot stay listed',
    async () => {
      // ARRANGE
      const [listedHook] = readLegacyShellFiles();
      const expected: [string[], string[]] = [[], ['complexity']];
      // ACT
      const found = await Promise.all([
        shellViolations(THIN_HOOK_FIXTURE, listedHook, shellCapEslint),
        shellViolations(BRANCHING_HOOK_FIXTURE, listedHook, shellCapEslint),
      ]);
      // ASSERT
      expect(found).toEqual(expected);
    },
    TIMEOUT,
  );
});
