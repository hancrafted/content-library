import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { verifiedProblems } from '../../.agents/skills/new-episode/scripts/verified.pure';

/*
 * Every `verified` entry in the staging files is a { by, at } mapping (design-ADR 0005), checked on the real
 * corpus. It lives here, not in the skill's pure test, so that test stays deterministic.
 */

describe('the corpus', () => {
  const ROOT = path.join(__dirname, '../..');

  /** The staging files that carry a `verified` entry: the sample Episode and every Episode under docs/episodes. */
  function stagingFiles(): string[] {
    const folders = [path.join(ROOT, '.agents/skills/new-episode/assets/sample-episode')];
    try {
      const episodes = path.join(ROOT, 'docs/episodes');
      folders.push(
        ...readdirSync(episodes, { withFileTypes: true })
          .filter((e) => e.isDirectory())
          .map((e) => path.join(episodes, e.name)),
      );
    } catch {
      // no staging folders yet
    }
    return folders.flatMap((folder) =>
      readdirSync(folder, { recursive: true, withFileTypes: true })
        .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
        .map((entry) => path.join(entry.parentPath, entry.name)),
    );
  }

  it('finds every verified entry shaped as { by, at } with an actor and a datetime', () => {
    // ARRANGE
    const files = stagingFiles();
    // ACT
    const problems = files.flatMap((file) =>
      verifiedProblems(readFileSync(file, 'utf8')).map((p) => `${path.relative(ROOT, file)}: ${p}`),
    );
    // ASSERT
    expect(files.length).toBeGreaterThan(0);
    expect(problems).toEqual([]);
  });
});
