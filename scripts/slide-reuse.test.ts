import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, posix, relative } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { placeSections } from '../src/lib/episode.pure.ts';

/*
 * `npm run slides:reuse` against a throwaway repository: two Episodes, each with its own Slide folders, Sections and
 * published anchors, as the real ones are laid out. The command runs as a process in that repository, so the move is
 * a real `git mv` and the edits are real files. "Looks the same" is read from the files the page is built from: the
 * Section lists the same Slides in the same order, and each Slide's folder holds the same bytes.
 */

const SCRIPT = join(__dirname, 'slide-reuse.ts');
// Run from a git hook, the process inherits GIT_DIR and GIT_INDEX_FILE; drop them so git acts on the fixture only.
const CLEAN_ENV = Object.fromEntries(
  Object.entries(process.env).filter(([key]) => !key.startsWith('GIT_')),
) as NodeJS.ProcessEnv;

function slideFile(name: string, slug: string): string {
  return [
    "import { slide } from '@/components/slide-master/slide';",
    "import de from './i18n/de.json';",
    "import en from './i18n/en.json';",
    '',
    `export const ${name} = slide({ slug: '${slug}', messages: { en, de }, content: ({ t }) => t('title') });`,
    '',
  ].join('\n');
}

function slideFolder(episode: string, name: string, slug: string): Record<string, string> {
  const folder = `src/components/episodes/${episode}/slides/${slug}`;
  return {
    [`${folder}/slide.tsx`]: slideFile(name, slug),
    [`${folder}/i18n/en.json`]: `{ "title": "${slug} in English" }\n`,
    [`${folder}/i18n/de.json`]: `{ "title": "${slug} auf Deutsch" }\n`,
  };
}

/** Two Episodes: `first` owns `default-alive`, `second` and `third` do not hold it yet. */
const FIXTURE: Readonly<Record<string, string>> = {
  ...slideFolder('first', 'hero', 'hero'),
  ...slideFolder('first', 'cashflow', 'cashflow'),
  ...slideFolder('first', 'defaultAlive', 'default-alive'),
  'src/components/episodes/first/first.ts': [
    "import { episode } from '@/components/slide-master/slide';",
    "import { cashflowSection } from './sections/cashflow';",
    "import { hero } from './slides/hero/slide';",
    '',
    "export const first = episode({ slug: 'first', title: hero, sections: [cashflowSection] });",
    '',
  ].join('\n'),
  'src/components/episodes/first/sections/cashflow.ts': [
    "import type { Section } from '@/components/slide-master/slide';",
    "import { cashflow } from '../slides/cashflow/slide';",
    "import { defaultAlive } from '../slides/default-alive/slide';",
    '',
    'export const cashflowSection: Section = [cashflow, defaultAlive];',
    '',
  ].join('\n'),
  'src/components/episodes/first/published-anchors.json': '["cashflow", "cashflow--default-alive"]\n',
  ...slideFolder('second', 'pipeline', 'pipeline'),
  'src/components/episodes/second/sections/pipeline.ts': [
    "import type { Section } from '@/components/slide-master/slide';",
    "import { pipeline } from '../slides/pipeline/slide';",
    '',
    'export const pipelineSection: Section = [pipeline];',
    '',
  ].join('\n'),
  ...slideFolder('third', 'funding', 'funding'),
  'src/components/episodes/third/sections/funding.ts': [
    "import type { Section } from '@/components/slide-master/slide';",
    "import { funding } from '../slides/funding/slide';",
    '',
    'export const fundingSection: Section = [funding];',
    '',
  ].join('\n'),
};

const FIRST_SECTION = 'src/components/episodes/first/sections/cashflow.ts';
const SECOND_SECTION = 'src/components/episodes/second/sections/pipeline.ts';
const THIRD_SECTION = 'src/components/episodes/third/sections/funding.ts';
const FIRST_ANCHORS = 'src/components/episodes/first/published-anchors.json';
const OWN_FOLDER = 'src/components/episodes/first/slides/default-alive';
const POOL_FOLDER = 'src/components/slide-pool/default-alive';

let root = '';

function git(...args: string[]): string {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8', env: CLEAN_ENV });
}

function reuse(...args: string[]) {
  return spawnSync('node', [SCRIPT, ...args], { cwd: root, encoding: 'utf8', env: CLEAN_ENV });
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

/** What a Section file puts on the page: its Slides in list order, each as its slug and its folder's files. */
function sectionSlides(file: string): { slug: string; files: Record<string, string> }[] {
  const source = readFileSync(join(root, file), 'utf8');
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
      return { slug: posix.basename(folder), files: filesUnder(folder) };
    });
}

