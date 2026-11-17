import type { GlobEntries } from '@/shared/lib/folder-check';
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { episodeChecks, slidePoolChecks, type EpisodeChecks } from './episode-checks';

/*
 * The Episode-level checks on a fixture Episode folder built per test: Slide folders under `slides/`, and the server
 * entries handed over as `import.meta.glob` would, a loader per `slide.tsx`. Each check reports findings, never throws,
 * so a broken Episode names what broke.
 */

/** The page glob of a fixture folder, which holds Slide folders but no `episode.ts`. */
const NO_PAGE: GlobEntries = {};

const made: string[] = [];

afterEach(() => {
  for (const dir of made.splice(0)) rmSync(dir, { recursive: true, force: true });
});

/** A fixture page folder holding `folders` (relative paths), as an Episode's own test sees it. */
function fixture(folders: readonly string[]): string {
  const dir = mkdtempSync(path.join(tmpdir(), 'episode-checks-'));
  made.push(dir);
  for (const folder of folders) mkdirSync(path.join(dir, folder), { recursive: true });
  return dir;
}

function slide(slug: string, notes: readonly string[] = [], noteKeys: readonly string[] = notes) {
  const strings = { notes: Object.fromEntries(noteKeys.map((key) => [key, { text: key }])) };
  return { slug, notes: notes.map((note) => ({ slug: note })), messages: { en: strings, de: strings } };
}

function entries(modules: Record<string, object>, prefix = './slides/'): GlobEntries {
  return Object.fromEntries(
    Object.entries(modules).map(([folder, module]) => [`${prefix}${folder}/slide.tsx`, async () => module]),
  );
}

async function findingsOf(checks: EpisodeChecks): Promise<string[]> {
  const all = await Promise.all([...checks.slides, ...checks.folder].map(({ findings }) => findings()));
  return all.flat();
}

describe('success cases', () => {
  it('finds nothing in an Episode whose Slide folders each hold the one Slide they are named after', async () => {
    // ARRANGE
    const dir = fixture(['slides/hero', 'slides/the-spine']);
    const checks = episodeChecks(
      dir,
      entries({ hero: { hero: slide('hero') }, 'the-spine': { theSpine: slide('the-spine', ['source']) } }),
      NO_PAGE,
    );
    const expected: string[] = [];
    // ACT
    const found = await findingsOf(checks);
    // ASSERT
    expect(found).toEqual(expected);
  });

  it('runs one slug check and one Speaker-note check per Slide folder, each named after its folder', () => {
    // ARRANGE
    const dir = fixture(['slides/hero']);
    const expected = [
      'slides/hero names its folder after the one Slide slug its server entry declares',
      'slides/hero keeps under notes.* only the Speaker notes its Slide declares, in every locale (FE-010 §3.1)',
    ];
    // ACT
    const names = episodeChecks(dir, entries({ hero: { hero: slide('hero') } }), NO_PAGE).slides.map(
      ({ name }) => name,
    );
    // ASSERT
    expect(names).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('names a Slide folder whose server entry declares another slug', async () => {
    // ARRANGE
    const dir = fixture(['slides/hero']);
    const expected = ['slides/hero declares [heading], not [hero]'];
    // ACT
    const found = await findingsOf(episodeChecks(dir, entries({ hero: { hero: slide('heading') } }), NO_PAGE));
    // ASSERT
    expect(found).toEqual(expected);
  });

  it('names a Slide folder with no server entry', async () => {
    // ARRANGE
    const dir = fixture(['slides/hero', 'slides/orphan/i18n']);
    const expected = ['slides/orphan has no slide.tsx'];
    // ACT
    const found = await findingsOf(episodeChecks(dir, entries({ hero: { hero: slide('hero') } }), NO_PAGE));
    // ASSERT
    expect(found).toEqual(expected);
  });

  it('names a notes.* key no declared Speaker note owns, per locale', async () => {
    // ARRANGE
    const dir = fixture(['slides/hero']);
    const expected = [
      'hero en: notes.stray is no declared Speaker note',
      'hero de: notes.stray is no declared Speaker note',
    ];
    // ACT
    const found = await findingsOf(
      episodeChecks(dir, entries({ hero: { hero: slide('hero', ['source'], ['source', 'stray']) } }), NO_PAGE),
    );
    // ASSERT
    expect(found).toEqual(expected);
  });

  it('names an Episode-level parts/ or client/ folder, since Slide code lives only in its Slide folder', async () => {
    // ARRANGE
    const dir = fixture(['slides/hero', 'parts', 'client']);
    const expected = ['parts', 'client'];
    // ACT
    const found = await findingsOf(episodeChecks(dir, entries({ hero: { hero: slide('hero') } }), NO_PAGE));
    // ASSERT
    expect(found).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('names a server entry that exports two Slides, so a folder never holds a Slide under another name', async () => {
    // ARRANGE
    const dir = fixture(['slides/hero']);
    const expected = ['slides/hero declares [hero, extra], not [hero]'];
    // ACT
    const found = await findingsOf(
      episodeChecks(dir, entries({ hero: { hero: slide('hero'), extra: slide('extra') } }), NO_PAGE),
    );
    // ASSERT
    expect(found).toEqual(expected);
  });

  it('checks the Slide pool, whose Slide folders sit directly in it, so every folder in it is a Slide folder', async () => {
    // ARRANGE
    const dir = fixture(['one-prompt', 'orphan']);
    const expected = {
      names: [
        'one-prompt names its folder after the one Slide slug its server entry declares',
        'one-prompt keeps under notes.* only the Speaker notes its Slide declares, in every locale (FE-010 §3.1)',
      ],
      found: ['one-prompt declares [another], not [one-prompt]', 'orphan has no slide.tsx'],
    };
    // ACT
    const checks = slidePoolChecks(dir, entries({ 'one-prompt': { onePrompt: slide('another') } }, './'));
    const seen = { names: checks.slides.map(({ name }) => name), found: await findingsOf(checks) };
    // ASSERT
    expect(seen).toEqual(expected);
  });
});
