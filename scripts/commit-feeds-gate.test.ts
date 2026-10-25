import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';

// design-ADR 0016 rules 17-18: a fix(...) commit that touches content paths carries a `Feeds:` trailer. The gate is
// the `commit` skill's commit-msg script; each test runs it in a throwaway repository with one staged file.
const GATE = path.resolve(__dirname, '../.agents/skills/commit/scripts/commit-msg');
const FEEDS_PATHS = ['src/components/episodes/*', 'src/components/slide-pool/*', 'docs/llm-wiki/*'].join('\n');
const SKILL_FILE = 'skills/new-episode/references/write-research.md';
const ISSUE = 'https://github.com/hancrafted/content-library/issues/321';
const SOURCE = 'Source: docs/specs/0001.md | test';
const BODY = '### Fixed\n\n1. A thing.';

const roots: string[] = [];

// Run from a git hook (pre-commit), the process inherits GIT_DIR, GIT_INDEX_FILE and friends, which would point
// every command below at the real repository. A fixture repository sees none of them.
const CLEAN_ENV = Object.fromEntries(
  Object.entries(process.env).filter(([key]) => !key.startsWith('GIT_')),
) as NodeJS.ProcessEnv;

function git(cwd: string, ...args: string[]): void {
  execFileSync('git', args, { cwd, stdio: 'ignore', env: CLEAN_ENV });
}

/** A repository with `staged` files in the index, the skill file committed and the feeds-paths file in place. */
function repoWith(staged: string[]): string {
  const root = mkdtempSync(path.join(tmpdir(), 'feeds-gate-'));
  roots.push(root);
  git(root, 'init', '-q');
  const write = (file: string, text: string): void => {
    mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    writeFileSync(path.join(root, file), text);
  };
  write(SKILL_FILE, 'x');
  write('.husky/feeds-paths', FEEDS_PATHS);
  for (const file of staged) write(file, 'y');
  git(root, 'add', '.');
  return root;
}

function gate(root: string, header: string, trailers: string[]): { code: number; stderr: string } {
  const message = `${header}\n\n${BODY}\n\n${[SOURCE, ...trailers].join('\n')}\n`;
  const file = path.join(root, 'MSG');
  writeFileSync(file, message);
  const run = spawnSync('sh', [GATE, file], { cwd: root, encoding: 'utf8', env: CLEAN_ENV });
  return { code: run.status ?? -1, stderr: run.stderr };
}

afterAll(() => {
  for (const root of roots) rmSync(root, { recursive: true, force: true });
});

const EPISODE_FILE = 'src/components/episodes/demo/slides/a.tsx';

describe('success cases', () => {
  it('lets a fix to an Episode through with an existing skill file in Feeds', () => {
    // ARRANGE
    const root = repoWith([EPISODE_FILE]);
    // ACT
    const result = gate(root, 'fix(episode): typo', [`Feeds: ${SKILL_FILE}`]);
    // ASSERT
    expect(result.code).toBe(0);
  });

  it('lets an issue URL through', () => {
    // ARRANGE
    const root = repoWith(['src/components/slide-pool/x/a.tsx']);
    // ACT
    const result = gate(root, 'fix(slide): wording', [`Feeds: ${ISSUE}`]);
    // ASSERT
    expect(result.code).toBe(0);
  });

  it('lets none with a reason through', () => {
    // ARRANGE
    const root = repoWith(['docs/llm-wiki/research/a.md']);
    // ACT
    const result = gate(root, 'fix(wiki): one-off typo', ['Feeds: none: a typo no process could catch']);
    // ASSERT
    expect(result.code).toBe(0);
  });

  it('needs no trailer for a non-fix commit on the same paths', () => {
    // ARRANGE
    const root = repoWith([EPISODE_FILE]);
    // ACT
    const result = gate(root, 'feat(episode): add a slide', []);
    // ASSERT
    expect(result.code).toBe(0);
  });
});

describe('failure cases', () => {
  describe('A fix to an Episode or a Slide without a Feeds: line is refused at commit; one that names a skill file that does not exist is refused', () => {
    it('refuses a fix to an Episode without a Feeds: line', () => {
      // ARRANGE
      const root = repoWith([EPISODE_FILE]);
      // ACT
      const result = gate(root, 'fix(episode): typo', []);
      // ASSERT
      expect(result.code).toBe(1);
      expect(result.stderr).toContain('Feeds');
    });

    it('refuses a Feeds: line naming a skill file that does not exist', () => {
      // ARRANGE
      const root = repoWith([EPISODE_FILE]);
      // ACT
      const result = gate(root, 'fix(episode): typo', ['Feeds: skills/new-episode/references/nope.md']);
      // ASSERT
      expect(result.code).toBe(1);
      expect(result.stderr).toContain('does not exist');
    });
  });

  it('refuses none: with no reason', () => {
    // ARRANGE
    const root = repoWith([EPISODE_FILE]);
    // ACT
    const result = gate(root, 'fix(episode): typo', ['Feeds: none:']);
    // ASSERT
    expect(result.code).toBe(1);
  });

  it('refuses a bare issue number', () => {
    // ARRANGE
    const root = repoWith([EPISODE_FILE]);
    // ACT
    const result = gate(root, 'fix(episode): typo', ['Feeds: #321']);
    // ASSERT
    expect(result.code).toBe(1);
  });
});

describe('edge cases', () => {
  it('needs no trailer for a fix that touches no content path', () => {
    // ARRANGE
    const root = repoWith(['scripts/a.ts']);
    // ACT
    const result = gate(root, 'fix(scripts): off by one', []);
    // ASSERT
    expect(result.code).toBe(0);
  });

  it('reads a breaking-marked fix as a fix', () => {
    // ARRANGE
    const root = repoWith([EPISODE_FILE]);
    // ACT
    const result = gate(root, 'fix(episode)!: reorder', []);
    // ASSERT
    expect(result.code).toBe(1);
  });

  it('skips the check in a repository that lists no content paths', () => {
    // ARRANGE
    const root = repoWith([EPISODE_FILE]);
    rmSync(path.join(root, '.husky/feeds-paths'));
    // ACT
    const result = gate(root, 'fix(episode): typo', []);
    // ASSERT
    expect(result.code).toBe(0);
  });

  it('accepts Feeds in the same trailer block as a Co-Authored-By line', () => {
    // ARRANGE
    const root = repoWith([EPISODE_FILE]);
    // ACT
    const result = gate(root, 'fix(episode): typo', [`Feeds: ${SKILL_FILE}`, 'Co-Authored-By: A <a@b.c>']);
    // ASSERT
    expect(result.code).toBe(0);
  });
});