/** The anchors the walk gives a Section file's Slides, as the Episode page does. */
function anchorsOf(file: string): string[] {
  const [head, ...pages] = sectionSlides(file).map(({ slug }) => ({ slug }));
  return placeSections([[head, ...pages]])
    .flat()
    .map(({ id }) => id)
    .sort();
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'slide-reuse-'));
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
  it("Reusing a Slide in a second Episode moves it into the pool and the first Episode's page looks the same", () => {
    // ARRANGE
    const before = sectionSlides(FIRST_SECTION);
    // ACT
    const run = reuse('default-alive', '--into', 'second', '--section', 'pipeline');
    const after = sectionSlides(FIRST_SECTION);
    // ASSERT
    expect(run.stderr).toBe('');
    expect(existsSync(join(root, OWN_FOLDER))).toBe(false);
    expect(existsSync(join(root, POOL_FOLDER, 'slide.tsx'))).toBe(true);
    expect(after).toEqual(before);
  });

  it('adds the pool Slide to the end of the reusing Section, by reference', () => {
    // ARRANGE
    const expectedSlugs = ['pipeline', 'default-alive'];
    const expectedImport = '@/components/slide-pool/default-alive/slide';
    // ACT
    reuse('default-alive', '--into', 'second', '--section', 'pipeline');
    const slides = sectionSlides(SECOND_SECTION);
    const source = readFileSync(join(root, SECOND_SECTION), 'utf8');
    // ASSERT
    expect(slides.map(({ slug }) => slug)).toEqual(expectedSlugs);
    expect(source).toContain(expectedImport);
    expect(existsSync(join(root, 'src/components/episodes/second/slides/default-alive'))).toBe(false);
  });

  it('keeps the published-anchors snapshot unchanged after a first reuse, and the walk still produces it', () => {
    // ARRANGE
    const snapshot = readFileSync(join(root, FIRST_ANCHORS), 'utf8');
    const expectedAnchors = JSON.parse(snapshot) as string[];
    // ACT
    reuse('default-alive', '--into', 'second', '--section', 'pipeline');
    const after = readFileSync(join(root, FIRST_ANCHORS), 'utf8');
    const produced = anchorsOf(FIRST_SECTION);
    // ASSERT
    expect(after).toBe(snapshot);
    expect(produced).toEqual(expectedAnchors);
  });

  it('records the move with git, so the Slide keeps its history', () => {
    // ARRANGE
    const expectedRename = `R  ${OWN_FOLDER}/slide.tsx -> ${POOL_FOLDER}/slide.tsx`;
    // ACT
    reuse('default-alive', '--into', 'second', '--section', 'pipeline');
    const status = git('status', '--porcelain');
    // ASSERT
    expect(status).toContain(expectedRename);
  });
});

describe('failure cases', () => {
  it('refuses a Title slide and changes nothing', () => {
    // ARRANGE
    const before = git('status', '--porcelain');
    const expectedReason = 'Title slide';
    // ACT
    const run = reuse('hero', '--into', 'second', '--section', 'pipeline');
    const after = git('status', '--porcelain');
    // ASSERT
    expect(run.status).toBe(1);
    expect(run.stderr).toContain(expectedReason);
    expect(after).toBe(before);
  });

  it('refuses a Section the reusing Episode does not have, and changes nothing', () => {
    // ARRANGE
    const before = git('status', '--porcelain');
    const expectedFile = 'src/components/episodes/second/sections/closing.ts';
    // ACT
    const run = reuse('default-alive', '--into', 'second', '--section', 'closing');
    const after = git('status', '--porcelain');
    // ASSERT
    expect(run.status).toBe(1);
    expect(run.stderr).toContain(expectedFile);
    expect(after).toBe(before);
  });

  it('refuses an Episode that already holds the Slide, and changes nothing', () => {
    // ARRANGE
    const before = git('status', '--porcelain');
    const expectedReason = 'already holds';
    // ACT
    const run = reuse('default-alive', '--into', 'first', '--section', 'cashflow');
    const after = git('status', '--porcelain');
    // ASSERT
    expect(run.status).toBe(1);
    expect(run.stderr).toContain(expectedReason);
    expect(after).toBe(before);
  });

  it('prints its usage when an argument is missing', () => {
    // ARRANGE
    const expectedUsage = 'usage: npm run slides:reuse -- <slide-slug> --into <episode> --section <section-slug>';
    // ACT
    const run = reuse('default-alive', '--into', 'second');
    // ASSERT
    expect(run.status).toBe(1);
    expect(run.stderr).toContain(expectedUsage);
  });
});

describe('edge cases', () => {
  it('reuses a Slide already in the pool by adding the reference only', () => {
    // ARRANGE
    reuse('default-alive', '--into', 'second', '--section', 'pipeline');
    const pooled = filesUnder(POOL_FOLDER);
    const firstBefore = readFileSync(join(root, FIRST_SECTION), 'utf8');
    const expectedSlugs = ['funding', 'default-alive'];
    // ACT
    const run = reuse('default-alive', '--into', 'third', '--section', 'funding');
    // ASSERT
    expect(run.status).toBe(0);
    expect(sectionSlides(THIRD_SECTION).map(({ slug }) => slug)).toEqual(expectedSlugs);
    expect(filesUnder(POOL_FOLDER)).toEqual(pooled);
    expect(readFileSync(join(root, FIRST_SECTION), 'utf8')).toBe(firstBefore);
  });
});
