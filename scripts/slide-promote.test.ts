import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

/*
 * `npm run slides:promote` against a throwaway repository laid out as the real one: a pool Slide `default-alive` held
 * by reference in two Episodes, `second` and `third`, and adapted in `second` as `default-alive-for-founders` with
 * `npm run slides:adapt`, then edited and committed, as a Run leaves it for the Promotion Gate. The commands run as
 * processes there, so every file read is the file the build reads.
 */

const ADAPT = join(__dirname, 'slide-adapt.ts');
const REUSE = join(__dirname, 'slide-reuse.ts');
const PROMOTE = join(__dirname, 'slide-promote.ts');
// Run from a git hook, the process inherits GIT_DIR and GIT_INDEX_FILE; drop them so git acts on the fixture only.
const CLEAN_ENV = Object.fromEntries(
  Object.entries(process.env).filter(([key]) => !key.startsWith('GIT_')),
) as NodeJS.ProcessEnv;

const POOL = 'src/components/slide-pool/default-alive';
const INSTANCE = 'src/components/episodes/second/slides/default-alive-for-founders';
const SECOND_SECTION = 'src/components/episodes/second/sections/pipeline.ts';
const THIRD_SECTION = 'src/components/episodes/third/sections/funding.ts';
const EDITED = '{ "title": "Default alive, for founders" }\n';

function slideFile(name: string, slug: string): string {
  return [
    "import { slide } from '@/components/slide-master/slide';",
    "import de from './i18n/de.json';",
    "import en from './i18n/en.json';",
    '',
    `export const ${name} = slide({`,
    `  slug: '${slug}',`,
    '  messages: { en, de },',
    "  content: ({ t }) => t('title'),",
    '});',
    '',
  ].join('\n');
}

function slideFolder(folder: string, name: string, slug: string): Record<string, string> {
  return {
    [`${folder}/slide.tsx`]: slideFile(name, slug),
    [`${folder}/i18n/en.json`]: `{ "title": "${slug} in English" }\n`,
    [`${folder}/i18n/de.json`]: `{ "title": "${slug} auf Deutsch" }\n`,
  };
}

function sectionFile(name: string, imports: readonly [string, string][]): string {
  return [
    "import type { Section } from '@/components/slide-master/slide';",
    ...imports.map(([binding, spec]) => `import { ${binding} } from '${spec}';`),
    '',
    `export const ${name}: Section = [${imports.map(([binding]) => binding).join(', ')}];`,
    '',
  ].join('\n');
}

const FIXTURE: Readonly<Record<string, string>> = {
  // The repository's own Prettier settings, minus the plugin a throwaway folder cannot resolve.
  '.prettierrc.json': '{ "singleQuote": true, "trailingComma": "all", "printWidth": 120 }\n',
  ...slideFolder(POOL, 'defaultAlive', 'default-alive'),
  ...slideFolder('src/components/episodes/second/slides/pipeline', 'pipeline', 'pipeline'),
  ...slideFolder('src/components/episodes/second/slides/closing', 'closing', 'closing'),
  [SECOND_SECTION]: sectionFile('pipelineSection', [
    ['pipeline', '../slides/pipeline/slide'],
    ['defaultAlive', '@/components/slide-pool/default-alive/slide'],
    ['closing', '../slides/closing/slide'],
  ]),
  ...slideFolder('src/components/episodes/third/slides/funding', 'funding', 'funding'),
  [THIRD_SECTION]: sectionFile('fundingSection', [
    ['funding', '../slides/funding/slide'],
    ['defaultAlive', '@/components/slide-pool/default-alive/slide'],
  ]),
};

let root = '';

function git(...args: string[]): string {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8', env: CLEAN_ENV });
}

function commit(message: string): void {
  git('add', '-A');
  git('-c', 'user.name=test', '-c', 'user.email=test@example.com', 'commit', '-qm', message);
}

function run(script: string, ...args: string[]) {
  return spawnSync('node', [script, ...args], { cwd: root, encoding: 'utf8', env: CLEAN_ENV });
}

function read(file: string): string {
  return readFileSync(join(root, file), 'utf8');
}

function write(file: string, text: string): void {
  writeFileSync(join(root, file), text);
}

/** A fresh repository holding these files, committed. */
function repository(files: Readonly<Record<string, string>>): void {
  if (root !== '') rmSync(root, { recursive: true, force: true });
  root = mkdtempSync(join(tmpdir(), 'slide-promote-'));
  for (const [file, text] of Object.entries(files)) {
    mkdirSync(dirname(join(root, file)), { recursive: true });
    writeFileSync(join(root, file), text);
  }
  git('init', '-q');
  commit('fixture');
}

beforeEach(() => {
  repository(FIXTURE);
  run(ADAPT, 'default-alive', '--as', 'default-alive-for-founders', '--into', 'second');
  write(`${INSTANCE}/i18n/en.json`, EDITED);
  commit('adapt default-alive for founders');
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
  root = '';
});

