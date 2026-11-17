// `drive setup`: detects the project's skills and Enforcers and writes or refreshes `docs/drive/`. Re-running keeps
// every edit the Operator made: the Binding and the config gain only what is new, the stubs are never rewritten.
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { type DetectedSkill, updateBinding } from './binding.pure.ts';
import { CONFIG_PATH } from './config.pure.ts';
import { run } from './git.ts';
import { fail } from './project.ts';
import {
  addGuardToHook,
  decisionDocGlobs,
  DOC_FOLDERS,
  detectEnforcers,
  guardCommand,
  guardWorkflow,
  installCommands,
  LEARNINGS_STUB,
  parseSetupArgs,
  PROFILES_STUB,
  renderEnforcers,
  runsGuard,
  type SetupOptions,
  updateProjectConfig,
} from './setup.pure.ts';

export const LOCKFILE = 'skills-lock.json';
const AUTHORED_DIR = 'skills';
const INSTALLED_DIR = '.agents/skills';
const SELF = 'drive';
const DRIVE_DIR = path.dirname(CONFIG_PATH);

const read = (file: string): string | null => {
  try {
    return readFileSync(file, 'utf8');
  } catch {
    return null;
  }
};

const subfolders = (dir: string): string[] => {
  try {
    return readdirSync(dir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() || entry.isSymbolicLink())
      .map((entry) => entry.name)
      .sort();
  } catch {
    return [];
  }
};

/** The lockfile's skills as installed, or none without a lockfile; throws when it is not JSON. */
function lockedSkills(root: string): DetectedSkill[] {
  const lock = read(path.join(root, LOCKFILE));
  if (lock === null) return [];
  let parsed: { skills?: Record<string, { source?: string }> };
  try {
    parsed = JSON.parse(lock);
  } catch (error) {
    throw new Error(`${LOCKFILE} is not valid JSON: ${(error as Error).message}`, { cause: error });
  }
  return Object.entries(parsed.skills ?? {}).map(([name, value]) => ({
    name,
    origin: 'installed',
    source: value.source ?? null,
  }));
}

/** Skills from the lockfile and the two skill folders; an authored skill is one with a SKILL.md under `skills/`. */
export function detectSkills(root: string): DetectedSkill[] {
  const authored = subfolders(path.join(root, AUTHORED_DIR))
    .filter((name) => existsSync(path.join(root, AUTHORED_DIR, name, 'SKILL.md')))
    .map((name): DetectedSkill => ({ name, origin: 'authored', source: null }));
  const folders = subfolders(path.join(root, INSTALLED_DIR)).map((name): DetectedSkill => ({
    name,
    origin: 'installed',
    source: null,
  }));
  // The first sighting wins: an authored skill, then the lockfile's source, then a bare installed folder.
  const found = new Map<string, DetectedSkill>();
  for (const skill of [...authored, ...lockedSkills(root), ...folders])
    if (skill.name !== SELF && !found.has(skill.name)) found.set(skill.name, skill);
  return [...found.values()].sort((a, b) => a.name.localeCompare(b.name));
}

function enforcerFacts(root: string) {
  let scripts: Record<string, string> = {};
  try {
    scripts =
      (JSON.parse(read(path.join(root, 'package.json')) ?? '{}') as { scripts?: Record<string, string> }).scripts ?? {};
  } catch {
    // An unreadable package.json shows no scripts.
  }
  const hooks = ['.husky', '.githooks'].flatMap((dir) => {
    try {
      return readdirSync(path.join(root, dir), { withFileTypes: true })
        .filter((entry) => entry.isFile())
        .map((entry) => `${dir}/${entry.name}`);
    } catch {
      return [];
    }
  });
  return { scripts, hooks, adrChecker: existsSync(path.join(root, '.archgate', 'adrs')) };
}

