import { pageFolders, slideFolders as walkSlideFolders } from '@/episodes/lib/episode-folders';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/*
 * A Slide is one folder `slides/<slide>/` named after its slug
 * (#51, FE-002), so the folder, the anchor half and the Slide's own Translation
 * files share one name. Each folder's server entry is `slide.tsx`; this reads
 * every one and compares the slug it declares with the folder it sits in. The Slide folders come from the one folder
 * walker, so an Event's copies under `by-event/` and the Slide pool's Slides under `slide-pool/` are read too.
 */

const ROOT = process.cwd();
const ENTRY = 'slide.tsx';

/** Every Slide folder, its owner (a page's id, or `slide-pool`) and its server entry. */
function slideFolders(): { owner: string; slug: string; entry: string }[] {
  return walkSlideFolders(ROOT).map(({ owner, slug, dir }) => ({ owner, slug, entry: path.join(dir, ENTRY) }));
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

interface SlideRecord {
  slug: string;
  notes: { slug: string }[];
  messages: Record<string, { notes?: Record<string, unknown> }>;
}

/** A Slide record an entry module exports: its slug, declared notes and messages per locale. */
function isSlideRecord(value: unknown): value is SlideRecord {
  return typeof value === 'object' && value !== null && 'slug' in value && 'notes' in value && 'messages' in value;
}

describe('success cases', () => {
  it('names every Slide folder after the one Slide slug its server entry declares', async () => {
    // ARRANGE
    const folders = slideFolders();
    const expected = folders.map(({ owner, slug }) => `${owner}/${slug}: ${slug}`);
    // ACT
    const actual = await Promise.all(
      folders.map(async ({ owner, slug, entry }) => `${owner}/${slug}: ${(await declaredSlugs(entry)).join(', ')}`),
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
      .map(({ owner, slug }) => `${owner}/${slug} has no ${ENTRY}`);
    // ASSERT
    expect(missing).toEqual(expected);
  });

  it('keeps under notes.* only the Speaker notes a Slide declares, in every locale (FE-010 §3.1)', async () => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const strays = (await Promise.all(slideFolders().map(async ({ entry }) => (await import(entry)) as object)))
      .flatMap((exported) => Object.values(exported).filter(isSlideRecord))
      .flatMap(({ slug, notes, messages }) => {
        const declared = new Set(notes.map((note) => note.slug));
        return Object.entries(messages).flatMap(([locale, strings]) =>
          Object.keys(strings.notes ?? {})
            .filter((key) => !declared.has(key))
            .map((key) => `${slug} ${locale}: notes.${key} is no declared Speaker note`),
        );
      });
    // ASSERT
    expect(strays).toEqual(expected);
  });

  it('keeps no Episode-level parts/ or client/ folder: Slide code lives only in its Slide folder', () => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const leftovers = pageFolders(ROOT)
      .flatMap(({ folder, dir }) =>
        ['parts', 'client'].map((kind) => ({ shown: path.join(folder, kind), at: path.join(dir, kind) })),
      )
      .filter(({ at }) => existsSync(at))
      .map(({ shown }) => shown);
    // ASSERT
    expect(leftovers).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('finds Slide folders to check, so an empty walk cannot pass', () => {
    // ARRANGE
    const none = 0;
    // ACT
    const walked = slideFolders().length;
    // ASSERT
    expect(walked).toBeGreaterThan(none);
  });
});
