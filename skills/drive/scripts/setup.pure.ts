// What `drive setup` writes besides the Binding: the project config's missing sections, the list of detected
// Enforcers and the two stub documents. Pure: facts in, file text out.
import { Document, type YAMLMap } from 'yaml';
import { CATALOG, type SeedOptions } from './binding.pure.ts';
import { DEFAULTS, PARALLEL_DEFAULTS } from './config.pure.ts';
import { openMapping } from './yaml.pure.ts';

export type EnforcerKind = 'adr-checker' | 'linter' | 'type-checker' | 'test-runner' | 'formatter' | 'check' | 'hook';

/** A deterministic check the project already runs, which Fortify may choose to govern a failure mode. */
export interface Enforcer {
  kind: EnforcerKind;
  name: string;
  command: string;
}

/** What the repo shows about its checks: the package scripts, its hook files and whether an ADR checker is set up. */
export interface EnforcerFacts {
  scripts: Readonly<Record<string, string>>;
  hooks: readonly string[];
  adrChecker: boolean;
}

/** The first kind whose pattern matches; most specific first. A script's name is read before its command. Only tools
 * that check count: a formatter counts in its check mode, never as the rewriter. */
const SCRIPT_KINDS: readonly (readonly [EnforcerKind, RegExp])[] = [
  ['type-checker', /\b(tsc|typecheck|type-check|mypy|pyright)\b/],
  ['formatter', /\b(format|prettier|oxfmt)\b/],
  ['linter', /\b(lint|oxlint|eslint|biome|ruff)\b/],
  ['test-runner', /\b(vitest|jest|pytest|mocha|test)\b/],
  ['check', /^check\b/],
];

/** A script that rewrites files rather than checking them; `--check` or a `:check` name makes it a check again. */
const REWRITERS = /^(?!.*(--check|:check|-check\b))(?=.*\b(format|prettier|oxfmt)\b)/;

/** The kind of one package script, or null when it is no check: a staged-files runner or a watch mode. */
function classifyScript(name: string, body: string): EnforcerKind | null {
  if (name.startsWith('lint-staged') || name.endsWith(':watch') || REWRITERS.test(`${name} ${body}`)) return null;
  const byName = SCRIPT_KINDS.find(([, pattern]) => pattern.test(name));
  return (byName ?? SCRIPT_KINDS.find(([, pattern]) => pattern.test(body)))?.[0] ?? null;
}

/** The Enforcers a repo shows, in a stable order: ADR checker, scripts by name, then hooks. */
export function detectEnforcers({ scripts, hooks, adrChecker }: EnforcerFacts): Enforcer[] {
  const adr: Enforcer[] = adrChecker ? [{ kind: 'adr-checker', name: 'archgate', command: 'archgate check' }] : [];
  const fromScripts = Object.entries(scripts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, body]) => ({ kind: classifyScript(name, body), name, command: `npm run ${name}` }))
    .filter((found): found is Enforcer => found.kind !== null);
  const fromHooks = [...hooks].sort().map((hook): Enforcer => ({ kind: 'hook', name: hook, command: hook }));
  return [...adr, ...fromScripts, ...fromHooks];
}

/** The enforcers file: wholly generated, so every run rewrites it. */
export function renderEnforcers(enforcers: readonly Enforcer[]): string {
  const doc = new Document({ enforcers });
  doc.commentBefore = [
    ' The Enforcers `drive setup` detected, for Fortify to choose from (see the Drive glossary).',
    ' Generated: every run rewrites this file. To change what Fortify may pick, change the repo, then re-run setup.',
  ].join('\n');
  return doc.toString();
}

/** The install command a lockfile in the repo implies, or none. */
export function installCommands(files: readonly string[]): string[] {
  const has = (name: string) => files.includes(name);
  if (has('package-lock.json')) return ['npm ci'];
  if (has('pnpm-lock.yaml')) return ['pnpm install --frozen-lockfile'];
  if (has('yarn.lock')) return ['yarn install --frozen-lockfile'];
  if (has('bun.lock') || has('bun.lockb')) return ['bun install --frozen-lockfile'];
  return [];
}

/** Globs for the Decision docs this repo has: its decision and feature folders, and glossary files anywhere. */
export function decisionDocGlobs(folders: readonly string[], glossaries: readonly string[]): string[] {
  const globs = CATALOG.decisionFolders.filter((folder) => folders.includes(folder)).map((folder) => `${folder}/**`);
  return glossaries.length > 0 ? [...globs, '**/GLOSSARY*.md'] : globs;
}

