import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, posix, relative } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

/*
 * `npm run slides:adapt` and `npm run slides:settle` against a throwaway repository laid out as the real one: a pool
 * Slide `default-alive` held by reference in two Episodes, `second` and `third`, and an Episode `first` that does not
 * hold it. The commands run as processes there, so the copy and the edits are real files and the commit is a real
 * one. "Does not change it in the others" is read from the files the other pages are built from.
 */

const ADAPT = join(__dirname, 'slide-adapt.ts');
const SETTLE = join(__dirname, 'slide-settle.ts');
// Run from a git hook, the process inherits GIT_DIR and GIT_INDEX_FILE; drop them so git acts on the fixture only.
const CLEAN_ENV = Object.fromEntries(
  Object.entries(process.env).filter(([key]) => !key.startsWith('GIT_')),
) as NodeJS.ProcessEnv;

const POOL = 'src/components/slide-pool/default-alive';
const INSTANCE = 'src/components/episodes/second/slides/default-alive-for-founders';
const FIRST_SECTION = 'src/components/episodes/first/sections/cashflow.ts';
const SECOND_SECTION = 'src/components/episodes/second/sections/pipeline.ts';
const THIRD_SECTION = 'src/components/episodes/third/sections/funding.ts';

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
  ...slideFolder('src/components/episodes/first/slides/cashflow', 'cashflow', 'cashflow'),
  [FIRST_SECTION]: sectionFile('cashflowSection', [['cashflow', '../slides/cashflow/slide']]),
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

function adapt(...args: string[]) {
  return spawnSync('node', [ADAPT, ...args], { cwd: root, encoding: 'utf8', env: CLEAN_ENV });
}

function settle() {
  return spawnSync('node', [SETTLE], { cwd: root, encoding: 'utf8', env: CLEAN_ENV });
}

function read(file: string): string {
  return readFileSync(join(root, file), 'utf8');
}

function edit(file: string, text: string): void {
  writeFileSync(join(root, file), text);
}

/** Every file under a folder, by its path inside the folder, with its text. */
function filesUnder(folder: string): Record<string, string> {
  const dir = join(root, folder);
  return Object.fromEntries(
    readdirSync(dir, { recursive: true, withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => relative(dir, join(entry.parentPath, entry.name)))
      .sort()
      .map((file) => [file, readFileSync(join(dir, file), 'utf8')]),
  );
}

/** What a Section file puts on the page: its Slides in list order, each as its folder and that folder's files. */
function sectionSlides(file: string): { folder: string; files: Record<string, string> }[] {
  const source = read(file);
  const imports = new Map(
    [...source.matchAll(/import \{ (\w+) \} from ['"]([^'"]+)['"]/g)].map(([, name, spec]) => [name, spec]),
  );
  const list = /Section = \[([^\]]*)\]/.exec(source)?.[1] ?? '';
  return list
    .split(',')
    .map((name) => name.trim())
    .filter((name) => name !== '')
    .map((name) => {
      const spec = imports.get(name) ?? '';
      const target = spec.startsWith('@/') ? `src/${spec.slice(2)}` : posix.join(posix.dirname(file), spec);
      const folder = posix.dirname(target);
      return { folder, files: filesUnder(folder) };
    });
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'slide-adapt-'));
  for (const [file, text] of Object.entries(FIXTURE)) {
    mkdirSync(dirname(join(root, file)), { recursive: true });
    writeFileSync(join(root, file), text);
  }
  git('init', '-q');
  git('add', '.');
  git('-c', 'user.name=test', '-c', 'user.email=test@example.com', 'commit', '-qm', 'fixture');
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe('success cases', () => {
  it('Editing a reused Slide in one Episode does not change it in the others', () => {
    // ARRANGE
    const pool = filesUnder(POOL);
    const third = sectionSlides(THIRD_SECTION);
    const edited = '{ "title": "Default alive, for founders" }\n';
    const expectedFolders = [
      'src/components/episodes/second/slides/pipeline',
      INSTANCE,
      'src/components/episodes/second/slides/closing',
    ];
    // ACT
    const run = adapt('default-alive', '--as', 'default-alive-for-founders', '--into', 'second');
    edit(`${INSTANCE}/i18n/en.json`, edited);
    const second = sectionSlides(SECOND_SECTION);
    // ASSERT
    expect(run.stderr).toBe('');
    expect(filesUnder(POOL)).toEqual(pool);
    expect(sectionSlides(THIRD_SECTION)).toEqual(third);
    expect(second.map(({ folder }) => folder)).toEqual(expectedFolders);
    expect(second[1].files['i18n/en.json']).toBe(edited);
  });

  it('gives the instance its own slug and marks it with the origin and the commit it was copied at', () => {
    // ARRANGE
    const commit = git('rev-parse', 'HEAD').trim();
    const expectedSlug = "slug: 'default-alive-for-founders',";
    const expectedMarker = `copiedFrom: { slug: 'default-alive', commit: '${commit}' },`;
    const expectedExport = 'export const defaultAliveForFounders = slide({';
    // ACT
    adapt('default-alive', '--as', 'default-alive-for-founders', '--into', 'second');
    const entry = read(`${INSTANCE}/slide.tsx`);
    // ASSERT
    expect(entry).toContain(expectedSlug);
    expect(entry).toContain(expectedMarker);
    expect(entry).toContain(expectedExport);
    expect(read(`${INSTANCE}/i18n/de.json`)).toBe(read(`${POOL}/i18n/de.json`));
  });

  it('An untouched instance is replaced by a reference', () => {
    // ARRANGE
    const before = read(SECOND_SECTION);
    adapt('default-alive', '--as', 'default-alive-for-founders', '--into', 'second');
    // ACT
    const run = settle();
    // ASSERT
    expect(run.stderr).toBe('');
    expect(existsSync(join(root, INSTANCE))).toBe(false);
    expect(read(SECOND_SECTION)).toBe(before);
  });

  it('keeps an instance an edit has touched', () => {
    // ARRANGE
    adapt('default-alive', '--as', 'default-alive-for-founders', '--into', 'second');
    edit(`${INSTANCE}/i18n/en.json`, '{ "title": "Default alive, for founders" }\n');
    const section = read(SECOND_SECTION);
    // ACT
    const run = settle();
    // ASSERT
    expect(run.status).toBe(0);
    expect(existsSync(join(root, INSTANCE, 'slide.tsx'))).toBe(true);
    expect(read(SECOND_SECTION)).toBe(section);
  });
});

