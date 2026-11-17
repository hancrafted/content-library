import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import { diffFolder, expandEntries, parseList, planCopies, proposeCandidates } from './plan.pure.ts';

const LIST = 'skills/claude-project-context/assets/files.md';
const LIST_BEFORE_SKILLS_MOVED = '.agents/skills/claude-project-context/assets/files.md';
const STAMP = '.synced';
const FIRST_LOOKBACK_MILLISECONDS = 7 * 24 * 60 * 60 * 1000;

const git = (args: string[], cwd?: string): string =>
  execFileSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });

const mainRoot = path.dirname(git(['rev-parse', '--path-format=absolute', '--git-common-dir']).trim());
const contextRoot = path.join(mainRoot, 'docs', 'claude-project-context');
const here = git(['rev-parse', '--show-toplevel']).trim();
const branch = git(['branch', '--show-current']).trim();
const worktreeFolderSlug = (name: string) => name.replaceAll('/', '-');

interface Target {
  ref: string;
  folder: string;
  sessionEditCheckouts: string[];
}

const targets: Target[] = [
  { ref: 'main', folder: path.join(contextRoot, 'main'), sessionEditCheckouts: worktreeRootsLongestFirst() },
];
if (branch === '') console.log('! detached HEAD: syncing main/ only');
else if (branch !== 'main')
  targets.push({
    ref: branch,
    folder: path.join(contextRoot, worktreeFolderSlug(branch)),
    sessionEditCheckouts: [here],
  });

function listedAt(ref: string, atRef: string[]): string[] {
  const list = atRef.includes(LIST) ? LIST : LIST_BEFORE_SKILLS_MOVED;
  const entries = parseList(git(['show', `${ref}:${list}`]));
  return expandEntries(entries, (entry) => atRef.filter((file) => path.matchesGlob(file, entry)));
}

function readFolder(folder: string): Map<string, string> {
  const current = new Map<string, string>();
  if (!existsSync(folder)) return current;
  for (const name of readdirSync(folder)) {
    if (!name.startsWith('.')) current.set(name, readFileSync(path.join(folder, name), 'utf8'));
  }
  return current;
}

function lastSync(folder: string): Date {
  const stamp = path.join(folder, STAMP);
  return existsSync(stamp)
    ? new Date(readFileSync(stamp, 'utf8').trim())
    : new Date(Date.now() - FIRST_LOOKBACK_MILLISECONDS);
}

const EDITING_TOOLS = new Set(['Write', 'Edit', 'MultiEdit', 'NotebookEdit']);

function editedIn(line: string): string[] {
  let entry: { message?: { content?: unknown } };
  try {
    entry = JSON.parse(line);
  } catch {
    return [];
  }
  const content = entry.message?.content;
  if (!Array.isArray(content)) return [];
  return content
    .filter((part) => part?.type === 'tool_use' && EDITING_TOOLS.has(part.name))
    .map((part) => part.input?.file_path ?? part.input?.notebook_path)
    .filter((file): file is string => typeof file === 'string');
}

function worktreeRootsLongestFirst(): string[] {
  return git(['worktree', 'list', '--porcelain'])
    .split('\n')
    .filter((line) => line.startsWith('worktree '))
    .map((line) => line.slice('worktree '.length))
    .sort((a, b) => b.length - a.length);
}

function sessionPaths(sessionEditCheckouts: string[], since: Date): string[] {
  const projects = path.join(homedir(), '.claude', 'projects');
  const logDirectoryPrefixOfEveryCheckout = mainRoot.replaceAll(/[/.]/g, '-');
  const logs = readdirSync(projects)
    .filter((dir) => dir.startsWith(logDirectoryPrefixOfEveryCheckout))
    .flatMap((dir) => readdirSync(path.join(projects, dir)).map((name) => path.join(projects, dir, name)))
    .filter((log) => log.endsWith('.jsonl') && statSync(log).mtime >= since);
  const roots = worktreeRootsLongestFirst();
  const owner = (file: string) => roots.find((root) => file.startsWith(root + '/'));
  return logs
    .flatMap((log) => readFileSync(log, 'utf8').split('\n').flatMap(editedIn))
    .filter((file) => sessionEditCheckouts.includes(owner(file) ?? ''))
    .map((file) => path.relative(owner(file) ?? '', file));
}

function commitPaths(ref: string, since: Date): string[] {
  const range = ref === 'main' ? 'main' : `main..${ref}`;
  return git(['log', `--since=${since.toISOString()}`, '--name-only', '--format=', range])
    .split('\n')
    .filter((line) => line !== '');
}

function sync(target: Target, apply: boolean): void {
  const atRef = git(['ls-tree', '-r', '--name-only', target.ref]).split('\n').filter(Boolean);
  const listed = listedAt(target.ref, atRef);
  const copies = planCopies(listed);
  const planned = new Map(copies.map((copy) => [copy.name, git(['show', `${target.ref}:${copy.source}`])]));
  const diff = diffFolder(planned, readFolder(target.folder));
  const since = lastSync(target.folder);
  const touched = [...sessionPaths(target.sessionEditCheckouts, since), ...commitPaths(target.ref, since)];
  const candidates = proposeCandidates(touched, listed, atRef);

  const relative = path.relative(mainRoot, target.folder);
  const show = (label: string, names: string[]) => names.length > 0 && console.log(`  ${label}: ${names.join(', ')}`);
  console.log(`${relative}/ (${target.ref})`);
  if (diff.changed.length + diff.added.length + diff.removed.length === 0) console.log('  up to date');
  show('changed', diff.changed);
  show('added', diff.added);
  show('removed', diff.removed);
  show(`not in ${LIST}, propose adding`, candidates);

  if (!apply) return;
  rmSync(target.folder, { recursive: true, force: true });
  mkdirSync(target.folder, { recursive: true });
  for (const [name, content] of planned) writeFileSync(path.join(target.folder, name), content);
  writeFileSync(path.join(target.folder, STAMP), `${new Date().toISOString()}\n`);
  console.log(`  ✔ ${planned.size} files written`);
}

function tidyRoot(apply: boolean): void {
  if (!existsSync(contextRoot)) return;
  const branchFolderSlugs = new Set(
    git(['branch', '--format=%(refname:short)']).split('\n').filter(Boolean).map(worktreeFolderSlug),
  );
  const entries = readdirSync(contextRoot, { withFileTypes: true });
  for (const entry of entries.filter((e) => e.isDirectory() && !branchFolderSlugs.has(e.name)))
    console.log(`! orphaned: docs/claude-project-context/${entry.name}/ has no branch; delete it by hand`);
  const legacyFlatLinks = entries.filter((e) => !e.isDirectory()).map((e) => e.name);
  if (legacyFlatLinks.length === 0) return;
  if (apply) for (const name of legacyFlatLinks) rmSync(path.join(contextRoot, name), { force: true });
  console.log(
    `${apply ? '✔ removed' : 'will remove'} ${legacyFlatLinks.length} legacy flat links in docs/claude-project-context/`,
  );
}

const apply = process.argv.includes('--apply');
for (const target of targets) sync(target, apply);
tidyRoot(apply);
if (!apply) console.log('dry run: rerun with --apply to write the folders');
