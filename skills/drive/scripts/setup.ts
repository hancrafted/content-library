import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { CATALOG, type DetectedSkill, mergeDetected, type SeedOptions, updateBinding } from './binding.pure.ts';
import { CONFIG_PATH, harnessCapFrom } from './config.pure.ts';
import { run } from './git.ts';
import { driveEntry, fail } from './project.ts';
import {
  addGuardToHook,
  decisionDocGlobs,
  detectEnforcers,
  type EnforcerFacts,
  guardCommand,
  detectPackageManager,
  guardCiLine,
  guardHookLine,
  installCommands,
  parseSetupArgs,
  type ProjectFacts,
  renderEnforcers,
  updateProjectConfig,
} from './setup.pure.ts';
import { LEARNINGS_STUB, PROFILES_STUB, REVIEW_STUB } from './stubs.pure.ts';

export const LOCKFILE = 'skills-lock.json';
const AUTHORED_DIR = 'skills';
const INSTALLED_DIRS = ['.agents/skills', '.claude/skills'];
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

export function detectSkills(root: string): DetectedSkill[] {
  const authored = subfolders(path.join(root, AUTHORED_DIR))
    .filter((name) => existsSync(path.join(root, AUTHORED_DIR, name, 'SKILL.md')))
    .map((name): DetectedSkill => ({ name, origin: 'authored', source: null }));
  const folders = INSTALLED_DIRS.flatMap((dir) => subfolders(path.join(root, dir))).map((name): DetectedSkill => ({
    name,
    origin: 'installed',
    source: null,
  }));
  const firstSightingWins = [authored, lockedSkills(root), folders];
  return mergeDetected(firstSightingWins, SELF);
}

function scriptsOfPackageJson(root: string): Record<string, string> {
  try {
    const manifest = JSON.parse(read(path.join(root, 'package.json')) ?? '{}') as { scripts?: Record<string, string> };
    return manifest.scripts ?? {};
  } catch {
    return {};
  }
}

function enforcerFacts(root: string): EnforcerFacts {
  const scripts = scriptsOfPackageJson(root);
  const hooks = ['.husky', '.githooks'].flatMap((dir) => {
    try {
      return readdirSync(path.join(root, dir), { withFileTypes: true })
        .filter((entry) => entry.isFile())
        .map((entry) => `${dir}/${entry.name}`);
    } catch {
      return [];
    }
  });
  return {
    scripts,
    packageManager: detectPackageManager(readdirSync(root)),
    hooks,
    adrChecker: existsSync(path.join(root, '.archgate', 'adrs')),
  };
}

function hasGlossary(dir: string, depth = 0): boolean {
  if (depth > 4) return false;
  return readdirSync(dir, { withFileTypes: true }).some((entry) => {
    if (entry.isDirectory())
      return (
        !entry.name.startsWith('.') &&
        entry.name !== 'node_modules' &&
        hasGlossary(path.join(dir, entry.name), depth + 1)
      );
    return entry.name.startsWith('GLOSSARY') && entry.name.endsWith('.md');
  });
}

function baseBranch(root: string): string {
  const head = run('git', ['symbolic-ref', '--short', 'refs/remotes/origin/HEAD'], { cwd: root });
  return head.status === 0 ? head.stdout.trim().replace(/^origin\//, '') : 'main';
}

function projectFacts(root: string, entry: string): ProjectFacts {
  const folders = CATALOG.decisionFolders.filter((folder) => isFolder(path.join(root, folder)));
  return {
    baseBranch: baseBranch(root),
    harnessCap: harnessCapFrom(process.env),
    install: installCommands(readdirSync(root)),
    driveEntry: entry,
    decisionDocs: decisionDocGlobs(folders, hasGlossary(root)),
  };
}

export interface SetupResult {
  written: string[];
  notes: string[];
}

export function setup(root: string, options: SeedOptions = {}, scriptsDir: string = import.meta.dirname): SetupResult {
  const written: string[] = [];
  const notes: string[] = [];
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
  const entry = driveEntry(root, scriptsDir);
  const facts = projectFacts(root, entry);
  write(
    `${DRIVE_DIR}/binding.yml`,
    updateBinding(read(path.join(root, DRIVE_DIR, 'binding.yml')), detectSkills(root), options),
  );
  write(CONFIG_PATH, updateProjectConfig(read(path.join(root, CONFIG_PATH)), facts));
  write(`${DRIVE_DIR}/enforcers.yml`, renderEnforcers(detectEnforcers(enforcerFacts(root))));
  const note = wireGuard(root, { entry, baseBranch: facts.baseBranch }, write);
  if (note !== null) notes.push(note);
  createdOnly(`${DRIVE_DIR}/profiles.md`, PROFILES_STUB);
  createdOnly(`${DRIVE_DIR}/learnings.md`, LEARNINGS_STUB);
  createdOnly(`${DRIVE_DIR}/review.md`, REVIEW_STUB);
  return { written, notes };
}

const HOOK = '.husky/pre-commit';

function wireGuard(
  root: string,
  { entry, baseBranch }: { entry: string; baseBranch: string },
  write: (relative: string, text: string) => void,
): string | null {
  const hook = read(path.join(root, HOOK));
  if (hook === null) return guardCiLine(guardCommand(entry, `origin/${baseBranch}`));
  if (path.isAbsolute(entry)) return guardHookLine(HOOK, guardCommand(entry));
  write(HOOK, addGuardToHook(hook, guardCommand(entry)));
  return null;
}

const isFolder = (dir: string): boolean => {
  try {
    return statSync(dir).isDirectory();
  } catch {
    return false;
  }
};

export function runSetup(args: readonly string[]): void {
  const options = parseSetupArgs(args);
  if ('error' in options) fail(options.error);
  const root = path.resolve(run('git', ['rev-parse', '--show-toplevel']).stdout.trim() || process.cwd());
  let result: SetupResult;
  try {
    result = setup(root, options);
  } catch (error) {
    fail((error as Error).message);
  }
  const { written, notes } = result;
  console.log(
    written.length === 0 ? `✔ ${DRIVE_DIR}/ is up to date` : written.map((file) => `✔ wrote ${file}`).join('\n'),
  );
  for (const note of notes) console.log(note);
}
