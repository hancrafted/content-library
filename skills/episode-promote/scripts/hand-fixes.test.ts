import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { handFixesOfRun } from './hand-fixes.ts';

// design-ADR 0016 rule 19: Promotion reads the `fix(...)` commits on content paths since the Run's last Gate. Each
// test builds a throwaway repository: a Run's Gate commit, then the commits after it.
const FEEDS_PATHS = ['src/components/episodes/*', 'src/components/slide-pool/*', 'docs/llm-wiki/*'].join('\n');
const STAGING = 'docs/episodes/demo';
const EPISODE = 'demo';
const SKILL_FILE = 'skills/new-episode/references/write-research.md';
const ISSUE = 'https://github.com/hancrafted/content-library/issues/321';
const DATE = '2026-10-20T10:00:00Z';

// Run from a git hook (pre-commit), the process inherits GIT_DIR, GIT_INDEX_FILE and friends, which would point
// every command below at the real repository. A fixture repository sees none of them.
const CLEAN_ENV = Object.fromEntries(
  Object.entries(process.env).filter(([key]) => !key.startsWith('GIT_')),
) as NodeJS.ProcessEnv;
const roots: string[] = [];

function git(cwd: string, ...args: string[]): void {
  execFileSync('git', args, {
    cwd,
    stdio: 'ignore',
    env: { ...CLEAN_ENV, GIT_AUTHOR_DATE: DATE, GIT_COMMITTER_DATE: DATE },
  });
}

/** Writes `file` and commits it with `message`, hooks off: the fixture is the history, not the gate. */
function commit(root: string, file: string, message: string): void {
  mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
  writeFileSync(path.join(root, file), `${message}\n`, { flag: 'a' });
  git(root, 'add', file);
  git(root, '-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-q', '--no-verify', '-m', message);
}

/** A repository whose Run `demo` has passed one Gate, with `feeds-paths` in place. */
function runRepo(): string {
  const root = mkdtempSync(path.join(tmpdir(), 'hand-fixes-'));
  roots.push(root);
  git(root, 'init', '-q');
  commit(root, '.husky/feeds-paths', FEEDS_PATHS);
  commit(root, SKILL_FILE, 'docs(skills): a skill file');
  commit(root, 'src/components/episodes/demo/a.tsx', 'fix(demo): a fix before the Gate\n\nFeeds: none: before');
  commit(
    root,
    `${STAGING}/spec/spec.html`,
    `docs(episodes): approve\n\nSource: ${STAGING}/spec/spec.html | ok\nGate: approved spec`,
  );
  return root;
}

afterAll(() => {
  for (const root of roots) rmSync(root, { recursive: true, force: true });
});

describe('handFixesOfRun', () => {
  describe('success cases', () => {
    it('Promotion lists every hand fix of the Run with where it feeds back', () => {
      // ARRANGE
      const root = runRepo();
      commit(root, 'src/components/episodes/demo/b.tsx', `fix(demo): the cashflow label\n\nFeeds: ${SKILL_FILE}`);
      commit(root, 'src/components/slide-pool/x/c.tsx', `fix(pool): the axis title\n\nFeeds: ${ISSUE}`);
      commit(root, 'docs/llm-wiki/research/r.md', 'fix(wiki): a date\n\nFeeds: none: a one-off typo');
      const expected = [
        { subject: 'fix(demo): the cashflow label', feeds: SKILL_FILE },
        { subject: 'fix(pool): the axis title', feeds: ISSUE },
        { subject: 'fix(wiki): a date', feeds: 'none: a one-off typo' },
      ];
      // ACT
      const fixes = handFixesOfRun(root, STAGING, EPISODE).map(({ subject, feeds }) => ({ subject, feeds }));
      // ASSERT
      expect(fixes).toEqual(expected);
    });

    it('names the content files each hand fix touched', () => {
      // ARRANGE
      const root = runRepo();
      commit(root, 'src/components/episodes/demo/b.tsx', `fix(demo): the label\n\nFeeds: ${SKILL_FILE}`);
      const expected = [['src/components/episodes/demo/b.tsx']];
      // ACT
      const files = handFixesOfRun(root, STAGING, EPISODE).map((fix) => fix.files);
      // ASSERT
      expect(files).toEqual(expected);
    });
  });

  describe('failure cases', () => {
    it('refuses a Staging folder with no Gate commit, so no hand fix goes unlisted', () => {
      // ARRANGE
      const root = runRepo();
      const expected = /no Gate commit names docs\/episodes\/other\//;
      // ACT
      const list = (): unknown => handFixesOfRun(root, 'docs/episodes/other', EPISODE);
      // ASSERT
      expect(list).toThrow(expected);
    });
  });

  describe('edge cases', () => {
    it('leaves out a fix outside content, a change that is no fix, and a fix before the last Gate', () => {
      // ARRANGE
      const root = runRepo();
      commit(root, 'scripts/tool.ts', 'fix(scripts): a tool bug');
      commit(root, 'src/components/episodes/demo/b.tsx', 'feat(demo): a new Slide');
      // ACT
      const fixes = handFixesOfRun(root, STAGING, EPISODE);
      // ASSERT
      expect(fixes).toEqual([]);
    });

    it('leaves out a fix that touched only another Episode, and keeps a shared Slide fixed beside it', () => {
      // ARRANGE
      const root = runRepo();
      commit(root, 'src/components/episodes/other/a.tsx', 'fix(other): their label\n\nFeeds: none: theirs');
      commit(root, 'src/components/slide-pool/x/c.tsx', 'fix(pool): a shared label\n\nFeeds: none: shared');
      const expected = ['fix(pool): a shared label'];
      // ACT
      const subjects = handFixesOfRun(root, STAGING, EPISODE).map(({ subject }) => subject);
      // ASSERT
      expect(subjects).toEqual(expected);
    });

    it('lists a fix whose commit names no Feeds line, which only a skipped gate lets through', () => {
      // ARRANGE
      const root = runRepo();
      commit(root, 'src/components/episodes/demo/b.tsx', 'fix(demo)!: the label');
      const expected = [{ subject: 'fix(demo)!: the label', feeds: null }];
      // ACT
      const fixes = handFixesOfRun(root, STAGING, EPISODE).map(({ subject, feeds }) => ({ subject, feeds }));
      // ASSERT
      expect(fixes).toEqual(expected);
    });
  });
});
