import { checkPipeline, type PipelineContext } from '@/lib/episode-pipeline.pure';
import {
  checkResearchIndex,
  checkRunsCsv,
  checkStagingFolder,
  unsettledBriefSections,
  type KnownVisuals,
} from '@/lib/episode-staging.pure';
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

/*
 * The cross-file checks (design-ADR 0004) applied to the real corpus: every
 * staging folder under docs/episodes/, the new-episode skill's sample Episode,
 * the llm-wiki index against its research files, the runs CSV header, and the
 * pipeline schema of the skill's template and every per-run pipeline.yml.
 * markdown-harness checks each file alone; this test checks them against each
 * other, so a disagreement fails `npm run verify`.
 */

const ROOT = path.join(__dirname, '../..');
const EPISODES = path.join(ROOT, 'docs/episodes');
const SAMPLE = path.join(ROOT, '.agents/skills/new-episode/assets/sample-episode');
const LLM_WIKI = path.join(ROOT, 'docs/llm-wiki');
const RUNS_CSV = path.join(EPISODES, 'runs.csv');
const SKILLS = path.join(ROOT, '.agents/skills');
const SKILL_FOLDER = '.agents/skills/new-episode';
const TEMPLATE = path.join(ROOT, SKILL_FOLDER, 'assets/pipeline.yml');

/*
 * Files the template reads that later tickets create: #86 the llm-wiki index,
 * #88 the human-profile guides. The template alone tolerates them while they
 * are missing; a per-run pipeline never does. Delete an entry when its file
 * lands: a test fails until you do.
 */
const PENDING = [
  'docs/llm-wiki/index.md',
  ...['storytelling', 'tone', 'mental-model'].map((guide) => `docs/profile/han/${guide}-guide.md`),
];

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
 * (`basic-page-slide.tsx` is `basic-page`), the slide master's Slide
 * folders, and the motion effects in `animations/` (`liquid-ink-transition`).
 */
