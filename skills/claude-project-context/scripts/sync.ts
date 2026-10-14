// Syncs the context folders in the main checkout: `main/` from main and, on a
// branch, `<branch-slug>/` from that branch's last commit. Without `--apply` it
// only reports; the judgement lives in plan.pure.ts. See ../SKILL.md.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import { diffFolder, expandEntries, parseList, planCopies, proposeCandidates } from './plan.pure.ts';

const LIST = 'skills/claude-project-context/assets/files.md';
// Where the list lived before authored skills moved to skills/; refs older than that move still have it here.
const OLD_LIST = '.agents/skills/claude-project-context/assets/files.md';
const STAMP = '.synced';
const FIRST_LOOKBACK_MS = 7 * 24 * 60 * 60 * 1000;

const git = (args: string[], cwd?: string): string =>
  execFileSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });

/** The main checkout, wherever this runs from: worktrees share its git dir. */
const mainRoot = path.dirname(git(['rev-parse', '--path-format=absolute', '--git-common-dir']).trim());
const contextRoot = path.join(mainRoot, 'docs', 'claude-project-context');
const here = git(['rev-parse', '--show-toplevel']).trim();
const branch = git(['branch', '--show-current']).trim();
// The same slug as the worktree folder; skills/worktree/scripts/worktree.ts deletes the folder under it on `wt:done`.
const slug = (name: string) => name.replaceAll('/', '-');

interface Target {
  ref: string;
  folder: string;
  /** The checkouts whose agent-session edits count towards proposals. */
  checkouts: string[];
}

const targets: Target[] = [{ ref: 'main', folder: path.join(contextRoot, 'main'), checkouts: worktreeRoots() }];
if (branch === '') console.log('! detached HEAD: syncing main/ only');
else if (branch !== 'main')
  targets.push({ ref: branch, folder: path.join(contextRoot, slug(branch)), checkouts: [here] });

/** Every listed file at the ref, read from the ref's own list. */
function listedAt(ref: string, atRef: string[]): string[] {
  const list = atRef.includes(LIST) ? LIST : OLD_LIST;
  const entries = parseList(git(['show', `${ref}:${list}`]));
  return expandEntries(entries, (entry) => atRef.filter((file) => path.matchesGlob(file, entry)));
}

/** The folder's files, by flat name; the stamp and other dotfiles stay out. */
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
  return existsSync(stamp) ? new Date(readFileSync(stamp, 'utf8').trim()) : new Date(Date.now() - FIRST_LOOKBACK_MS);
}

const EDITING_TOOLS = new Set(['Write', 'Edit', 'MultiEdit', 'NotebookEdit']);

/** The files one Claude Code log line edited: its tool calls that write a file. */
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

/** The main checkout and every worktree, longest path first so a worktree wins over the main checkout it sits in. */
function worktreeRoots(): string[] {
  return git(['worktree', 'list', '--porcelain'])
    .split('\n')
    .filter((line) => line.startsWith('worktree '))
    .map((line) => line.slice('worktree '.length))
    .sort((a, b) => b.length - a.length);
}

/**
 * Repo paths that Claude Code sessions edited since `since`, in one of `checkouts`; reads
 * don't count. Logs sit under the directory a session started in, which may be any
 * checkout of this repo, so every log directory of the repo is read.
 */
function sessionPaths(checkouts: string[], since: Date): string[] {
  const projects = path.join(homedir(), '.claude', 'projects');
  const prefix = mainRoot.replaceAll(/[/.]/g, '-');
  const logs = readdirSync(projects)
    .filter((dir) => dir.startsWith(prefix))
    .flatMap((dir) => readdirSync(path.join(projects, dir)).map((name) => path.join(projects, dir, name)))
    .filter((log) => log.endsWith('.jsonl') && statSync(log).mtime >= since);
  const roots = worktreeRoots();
  const owner = (file: string) => roots.find((root) => file.startsWith(root + '/'));
  return logs
    .flatMap((log) => readFileSync(log, 'utf8').split('\n').flatMap(editedIn))
    .filter((file) => checkouts.includes(owner(file) ?? ''))
    .map((file) => path.relative(owner(file) ?? '', file));
}

/** Paths committed since `since`; a branch counts only its own commits, not main's. */
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
  const touched = [...sessionPaths(target.checkouts, since), ...commitPaths(target.ref, since)];
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

/**
 * Flat files beside the folders are the symlinks this skill wrote before it had
 * folders: `--apply` removes them. A folder without its branch (a worktree removed
 * without `wt:done`) is only reported, because deleting it is `wt:done`'s job.
 */
function tidyRoot(apply: boolean): void {
  if (!existsSync(contextRoot)) return;
  const branches = new Set(git(['branch', '--format=%(refname:short)']).split('\n').filter(Boolean).map(slug));
  const entries = readdirSync(contextRoot, { withFileTypes: true });
  for (const entry of entries.filter((e) => e.isDirectory() && !branches.has(e.name)))
    console.log(`! orphaned: docs/claude-project-context/${entry.name}/ has no branch; delete it by hand`);
  const legacy = entries.filter((e) => !e.isDirectory()).map((e) => e.name);
  if (legacy.length === 0) return;
  if (apply) for (const name of legacy) rmSync(path.join(contextRoot, name), { force: true });
  console.log(
    `${apply ? '✔ removed' : 'will remove'} ${legacy.length} legacy flat links in docs/claude-project-context/`,
  );
}

const apply = process.argv.includes('--apply');
for (const target of targets) sync(target, apply);
tidyRoot(apply);
if (!apply) console.log('dry run: rerun with --apply to write the folders');