/** Glossary files at most four folders deep, skipping dot folders and dependencies. */
function findGlossaries(dir: string, depth = 0): string[] {
  if (depth > 4) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory())
      return entry.name.startsWith('.') || entry.name === 'node_modules'
        ? []
        : findGlossaries(path.join(dir, entry.name), depth + 1);
    return entry.name.startsWith('GLOSSARY') && entry.name.endsWith('.md') ? [entry.name] : [];
  });
}

function baseBranch(root: string): string {
  const head = run('git', ['symbolic-ref', '--short', 'refs/remotes/origin/HEAD'], { cwd: root });
  return head.status === 0 ? head.stdout.trim().replace(/^origin\//, '') : 'main';
}

/** Writes `docs/drive/` under `root`; returns the files it created or changed, relative to `root`. */
export function setup(root: string, options: SetupOptions = {}): string[] {
  const written: string[] = [];
  const write = (relative: string, text: string) => {
    const file = path.join(root, relative);
    if (read(file) === text) return;
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, text);
    written.push(relative);
  };
  const createdOnly = (relative: string, text: string) => {
    if (!existsSync(path.join(root, relative))) write(relative, text);
  };
  const enforcers = detectEnforcers(enforcerFacts(root));
  const folders = DOC_FOLDERS.filter((folder) => isFolder(path.join(root, folder)));
  const facts = {
    baseBranch: baseBranch(root),
    install: installCommands(readdirSync(root)),
    decisionDocs: decisionDocGlobs(folders, findGlossaries(root)),
  };
  write(
    `${DRIVE_DIR}/binding.yml`,
    updateBinding(read(path.join(root, DRIVE_DIR, 'binding.yml')), detectSkills(root), options),
  );
  write(CONFIG_PATH, updateProjectConfig(read(path.join(root, CONFIG_PATH)), facts));
  write(`${DRIVE_DIR}/enforcers.yml`, renderEnforcers(enforcers));
  wireGuard(root, facts, write);
  createdOnly(`${DRIVE_DIR}/profiles.md`, PROFILES_STUB);
  createdOnly(`${DRIVE_DIR}/learnings.md`, LEARNINGS_STUB);
  return written;
}

const HOOK = '.husky/pre-commit';
const WORKFLOW = '.github/workflows/drive-guard.yml';

/**
 * Wires the Decision-doc guard where the project already runs checks: a husky pre-commit hook gets the guard line;
 * without husky, a pull-request workflow runs it when the repo has workflows. Otherwise nothing is written.
 */
function wireGuard(
  root: string,
  facts: { baseBranch: string; install: readonly string[] },
  write: (relative: string, text: string) => void,
): void {
  const entry = path
    .relative(root, path.join(import.meta.dirname, 'drive.ts'))
    .split(path.sep)
    .join('/');
  const hook = read(path.join(root, HOOK));
  if (hook !== null) return write(HOOK, addGuardToHook(hook, guardCommand(entry)));
  if (!isFolder(path.join(root, '.github', 'workflows'))) return;
  const workflow = read(path.join(root, WORKFLOW));
  if (workflow !== null && runsGuard(workflow)) return;
  write(WORKFLOW, guardWorkflow(guardCommand(entry, `origin/${facts.baseBranch}`), facts.install));
}

const isFolder = (dir: string): boolean => {
  try {
    return statSync(dir).isDirectory();
  } catch {
    return false;
  }
};

/** `drive setup [--agent-type <type>] [--model <model>]`: the two flags seed a new Binding only. */
export function runSetup(args: readonly string[]): void {
  const options = parseSetupArgs(args);
  if ('error' in options) fail(options.error);
  const root = path.resolve(run('git', ['rev-parse', '--show-toplevel']).stdout.trim() || process.cwd());
  let written: string[] = [];
  try {
    written = setup(root, options);
  } catch (error) {
    fail((error as Error).message);
  }
  console.log(
    written.length === 0 ? `✔ ${DRIVE_DIR}/ is up to date` : written.map((file) => `✔ wrote ${file}`).join('\n'),
  );
}
