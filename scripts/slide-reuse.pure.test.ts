import { describe, expect, it } from 'vitest';
import { planReuse, type RepoView } from './slide-reuse.pure.ts';

/** A hand-written repository: its files by path, its folders derived from them. */
function repoOf(files: Readonly<Record<string, string>>): RepoView {
  const paths = Object.keys(files);
  return {
    exists: (path) => paths.some((file) => file === path || file.startsWith(`${path}/`)),
    read: (path) => files[path] ?? '',
    folders: (path) =>
      [
        ...new Set(
          paths.filter((file) => file.startsWith(`${path}/`)).map((file) => file.slice(path.length + 1).split('/')[0]),
        ),
      ]
        .filter((name) => paths.some((file) => file.startsWith(`${path}/${name}/`)))
        .sort(),
    sourceFiles: () => paths.filter((file) => /\.tsx?$/.test(file)),
  };
}

const OWN = 'src/components/episodes/first/slides/default-alive';
const BASE = {
  [`${OWN}/slide.tsx`]:
    "import { part } from './part';\nexport const defaultAlive = slide({ slug: 'default-alive' });\n",
  [`${OWN}/part.tsx`]: 'export const part = 1;\n',
  'src/components/episodes/first/sections/cashflow.ts':
    "import { defaultAlive } from '../slides/default-alive/slide';\nexport const cashflowSection: Section = [defaultAlive];\n",
  'src/components/episodes/second/sections/pipeline.ts':
    "import { pipeline } from '../slides/pipeline/slide';\nexport const pipelineSection: Section = [pipeline];\n",
  'src/components/episodes/second/slides/pipeline/slide.tsx': "export const pipeline = slide({ slug: 'pipeline' });\n",
};
const REQUEST = { slug: 'default-alive', into: 'second', section: 'pipeline' };

describe('success cases', () => {
  it('moves the folder into the pool and re-points the owning Section at it', () => {
    // ARRANGE
    const expectedMove = { from: OWN, to: 'src/components/slide-pool/default-alive' };
    const expectedOwner = {
      path: 'src/components/episodes/first/sections/cashflow.ts',
      text: "import { defaultAlive } from '@/components/slide-pool/default-alive/slide';\nexport const cashflowSection: Section = [defaultAlive];\n",
    };
    // ACT
    const result = planReuse(REQUEST, repoOf(BASE));
    // ASSERT
    expect(result.ok && result.plan.move).toEqual(expectedMove);
    expect(result.ok && result.plan.edits).toContainEqual(expectedOwner);
  });

  it("re-points a test outside the Episode that imports the Slide's files", () => {
    // ARRANGE
    const test = 'tests/slides/default-alive.test.ts';
    const repo = repoOf({
      ...BASE,
      [test]: "import { part } from '@/components/episodes/first/slides/default-alive/part';\n",
    });
    const expected = { path: test, text: "import { part } from '@/components/slide-pool/default-alive/part';\n" };
    // ACT
    const result = planReuse(REQUEST, repo);
    // ASSERT
    expect(result.ok && result.plan.edits).toContainEqual(expected);
  });
});

describe('failure cases', () => {
  it('refuses a name that is no kebab-case slug, such as a Section test file', () => {
    // ARRANGE
    const expected = {
      ok: false,
      reasons: ['"pipeline.test" is no slug: slide, Episode and Section are named in kebab-case.'],
    };
    // ACT
    const result = planReuse({ ...REQUEST, section: 'pipeline.test' }, repoOf(BASE));
    // ASSERT
    expect(result).toEqual(expected);
  });

  it('refuses a slug no Slide folder carries', () => {
    // ARRANGE
    const expected = {
      ok: false,
      reasons: ['No Slide folder is named "nowhere", in any Episode\'s slides/ or in the Slide pool.'],
    };
    // ACT
    const result = planReuse({ ...REQUEST, slug: 'nowhere' }, repoOf(BASE));
    // ASSERT
    expect(result).toEqual(expected);
  });

  it('refuses a slug two Episodes both carry, since Slide slugs are unique everywhere', () => {
    // ARRANGE
    const twin = 'src/components/episodes/third/slides/default-alive/slide.tsx';
    const repo = repoOf({ ...BASE, [twin]: "export const defaultAlive = slide({ slug: 'default-alive' });\n" });
    const expectedReason = 'Slide slugs are unique across every Episode and the pool';
    // ACT
    const result = planReuse(REQUEST, repo);
    // ASSERT
    expect(result.ok ? [] : result.reasons.join()).toContain(expectedReason);
  });
});

describe('edge cases', () => {
  it('rewrites a moving file only where it reaches outside its own folder, by the alias', () => {
    // ARRANGE
    const entry = `${OWN}/slide.tsx`;
    const repo = repoOf({
      ...BASE,
      [entry]:
        "import { part } from './part';\nimport { x } from '../../../../slide-shared/x';\nexport const defaultAlive = slide({});\n",
    });
    const expected = {
      path: 'src/components/slide-pool/default-alive/slide.tsx',
      text: "import { part } from './part';\nimport { x } from '@/components/slide-shared/x';\nexport const defaultAlive = slide({});\n",
    };
    // ACT
    const result = planReuse(REQUEST, repo);
    // ASSERT
    expect(result.ok && result.plan.edits).toContainEqual(expected);
  });
});
