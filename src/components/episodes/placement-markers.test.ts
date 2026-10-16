import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { findEpisode } from './registry';

/*
 * Placement markers (skills/new-episode/references/implement-episode-init.md):
 * an Episode built Section by Section in parallel keeps one module per Section,
 * `<ep>/sections/<section-slug>.ts`, exporting that Section's ordered Slide
 * list, section slide first. The record imports them into `sections` in order,
 * so each Section job edits its own module and no two jobs edit one line.
 */

const EPISODES_DIR = __dirname;
const MARKERS_DIR = 'sections';

/** The Episodes built at placement markers, with their Section slugs in Spec order. */
const MARKED = [
  {
    slug: 'never-too-early-sales-run-3',
    sections: [
      'why-watching-cashflow-is-mission-critical',
      'why-sales-is-more-than-just-selling',
      'how-to-start-doing-sales',
      'why-building-an-effective-sales-pipeline-takes-time',
      'start-before-you-need-the-money',
    ],
  },
] as const;

/** The marker module names of an Episode, without the extension; none when it keeps no `sections/` folder. */
function markerNames(episode: string): string[] {
  const folder = path.join(EPISODES_DIR, episode, MARKERS_DIR);
  if (!existsSync(folder)) return [];
  return readdirSync(folder)
    .filter((file) => file.endsWith('.ts') && !file.endsWith('.test.ts'))
    .map((file) => file.slice(0, -'.ts'.length))
    .sort();
}

/** Every value a marker module exports. */
async function markerExports(episode: string, name: string): Promise<unknown[]> {
  const exported: Record<string, unknown> = await import(path.join(EPISODES_DIR, episode, MARKERS_DIR, `${name}.ts`));
  return Object.values(exported);
}

/** Every Episode folder that keeps a `sections/` folder. */
function markedEpisodes(): string[] {
  return readdirSync(EPISODES_DIR, { withFileTypes: true })
    .filter((each) => each.isDirectory() && existsSync(path.join(EPISODES_DIR, each.name, MARKERS_DIR)))
    .map(({ name }) => name)
    .sort();
}

describe('success cases', () => {
  it.each(MARKED)('keeps one marker per Section of $slug, named after it, in Spec order', ({ slug, sections }) => {
    // ARRANGE
    const expectedOrder = [...sections];
    const expectedNames = [...sections].sort();
    // ACT
    const order = findEpisode(slug).sections.map(([opener]) => opener.slug);
    const names = markerNames(slug);
    // ASSERT
    expect(order).toEqual(expectedOrder);
    expect(names).toEqual(expectedNames);
  });

  it.each(MARKED)('composes $slug from its markers: each Section is the list its marker exports', async ({ slug }) => {
    // ARRANGE
    const record = findEpisode(slug).sections;
    const expected = record.map(() => true);
    // ACT
    const fromMarker = await Promise.all(
      record.map(async (section) => (await markerExports(slug, section[0].slug)).includes(section)),
    );
    // ASSERT
    expect(fromMarker).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('keeps no marker module whose name is not a Section of its record', () => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const strays = markedEpisodes().flatMap((episode) => {
      const openers = findEpisode(episode).sections.map(([opener]) => opener.slug);
      return markerNames(episode)
        .filter((name) => !openers.includes(name))
        .map((name) => `${episode}/${MARKERS_DIR}/${name}.ts`);
    });
    // ASSERT
    expect(strays).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('lets every marker module export exactly one Slide list, its section slide first', async () => {
    // ARRANGE
    const markers = markedEpisodes().flatMap((episode) => markerNames(episode).map((name) => ({ episode, name })));
    const expected = markers.map(({ episode, name }) => `${episode}/${name}: ${name}`);
    // ACT
    const actual = await Promise.all(
      markers.map(async ({ episode, name }) => {
        const lists = (await markerExports(episode, name)).filter(Array.isArray) as { slug: string }[][];
        return `${episode}/${name}: ${lists.map(([first]) => first?.slug).join(', ')}`;
      }),
    );
    // ASSERT
    expect(actual).toEqual(expected);
  });
});
