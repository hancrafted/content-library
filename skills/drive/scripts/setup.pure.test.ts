import { describe, expect, it } from 'vitest';
import { parseConfig } from './config.pure.ts';
import { decisionDocGlobs, detectEnforcers, installCommands, updateProjectConfig } from './setup.pure.ts';

const FACTS = { baseBranch: 'trunk', install: ['npm ci'], decisionDocs: ['docs/adr/**'] };

describe('detectEnforcers', () => {
  it('lists an ADR checker, scripts by what they run, and hooks, and skips builds and staged-file runners', () => {
    // ARRANGE
    const facts = {
      scripts: {
        build: 'bundle',
        lint: 'oxlint',
        'lint-staged': 'lint-staged',
        typecheck: 'tsc --noEmit',
        test: 'vitest run',
        'test:slow': 'run-slow',
        format: 'oxfmt',
        'check:docs': 'mh check',
        'check:skills': 'run --test-files',
        'test:watch': 'vitest watch',
      },
      hooks: ['.husky/pre-push', '.husky/pre-commit'],
      adrChecker: true,
    };
    // ACT
    const found = detectEnforcers(facts).map(({ kind, name }) => `${kind}:${name}`);
    // ASSERT
    expect(found).toEqual([
      'adr-checker:archgate',
      'check:check:docs',
      'check:check:skills',
      'formatter:format',
      'linter:lint',
      'test-runner:test',
      'test-runner:test:slow',
      'type-checker:typecheck',
      'hook:.husky/pre-commit',
      'hook:.husky/pre-push',
    ]);
  });

  it('finds nothing in an empty repo', () => {
    // ARRANGE / ACT / ASSERT
    expect(detectEnforcers({ scripts: {}, hooks: [], adrChecker: false })).toEqual([]);
  });
});

describe('installCommands and decisionDocGlobs', () => {
  it('names the install for the lockfile present, and the decision docs for the folders present', () => {
    // ARRANGE / ACT / ASSERT
    expect(installCommands(['package-lock.json', 'yarn.lock'])).toEqual(['npm ci']);
    expect(installCommands(['pnpm-lock.yaml'])).toEqual(['pnpm install --frozen-lockfile']);
    expect(installCommands(['README.md'])).toEqual([]);
    expect(decisionDocGlobs(['docs/adr', 'src'], ['GLOSSARY.md'])).toEqual(['docs/adr/**', '**/GLOSSARY*.md']);
    expect(decisionDocGlobs([], [])).toEqual([]);
  });
});

describe('updateProjectConfig', () => {
  it('seeds a missing file with the worktree, the parallel default beside the harness cap, and the decision docs', () => {
    // ARRANGE / ACT
    const text = updateProjectConfig(null, FACTS);
    const config = parseConfig(text);
    // ASSERT
    expect(config).toMatchObject({
      worktree: { baseBranch: 'trunk', install: ['npm ci'] },
      parallel: { default: 3, harnessCap: 20 },
      decisionDocs: ['docs/adr/**'],
    });
    expect(text).toContain('never writes harness settings');
  });

  it('keeps what the file has, comments included, and adds only the sections it lacks', () => {
    // ARRANGE
    const existing = '# mine\nworktree:\n  baseBranch: dev # why\nparallel:\n  default: 5\n';
    // ACT
    const text = updateProjectConfig(existing, FACTS);
    // ASSERT
    expect(text).toContain('# mine');
    expect(text).toContain('baseBranch: dev # why');
    expect(parseConfig(text)).toMatchObject({
      worktree: { baseBranch: 'dev', install: [] },
      parallel: { default: 5 },
      decisionDocs: ['docs/adr/**'],
    });
    expect(updateProjectConfig(text, FACTS)).toBe(text);
  });
});
