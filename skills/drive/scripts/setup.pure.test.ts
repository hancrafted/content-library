import { describe, expect, it } from 'vitest';
import { parseConfig } from './config.pure.ts';
import {
  decisionDocGlobs,
  detectEnforcers,
  detectPackageManager,
  installCommands,
  parseSetupArgs,
  updateProjectConfig,
} from './setup.pure.ts';
import { LEARNINGS_STUB, REVIEW_STUB } from './stubs.pure.ts';

const FACTS = {
  baseBranch: 'trunk',
  harnessCap: 20,
  install: ['npm ci'],
  driveEntry: 'skills/drive/scripts/drive.ts',
  decisionDocs: ['docs/adr/**'],
};

describe('detectEnforcers', () => {
  it('lists an ADR checker, scripts by what they run, and hooks, and skips builds, staged-file runners and rewriting formatters', () => {
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
        'format:check': 'oxfmt --check',
        'check:docs': 'mh check',
        'check:skills': 'run --test-files',
        'test:watch': 'vitest watch',
      },
      packageManager: 'npm' as const,
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
      'formatter:format:check',
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
    expect(detectEnforcers({ scripts: {}, packageManager: 'npm', hooks: [], adrChecker: false })).toEqual([]);
  });
});

describe('installCommands and decisionDocGlobs', () => {
  it('names the install for the lockfile present, and the decision docs for the folders present', () => {
    // ARRANGE / ACT / ASSERT
    expect(installCommands(['package-lock.json', 'yarn.lock'])).toEqual(['npm ci']);
    expect(installCommands(['pnpm-lock.yaml'])).toEqual(['pnpm install --frozen-lockfile']);
    expect(installCommands(['README.md'])).toEqual([]);
    expect(decisionDocGlobs(['docs/adr'], true)).toEqual(['docs/adr/**', '**/GLOSSARY*.md']);
    expect(decisionDocGlobs([], false)).toEqual([]);
  });
});

describe('the package manager', () => {
  it('runs the enforcer scripts with the manager the lockfile implies', () => {
    // ARRANGE
    const scripts = { lint: 'eslint .' };
    const commands = (files: string[]) =>
      detectEnforcers({ scripts, packageManager: detectPackageManager(files), hooks: [], adrChecker: false }).map(
        (found) => found.command,
      );
    // ACT / ASSERT
    expect(commands(['pnpm-lock.yaml'])).toEqual(['pnpm run lint']);
    expect(commands(['yarn.lock'])).toEqual(['yarn run lint']);
    expect(commands(['bun.lockb'])).toEqual(['bun run lint']);
    expect(commands(['package-lock.json'])).toEqual(['npm run lint']);
    expect(commands([])).toEqual(['npm run lint']);
    expect(installCommands(['bun.lock'])).toEqual(['bun install --frozen-lockfile']);
  });
});

describe('REVIEW_STUB', () => {
  it('is an empty template naming each calibration answer a decision page needs', () => {
    // ARRANGE / ACT / ASSERT
    expect(REVIEW_STUB).toContain('# Drive review');
    for (const heading of ['Mode', 'Audience', 'Layout', 'Depth', 'Fidelity', 'Feedback route', 'Review width'])
      expect(REVIEW_STUB).toContain(`## ${heading}`);
  });
});

describe('parseSetupArgs', () => {
  it('reads --agent-type and --tier, and rejects a tier that is not mid or top', () => {
    // ARRANGE / ACT / ASSERT
    expect(parseSetupArgs(['--agent-type', 'team:dev', '--tier', 'top'])).toEqual({
      agentType: 'team:dev',
      tier: 'top',
    });
    expect(parseSetupArgs(['--tier', 'opus'])).toEqual({
      error: 'usage: drive setup [--agent-type <type>] [--tier mid|top]',
    });
  });
});

describe('LEARNINGS_STUB', () => {
  it('carries the header and the two sections of the format in references/fortify.md', () => {
    // ARRANGE / ACT / ASSERT
    expect(LEARNINGS_STUB).toContain('# Drive learnings');
    expect(LEARNINGS_STUB).toContain('"The learnings file"');
    expect(LEARNINGS_STUB.indexOf('## Failure modes')).toBeGreaterThan(0);
    expect(LEARNINGS_STUB.indexOf('## Corrections')).toBeGreaterThan(LEARNINGS_STUB.indexOf('## Failure modes'));
  });
});

describe('updateProjectConfig', () => {
  it('seeds a missing file with the worktree, the parallel default beside the harness cap, and the decision docs', () => {
    // ARRANGE / ACT
    const text = updateProjectConfig(null, FACTS);
    const config = parseConfig(text, FACTS.driveEntry);
    // ASSERT
    expect(config).toMatchObject({
      worktree: { baseBranch: 'trunk', install: ['npm ci'] },
      parallel: { default: 3, harnessCap: 20 },
      decisionDocs: ['docs/adr/**'],
    });
    expect(text).toContain('never writes harness settings');
  });

  it('seeds the models each tier resolves to for the claude provider', () => {
    // ARRANGE / ACT
    const config = parseConfig(updateProjectConfig(null, FACTS), FACTS.driveEntry);
    // ASSERT
    expect(config).toMatchObject({ models: { claude: { mid: 'sonnet', top: 'opus' } } });
  });

  it('seeds an invoke that runs the CLI at its entry', () => {
    // ARRANGE / ACT
    const config = parseConfig(updateProjectConfig(null, FACTS), FACTS.driveEntry);
    // ASSERT
    expect(config).toMatchObject({ worktree: { invoke: 'node skills/drive/scripts/drive.ts worktree' } });
  });

  it('records the harness cap it is given beside the default', () => {
    // ARRANGE / ACT
    const config = parseConfig(updateProjectConfig(null, { ...FACTS, harnessCap: 7 }), FACTS.driveEntry);
    // ASSERT
    expect(config).toMatchObject({ parallel: { default: 3, harnessCap: 7 } });
  });

  it('keeps what the file has, comments included, and adds only the sections it lacks', () => {
    // ARRANGE
    const existing = '# mine\nworktree:\n  baseBranch: dev # why\nparallel:\n  default: 5\n';
    // ACT
    const text = updateProjectConfig(existing, FACTS);
    // ASSERT
    expect(text).toContain('# mine');
    expect(text).toContain('baseBranch: dev # why');
    expect(parseConfig(text, FACTS.driveEntry)).toMatchObject({
      worktree: { baseBranch: 'dev', install: [] },
      parallel: { default: 5 },
      decisionDocs: ['docs/adr/**'],
    });
    expect(updateProjectConfig(text, FACTS)).toBe(text);
  });
});
