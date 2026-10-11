import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/*
 * A Slide is one folder `slides/<slide>/` named after its slug
 * (#51, FE-002), so the folder, the anchor half and the Slide's own Translation
 * files share one name. Each folder's server entry is `slide.tsx`; this reads
 * every one and compares the slug it declares with the folder it sits in.
 */

const EPISODES_DIR = __dirname;
const ENTRY = 'slide.tsx';

/** Every Slide folder of every Episode: a directory under `<episode>/slides/`. */
function slideFolders(): { episode: string; folder: string; entry: string }[] {
  return readdirSync(EPISODES_DIR, { withFileTypes: true })
    .filter((each) => each.isDirectory())
    .flatMap(({ name: episode }) => {
      const slides = path.join(EPISODES_DIR, episode, 'slides');
      if (!existsSync(slides)) return [];
      return readdirSync(slides, { withFileTypes: true })
        .filter((each) => each.isDirectory())
        .map(({ name: folder }) => ({ episode, folder, entry: path.join(slides, folder, ENTRY) }));
    });
}

/** The slugs the Slides an entry module exports declare: each carries its own messages. */
async function declaredSlugs(entry: string): Promise<string[]> {
  const exported: Record<string, unknown> = await import(entry);
  return Object.values(exported)
    .filter(
      (value): value is { slug: string } =>
        typeof value === 'object' && value !== null && 'slug' in value && 'messages' in value,
    )
    .map(({ slug }) => slug);
}

describe('success cases', () => {
  it('names every Slide folder after the one Slide slug its server entry declares', async () => {
    // ARRANGE
    const folders = slideFolders();
    const expected = folders.map(({ episode, folder }) => `${episode}/${folder}: ${folder}`);
    // ACT
    const actual = await Promise.all(
      folders.map(
        async ({ episode, folder, entry }) => `${episode}/${folder}: ${(await declaredSlugs(entry)).join(', ')}`,
      ),
    );
    // ASSERT
    expect(actual).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('gives every Slide folder a server entry, so no folder holds a Slide under another name', () => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const missing = slideFolders()
      .filter(({ entry }) => !existsSync(entry))
      .map(({ episode, folder }) => `${episode}/slides/${folder} has no ${ENTRY}`);
    // ASSERT
    expect(missing).toEqual(expected);
  });

  it('keeps no Episode-level parts/ or client/ folder: Slide code lives only in its Slide folder', () => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const leftovers = readdirSync(EPISODES_DIR, { withFileTypes: true })
      .filter((each) => each.isDirectory())
      .flatMap(({ name: episode }) => ['parts', 'client'].map((kind) => path.join(episode, kind)))
      .filter((folder) => existsSync(path.join(EPISODES_DIR, folder)));
    // ASSERT
    expect(leftovers).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('finds the page-template Slide folders, so an empty walk cannot pass', () => {
    // ARRANGE
    const expected = ['foundations', 'next-steps', 'what-comes-next', 'why-a-template'];
    // ACT
    const folders = slideFolders()
      .filter(({ episode }) => episode === 'page-template')
      .map(({ folder }) => folder)
      .sort();
    // ASSERT
    expect(folders).toEqual(expected);
  });
});