export interface ProjectFacts {
  baseBranch: string;
  /** The agent harness's own limit on Subagents, recorded beside the project's default. */
  harnessCap: number;
  install: readonly string[];
  decisionDocs: readonly string[];
}

interface Section {
  key: string;
  value: unknown;
  comment: string;
}

/** Adds `key: value` with a comment above it, unless the file already has the key. */
function addSection(doc: Document, root: YAMLMap, { key, value, comment }: Section): void {
  if (root.has(key)) return;
  const name = doc.createNode(key);
  name.commentBefore = comment;
  root.set(name, doc.createNode(value));
}

const PARALLEL_NOTE =
  ' Subagents at once: the lower of `default` and `harnessCap`, the rest queue. `harnessCap` records the agent\n' +
  " harness's own limit beside it; `drive` never writes harness settings.";
const DECISION_DOCS_NOTE = ' Decision docs: paths and globs that change only on a `decisions/*` branch.';

/**
 * The project config after a setup run. A missing file is seeded; an existing one keeps every value and comment and
 * only gains the sections it lacks. Throws a message when the existing text is not a mapping.
 */
export function updateProjectConfig(existing: string | null, facts: ProjectFacts): string {
  const { doc, root } = openMapping(existing, 'project config');
  const { baseBranch, harnessCap, install, decisionDocs } = facts;
  const worktree = { ...DEFAULTS, baseBranch, install };
  const seeded = { dir: worktree.dir, baseBranch, remote: worktree.remote, invoke: worktree.invoke, install };
  if (!root.has('worktree')) root.set('worktree', doc.createNode(seeded));
  addSection(doc, root, { key: 'parallel', value: { ...PARALLEL_DEFAULTS, harnessCap }, comment: PARALLEL_NOTE });
  addSection(doc, root, { key: 'decisionDocs', value: [...decisionDocs], comment: DECISION_DOCS_NOTE });
  return doc.toString();
}

/** The options of `drive setup [--agent-type <type>] [--model <model>]`, or a usage error. */
export function parseSetupArgs(args: readonly string[]): SeedOptions | { error: string } {
  const usage = { error: 'usage: drive setup [--agent-type <type>] [--model <model>]' };
  const options: SeedOptions = {};
  const keys: Record<string, keyof SeedOptions> = { '--agent-type': 'agentType', '--model': 'model' };
  for (let i = 0; i < args.length; i += 2) {
    const key = keys[args[i] ?? ''];
    const value = args[i + 1];
    if (key === undefined || value === undefined || value.startsWith('--')) return usage;
    options[key] = value;
  }
  return options;
}

/** The guard command for a hook or CI step: `drive.ts` is the CLI's entry, relative to the repo root. */
export const guardCommand = (driveEntry: string, against: string | null = null): string =>
  `node ${driveEntry} guard${against === null ? '' : ` --against ${against}`}`;

/** True when a hook text already runs the guard. */
export const runsGuard = (text: string): boolean => /drive\.ts guard\b/.test(text);

/** A commit hook with the guard line added before its other commands; the text itself when it already runs it. */
export function addGuardToHook(hook: string, command: string): string {
  if (runsGuard(hook)) return hook;
  const lines = hook.split('\n');
  const first = lines.findIndex((line) => line.trim() !== '' && !line.trim().startsWith('#'));
  lines.splice(first === -1 ? lines.length : first, 0, command);
  return lines.join('\n').replace(/\n*$/, '\n');
}

/** What setup prints when the repo has no husky hook: the one line for the project's CI to run. */
export const guardCiLine = (command: string): string =>
  `! no .husky/pre-commit: add this line to your CI so Decision docs change only on a decisions/* branch:\n    ${command}`;

export const PROFILES_STUB = `# Drive profiles

Project rules that extend the Profiles the \`/drive\` skill ships: the architect's, which the Orchestrator reasons by,
and the implementer's, which every Subagent brief points at. Write only what is specific to this project.

## Architect

## Implementer
`;

export const LEARNINGS_STUB = `# Drive learnings

One entry per Operator correction, logged at once, and per Fortify option that was not picked, with a recurrence
count. Fortify reads this file for past proposals.
`;
