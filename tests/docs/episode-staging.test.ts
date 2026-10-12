import { checkResearchIndex, checkRunsCsv, checkStagingFolder, type Catalog } from '@/lib/episode-staging.pure';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/*
 * The cross-file checks (design-ADR 0004) applied to the real corpus: every
 * staging folder under docs/episodes/, the new-episode skill's sample Episode,
 * the llm-wiki index against its research files, and the runs CSV header.
 * markdown-harness checks each file alone; this test checks them against each
 * other, so a disagreement fails `npm run verify`.
 */

const ROOT = path.join(__dirname, '../..');
const EPISODES = path.join(ROOT, 'docs/episodes');
const SAMPLE = path.join(ROOT, '.agents/skills/new-episode/assets/sample-episode');
const LLM_WIKI = path.join(ROOT, 'docs/llm-wiki');
const RUNS_CSV = path.join(EPISODES, 'runs.csv');

/** Every file under `folder`, keyed by its path relative to it with `/` separators. */
function readFolder(folder: string): Record<string, string> {
  const entries = readdirSync(folder, { recursive: true, withFileTypes: true }).filter((entry) => entry.isFile());
  return Object.fromEntries(
    entries.map((entry) => {
      const file = path.join(entry.parentPath, entry.name);
      return [path.relative(folder, file).split(path.sep).join('/'), readFileSync(file, 'utf8')];
    }),
  );
}

/** The names in `folder` ending in `suffix`, with the suffix cut off. */
function namesEndingIn(folder: string, suffix: string): string[] {
  return readdirSync(folder)
    .filter((name) => name.endsWith(suffix))
    .map((name) => name.slice(0, -suffix.length));
}

/**
 * What a Dossier `Visual` may name: the frame components in the Slide master
 * (`basic-page-slide.tsx` is `basic-page`), the slide-master catalog's Slide
 * folders, and the motion effects in `animations/` (`liquid-ink-transition`).
 */
function catalog(): Catalog {
  const catalogSlides = readdirSync(path.join(ROOT, 'src/components/episodes/slide-master/slides'), {
    withFileTypes: true,
  })
    .filter((entry) => entry.isDirectory())
    .map(({ name }) => name);
  return {
    masters: [...namesEndingIn(path.join(ROOT, 'src/components/slide-master'), '-slide.tsx'), ...catalogSlides],
    motions: namesEndingIn(path.join(ROOT, 'src/components/animations'), '.client.tsx'),
  };
}

/** The sample Episode and every staging folder, by the path a failure names. */
function stagingFolders(): Record<string, string> {
  const staging = existsSync(EPISODES)
    ? readdirSync(EPISODES, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map(({ name }) => path.join(EPISODES, name))
    : [];
  return Object.fromEntries([SAMPLE, ...staging].map((folder) => [path.relative(ROOT, folder), folder]));
}

/** The llm-wiki research files, keyed by their path relative to the index. */
function llmWikiResearch(): Record<string, string> {
  const research = path.join(LLM_WIKI, 'research');
  if (!existsSync(research)) return {};
  return Object.fromEntries(
    Object.entries(readFolder(research))
      .filter(([file]) => file.endsWith('/research.md'))
      .map(([file, text]) => [`research/${file}`, text]),
  );
}

describe('success cases', () => {
  it('finds no disagreement between the files of any staging folder or the sample Episode', () => {
    // ARRANGE
    const names = catalog();
    const folders = Object.entries(stagingFolders());
    // ACT
    const findings = folders.flatMap(([where, folder]) =>
      checkStagingFolder(readFolder(folder), names).map((finding) => ({
        ...finding,
        file: `${where}/${finding.file}`,
      })),
    );
    // ASSERT
    expect(findings).toEqual([]);
  });

  it('finds the llm-wiki index and its research files in agreement, or no index yet', () => {
    // ARRANGE
    const indexFile = path.join(LLM_WIKI, 'index.md');
    const index = existsSync(indexFile) ? readFileSync(indexFile, 'utf8') : undefined;
    // ACT
    const findings = checkResearchIndex(index, llmWikiResearch());
    // ASSERT
    expect(findings).toEqual([]);
  });

  it('finds the runs CSV header exact', () => {
    // ARRANGE
    const csv = readFileSync(RUNS_CSV, 'utf8');
    // ACT
    const findings = checkRunsCsv(csv);
    // ASSERT
    expect(findings).toEqual([]);
  });
});

describe('failure cases', () => {
  it('rejects a Visual master that is neither a frame component nor a catalog Slide in the real catalog', () => {
    // ARRANGE
    const sample = readFolder(SAMPLE);
    const dossier = sample['dossier.md'].replace('master: three-column', 'master: four-column');
    const expectedKinds = ['visual'];
    // ACT
    const findings = checkStagingFolder({ ...sample, 'dossier.md': dossier }, catalog());
    // ASSERT
    expect(findings.map(({ kind }) => kind)).toEqual(expectedKinds);
  });
});

describe('edge cases', () => {
  it('walks the sample Episode and reads a frame component, a catalog Slide and a motion effect', () => {
    // ARRANGE
    const sample = path.relative(ROOT, SAMPLE);
    const expected = { masters: ['basic-page', 'grid-2x2'], motions: ['liquid-ink-transition'] };
    // ACT
    const walked = Object.keys(stagingFolders());
    const names = catalog();
    // ASSERT
    expect(walked).toContain(sample);
    expect(names.masters).toEqual(expect.arrayContaining(expected.masters));
    expect(names.motions).toEqual(expect.arrayContaining(expected.motions));
  });
});
