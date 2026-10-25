import { describe, expect, it } from 'vitest';
import { listSlides, writeListing } from './slide-pool.pure.ts';
import type { RepoView } from './slide-reuse.pure.ts';

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

const EPISODES = 'src/components/episodes';
const POOL = 'src/components/slide-pool';
const REPO = repoOf({
  [`${POOL}/budget-bar/slide.tsx`]:
    "export const budgetBar = slide({ slug: 'budget-bar', defines: 'context-window', notes: [{ sources: [{ slug: 'a', research: 'AIE-0011' }] }] });\n",
  [`${POOL}/budget-bar/i18n/en.json`]: '{ "title": "Every token is spent attention" }\n',
  [`${EPISODES}/first/sections/budget.ts`]:
    "import { budgetBar } from '@/components/slide-pool/budget-bar/slide';\nimport { quietMiddle } from '../slides/quiet-middle/slide';\n",
  [`${EPISODES}/second/sections/habits.ts`]: "import { budgetBar } from '@/components/slide-pool/budget-bar/slide';\n",
  [`${EPISODES}/first/slides/quiet-middle/slide.tsx`]: "export const quietMiddle = slide({ slug: 'quiet-middle' });\n",
  [`${EPISODES}/first/slides/quiet-middle/i18n/en.json`]: '{ "title": "The middle goes quiet" }\n',
  [`${EPISODES}/first/first.ts`]:
    "import { hero } from './slides/hero/slide';\nexport const first = { title: hero };\n",
  [`${EPISODES}/first/slides/hero/slide.tsx`]: "export const hero = slide({ slug: 'hero' });\n",
});

describe('success cases', () => {
  it('lists every page Slide with its title, the Concept it defines, where it lives, who holds it and what it cites', () => {
    // ARRANGE
    const expected = [
      {
        slug: 'quiet-middle',
        title: 'The middle goes quiet',
        defines: undefined,
        owner: 'first',
        heldBy: ['first'],
        cites: [],
      },
      {
        slug: 'budget-bar',
        title: 'Every token is spent attention',
        defines: 'context-window',
        owner: undefined,
        heldBy: ['first', 'second'],
        cites: ['AIE-0011'],
      },
    ];
    // ACT
    const listed = listSlides(REPO);
    // ASSERT
    expect(listed).toEqual(expected);
  });

  it('writes one line per Slide for the slide-retrieval job to read', () => {
    // ARRANGE
    const expected = [
      'quiet-middle · "The middle goes quiet" · in first · held by first · cites none',
      'budget-bar · "Every token is spent attention" · defines context-window · in the Slide pool · held by first, second · cites AIE-0011',
    ].join('\n');
    // ACT
    const text = writeListing(listSlides(REPO));
    // ASSERT
    expect(text).toBe(expected);
  });
});