describe('success cases', () => {
  it('Promoting an edit as an update changes the shared Slide, lists the Episodes it affects, and no published anchor moves', () => {
    // ARRANGE
    const poolEntry = read(`${POOL}/slide.tsx`);
    const third = read(THIRD_SECTION);
    const expectedSection = [
      "import { pinAnchor, type Section } from '@/components/slide-master/slide';",
      "import { pipeline } from '../slides/pipeline/slide';",
      "import { defaultAlive } from '@/components/slide-pool/default-alive/slide';",
      "import { closing } from '../slides/closing/slide';",
      '',
      "export const pipelineSection: Section = [pipeline, pinAnchor(defaultAlive, 'default-alive-for-founders'), closing];",
      '',
    ].join('\n');
    const expectedEpisodes = 'second, third';
    // ACT
    const promoted = run(PROMOTE, 'default-alive-for-founders', '--update');
    // ASSERT
    expect(promoted.stderr).toBe('');
    expect(read(`${POOL}/i18n/en.json`)).toBe(EDITED);
    expect(read(`${POOL}/slide.tsx`)).toBe(poolEntry);
    expect(existsSync(join(root, INSTANCE))).toBe(false);
    expect(read(SECOND_SECTION)).toBe(expectedSection);
    expect(read(THIRD_SECTION)).toBe(third);
    expect(promoted.stdout).toContain(expectedEpisodes);
  });

  it('Promoting an edit as its own Slide keeps its slug and anchors', () => {
    // ARRANGE
    const section = read(SECOND_SECTION);
    const pool = read(`${POOL}/i18n/en.json`);
    const expectedEntry = slideFile('defaultAliveForFounders', 'default-alive-for-founders');
    // ACT
    const promoted = run(PROMOTE, 'default-alive-for-founders', '--own');
    // ASSERT
    expect(promoted.stderr).toBe('');
    expect(read(`${INSTANCE}/slide.tsx`)).toBe(expectedEntry);
    expect(read(`${INSTANCE}/i18n/en.json`)).toBe(EDITED);
    expect(read(SECOND_SECTION)).toBe(section);
    expect(read(`${POOL}/i18n/en.json`)).toBe(pool);
  });
});

describe('failure cases', () => {
  it('A retired instance slug reused is refused', () => {
    // ARRANGE
    run(PROMOTE, 'default-alive-for-founders', '--update');
    commit('promote default-alive-for-founders as an update');
    const before = git('status', '--porcelain');
    const expectedPin = SECOND_SECTION;
    // ACT
    const reused = run(ADAPT, 'default-alive', '--as', 'default-alive-for-founders', '--into', 'third');
    // ASSERT
    expect(reused.status).toBe(1);
    expect(reused.stderr).toContain(expectedPin);
    expect(git('status', '--porcelain')).toBe(before);
  });

  it('refuses an update while the pool Slide has changed since the copy, naming the change, until Han reconciles it', () => {
    // ARRANGE
    write(`${POOL}/i18n/de.json`, '{ "title": "Default alive, korrigiert" }\n');
    commit('fix the German pool title');
    const before = git('status', '--porcelain');
    const expectedChange = 'fix the German pool title';
    const expectedAdvice = '--reconciled';
    // ACT
    const refused = run(PROMOTE, 'default-alive-for-founders', '--update');
    const unchanged = git('status', '--porcelain');
    const reconciled = run(PROMOTE, 'default-alive-for-founders', '--update', '--reconciled');
    // ASSERT
    expect(refused.status).toBe(1);
    expect(refused.stderr).toContain(expectedChange);
    expect(refused.stderr).toContain(expectedAdvice);
    expect(unchanged).toBe(before);
    expect(reconciled.status).toBe(0);
    expect(read(`${POOL}/i18n/en.json`)).toBe(EDITED);
  });
});

describe('edge cases', () => {
  it('follows the pool Slide back through its move into the pool, which is no change', () => {
    // ARRANGE
    const rest = Object.fromEntries(Object.entries(FIXTURE).filter(([file]) => !file.startsWith(POOL)));
    repository({
      ...rest,
      ...slideFolder('src/components/episodes/third/slides/default-alive', 'defaultAlive', 'default-alive'),
      [THIRD_SECTION]: sectionFile('fundingSection', [
        ['funding', '../slides/funding/slide'],
        ['defaultAlive', '../slides/default-alive/slide'],
      ]),
      [SECOND_SECTION]: sectionFile('pipelineSection', [
        ['pipeline', '../slides/pipeline/slide'],
        ['closing', '../slides/closing/slide'],
      ]),
    });
    run(REUSE, 'default-alive', '--into', 'second', '--section', 'pipeline');
    run(ADAPT, 'default-alive', '--as', 'default-alive-for-founders', '--into', 'second');
    write(`${INSTANCE}/i18n/en.json`, EDITED);
    commit('reuse default-alive, then adapt it for founders');
    // ACT
    const promoted = run(PROMOTE, 'default-alive-for-founders', '--update');
    // ASSERT
    expect(promoted.stderr).toBe('');
    expect(read(`${POOL}/i18n/en.json`)).toBe(EDITED);
  });
});
