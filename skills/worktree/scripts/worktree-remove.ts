// Removing a finished worktree, robust to macOS Finder writing a .DS_Store into it while git deletes it.
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, readlinkSync, rmSync } from 'node:fs';
import path from 'node:path';
import { git } from './git.ts';

/** Files Finder drops into any folder it shows; they hold nothing of the branch. */
const FINDER_METADATA = new Set(['.DS_Store']);

const isListed = (target: string, cwd: string): boolean =>
  git(cwd, ['worktree', 'list', '--porcelain']).stdout.split('\n').includes(`worktree ${target}`);

/** The branch's committed blobs by path, from `git ls-tree`. */
function committedBlobs(branch: string, cwd: string): Map<string, string> {
  const blobs = new Map<string, string>();
  for (const entry of git(cwd, ['ls-tree', '-r', '-z', '--full-tree', branch]).stdout.split('\0')) {
    const match = /^\d+ blob (\w+)\t(.+)$/s.exec(entry);
    if (match) blobs.set(match[2], match[1]);
  }
  return blobs;
}

/** Of these repo-relative paths (folders end in `/`), the ones a .gitignore matches. */
function ignored(paths: string[], cwd: string): Set<string> {
  if (paths.length === 0) return new Set();
  const out = git(cwd, ['check-ignore', '--no-index', '--stdin'], paths.join('\n') + '\n').stdout;
  return new Set(out.split('\n').filter(Boolean));
}

/**
 * The leftover files that hold something the branch does not: anything not Finder metadata,
 * not ignored (node_modules, build output) and not identical to the branch's committed blob.
 */
function unsavedLeftovers(target: string, branch: string, cwd: string): string[] {
  const algorithm = git(cwd, ['rev-parse', '--show-object-format']).stdout.trim();
  const blobId = (content: Buffer) =>
    createHash(algorithm).update(`blob ${content.length}\0`).update(content).digest('hex');
  const blobs = committedBlobs(branch, cwd);
  const unsaved: string[] = [];
  let level = [''];
  while (level.length > 0) {
    const entries = level.flatMap((dir) =>
      readdirSync(path.join(target, dir), { withFileTypes: true })
        .filter((entry) => !FINDER_METADATA.has(entry.name))
        .map((entry) => ({ rel: dir + entry.name + (entry.isDirectory() ? '/' : ''), entry })),
    );
    const skip = ignored(
      entries.map((e) => e.rel),
      cwd,
    );
    const kept = entries.filter((e) => !skip.has(e.rel));
    level = kept.filter((e) => e.entry.isDirectory()).map((e) => e.rel);
    for (const { rel, entry } of kept.filter((e) => !e.entry.isDirectory())) {
      const full = path.join(target, rel);
      const content = entry.isSymbolicLink() ? Buffer.from(readlinkSync(full)) : readFileSync(full);
      if (blobs.get(rel) !== blobId(content)) unsaved.push(rel);
    }
  }
  return unsaved.sort();
}

/**
 * Removes the worktree at `target`. When `git worktree remove` fails after git dropped its record of the
 * worktree (Finder wrote a .DS_Store mid-delete, or an earlier run was cut short that way), the folder is
 * deleted too, provided every file left in it is Finder metadata, ignored or committed on `branch`.
 * Throws, keeping the folder, when git refuses (untracked or modified files) or a leftover holds unsaved work.
 */
export function removeWorktree(target: string, branch: string, cwd: string): 'removed' | 'leftovers-cleared' | 'gone' {
  const remove = git(cwd, ['worktree', 'remove', target]);
  if (remove.status === 0) return 'removed';
  if (isListed(target, cwd)) throw new Error(`git worktree remove refused:\n${remove.stderr.trim()}`);
  if (!existsSync(target)) return 'gone';
  const unsaved = unsavedLeftovers(target, branch, cwd);
  if (unsaved.length > 0)
    throw new Error(
      `${target} is left half-removed and holds files ${branch} does not have; save or delete them, then rerun:\n  ${unsaved.join('\n  ')}`,
    );
  rmSync(target, { recursive: true, force: true });
  return 'leftovers-cleared';
}