describe('failure cases', () => {
  it("An instance given its origin's slug is refused", () => {
    // ARRANGE
    const before = git('status', '--porcelain');
    const expectedReason = "the origin's slug";
    // ACT
    const run = adapt('default-alive', '--as', 'default-alive', '--into', 'second');
    // ASSERT
    expect(run.status).toBe(1);
    expect(run.stderr).toContain(expectedReason);
    expect(git('status', '--porcelain')).toBe(before);
  });

  it('refuses a slug another Slide already has, and changes nothing', () => {
    // ARRANGE
    const before = git('status', '--porcelain');
    const expectedReason = 'src/components/episodes/third/slides/funding';
    // ACT
    const run = adapt('default-alive', '--as', 'funding', '--into', 'second');
    // ASSERT
    expect(run.status).toBe(1);
    expect(run.stderr).toContain(expectedReason);
    expect(git('status', '--porcelain')).toBe(before);
  });

  it('refuses a Slide that is not in the pool, pointing at slides:reuse', () => {
    // ARRANGE
    const expectedReason = 'npm run slides:reuse';
    // ACT
    const run = adapt('cashflow', '--as', 'cashflow-for-founders', '--into', 'second');
    // ASSERT
    expect(run.status).toBe(1);
    expect(run.stderr).toContain(expectedReason);
  });

  it('refuses an Episode that does not hold the Slide when no Section is named', () => {
    // ARRANGE
    const expectedReason = '--section';
    // ACT
    const run = adapt('default-alive', '--as', 'default-alive-for-founders', '--into', 'first');
    // ASSERT
    expect(run.status).toBe(1);
    expect(run.stderr).toContain(expectedReason);
  });
});

describe('edge cases', () => {
  it('adds the instance to the end of the named Section when the Episode does not hold the Slide yet', () => {
    // ARRANGE
    const expectedFolders = [
      'src/components/episodes/first/slides/cashflow',
      'src/components/episodes/first/slides/default-alive-for-founders',
    ];
    // ACT
    const run = adapt(
      'default-alive',
      '--as',
      'default-alive-for-founders',
      '--into',
      'first',
      '--section',
      'cashflow',
    );
    // ASSERT
    expect(run.stderr).toBe('');
    expect(sectionSlides(FIRST_SECTION).map(({ folder }) => folder)).toEqual(expectedFolders);
  });
});