function knownVisuals(): KnownVisuals {
  const masterSlides = readdirSync(path.join(ROOT, 'src/components/episodes/slide-master/slides'), {
    withFileTypes: true,
  })
    .filter((entry) => entry.isDirectory())
    .map(({ name }) => name);
  return {
    masters: [...namesEndingIn(path.join(ROOT, 'src/components/slide-master'), '-slide.tsx'), ...masterSlides],
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

/** A staging folder for the template, whose outputs belong to no Episode yet. */
const TEMPLATE_STAGING = 'docs/episodes/any-episode';

/** `mh query` answers per path, once each: the template and every pipeline share most outputs' rules. */
const governance = new Map<string, boolean>();

/** Whether a markdown-harness rule governs a repo path, by `mh query`, which also resolves a path not written yet. */
function governed(file: string): boolean {
  const known = governance.get(file);
  if (known !== undefined) return known;
  const output = execFileSync(path.join(ROOT, 'node_modules/.bin/mh'), ['query', file], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  const answer = (JSON.parse(output) as { result: { governance: string } }).result.governance === 'governed';
  governance.set(file, answer);
  return answer;
}

/**
 * What a pipeline may name: the skills under `.agents/skills/`, the files in
 * the repo, and the outputs a rule governs inside its staging folder.
 */
function pipelineContext(pending: readonly string[], staging: string): PipelineContext {
  const skills = readdirSync(SKILLS, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map(({ name }) => name);
  const exists = (file: string): boolean => existsSync(path.join(ROOT, file));
  const governs = (output: string): boolean => governed(`${staging}/${output}`);
  return { skillFolder: SKILL_FOLDER, skills, exists, governs, pending };
}

/** Every per-run pipeline, by the path a failure names. */
function perRunPipelines(): Record<string, string> {
  return Object.fromEntries(
    Object.keys(stagingFolders())
      .map((folder) => `${folder}/pipeline.yml`)
      .filter((file) => file.startsWith('docs/') && existsSync(path.join(ROOT, file)))
      .map((file) => [file, readFileSync(path.join(ROOT, file), 'utf8')]),
  );
}

/** A heading's anchor as GitHub renders it: `## Rubric` is `rubric`. */
function anchorOf(heading: string): string {
  return heading
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/ /g, '-');
}

/**
 * Every reviewer `rubric: <file>#<heading>` in a pipeline whose file has no
 * such heading, as `<job>: <rubric>`. The schema check already proves the file
 * exists; this proves the reviewer finds its pass/fail lines in it.
 */
function rubricsWithoutHeading(yaml: string): string[] {
  const { jobs } = parse(yaml) as { jobs: { id: string; agents: { rubric?: string }[] }[] };
  return jobs.flatMap(({ id, agents }) =>
    agents
      .flatMap(({ rubric }) => (rubric === undefined ? [] : [rubric]))
      .filter((rubric) => {
        const [file, anchor] = rubric.split('#');
        const resolved = path.join(ROOT, SKILL_FOLDER, file);
        if (!existsSync(resolved)) return true;
        const anchors = [...readFileSync(resolved, 'utf8').matchAll(/^#{1,6} (.+)$/gm)].map(([, title]) =>
          anchorOf(title),
        );
        return !anchors.includes(anchor);
      })
      .map((rubric) => `${id}: ${rubric}`),
  );
}

describe('success cases', () => {
  it('finds no disagreement between the files of any staging folder or the sample Episode', () => {
    // ARRANGE
    const names = knownVisuals();
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

  it('finds the pipeline template well formed, tolerating only the files later tickets create', () => {
    // ARRANGE
    const file = path.relative(ROOT, TEMPLATE);
    const yaml = readFileSync(TEMPLATE, 'utf8');
    // ACT
    const findings = checkPipeline(file, yaml, pipelineContext(PENDING, TEMPLATE_STAGING));
    // ASSERT
    expect(findings).toEqual([]);
  });

  it('finds every per-run pipeline well formed, with no pending file tolerated', () => {
    // ARRANGE
    const pipelines = Object.entries(perRunPipelines());
    // ACT
    const findings = pipelines.flatMap(([file, yaml]) =>
      checkPipeline(file, yaml, pipelineContext([], path.dirname(file))),
    );
    // ASSERT
    expect(findings).toEqual([]);
  });

  it('finds the rubric heading every reviewer names, in the template and every per-run pipeline', () => {
    // ARRANGE
    const pipelines = [readFileSync(TEMPLATE, 'utf8'), ...Object.values(perRunPipelines())];
    // ACT
    const missing = pipelines.flatMap(rubricsWithoutHeading);
    // ASSERT
    expect(missing).toEqual([]);
  });

  it('finds no approved Brief that keeps a Not settled section, so the orchestrator never starts on one', () => {
    // ARRANGE
    const briefs = Object.entries(stagingFolders())
      .map(([where, folder]) => [`${where}/brief.md`, path.join(folder, 'brief.md')])
      .filter(([, file]) => existsSync(file))
      .map(([where, file]) => [where, readFileSync(file, 'utf8')] as const)
      .filter(([, text]) => /^status: approved$/m.test(text));
    // ACT
    const unsettled = briefs.flatMap(([where, text]) =>
      unsettledBriefSections(text).map((heading) => `${where}: ${heading}`),
    );
    // ASSERT
    expect(briefs.length).toBeGreaterThan(0);
    expect(unsettled).toEqual([]);
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
  it('checks the template against the real markdown-harness rules, so an ungoverned markdown output fails', () => {
    // ARRANGE
    const yaml = readFileSync(TEMPLATE, 'utf8').replace('outputs: [dossier.md]', 'outputs: [dosier.md]');
    const expected = [
      'Job "write-dossier" writes "dosier.md", which no markdown-harness rule governs; its implementor would query no intents.',
    ];
    // ACT
    const messages = checkPipeline('pipeline.yml', yaml, pipelineContext(PENDING, TEMPLATE_STAGING)).map(
      ({ message }) => message,
    );
    // ASSERT
    expect(messages).toEqual(expect.arrayContaining(expected));
  });

  it('checks the template against the real skills, so a misspelled skill fails', () => {
    // ARRANGE
    const yaml = readFileSync(TEMPLATE, 'utf8').replace(
      'skills: [to-spec, to-tickets]',
      'skills: [to-spec, to-ticket]',
    );
    const expected = ['Job "write-spec", agent 1 names the skill "to-ticket", which does not exist.'];
    // ACT
    const messages = checkPipeline('pipeline.yml', yaml, pipelineContext(PENDING, TEMPLATE_STAGING)).map(
      ({ message }) => message,
    );
    // ASSERT
    expect(messages).toEqual(expected);
  });

  it('rejects a Visual master that is neither a frame component nor a slide-master Slide in the repo', () => {
    // ARRANGE
    const sample = readFolder(SAMPLE);
    const dossier = sample['dossier.md'].replace('master: three-column', 'master: four-column');
    const expectedKinds = ['visual'];
    // ACT
    const findings = checkStagingFolder({ ...sample, 'dossier.md': dossier }, knownVisuals());
    // ASSERT
    expect(findings.map(({ kind }) => kind)).toEqual(expectedKinds);
  });
});

describe('edge cases', () => {
  it('keeps the pending list to files that are still missing', () => {
    // ARRANGE
    const pending = PENDING;
    // ACT
    const landed = pending.filter((file) => existsSync(path.join(ROOT, file)));
    // ASSERT
    expect(landed).toEqual([]);
  });

  it('walks the sample Episode and reads a frame component, a slide-master Slide and a motion effect', () => {
    // ARRANGE
    const sample = path.relative(ROOT, SAMPLE);
    const expected = { masters: ['basic-page', 'grid-2x2'], motions: ['liquid-ink-transition'] };
    // ACT
    const walked = Object.keys(stagingFolders());
    const names = knownVisuals();
    // ASSERT
    expect(walked).toContain(sample);
    expect(names.masters).toEqual(expect.arrayContaining(expected.masters));
    expect(names.motions).toEqual(expect.arrayContaining(expected.motions));
  });
});
