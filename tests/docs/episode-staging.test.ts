import { readPipeline } from '@/pipeline/lib/episode-pipeline-definition.pure';
import { checkPipeline } from '@/pipeline/lib/episode-pipeline.pure';
import { unsettledBriefSections } from '@/pipeline/lib/episode-staging-brief.pure';
import { checkResearchIndex, checkRunsCsv, checkStagingFolder } from '@/pipeline/lib/episode-staging.pure';
import { checkResearchFolders, researchCategories } from '@/pipeline/lib/research-folder.pure';
import { RUN_CHECKS_TEST } from '@/pipeline/lib/run-checks-file';
import { gateTier, verifiedProblems } from '@/pipeline/lib/staging-file.pure';
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  EPISODES,
  isRunLogOfBranchInFlightThatNoRuleGoverns,
  knownVisuals,
  LLM_WIKI,
  llmWikiResearch,
  PENDING,
  pipelineContext,
  readFolder,
  researchFolderNamesAcrossRuns,
  ROOT,
  rubricsWithoutHeading,
  RUNS_CSV,
  SAMPLE,
  subfolders,
  TEMPLATE,
  TEMPLATE_STAGING,
} from './episode-staging.fixture.ts';

// decision: docs/decision-records/0004-episode-content-is-staged-then-promoted.md
const TEMPLATE_YAML = readFileSync(TEMPLATE, 'utf8');

it('reads the history in full, so the Voice script check never passes on a shallow clone', () => {
  // ARRANGE
  const expected = 'false';
  // ACT
  const shallow = execFileSync('git', ['rev-parse', '--is-shallow-repository'], { cwd: ROOT, encoding: 'utf8' });
  // ASSERT
  expect(shallow.trim(), 'the checkout is shallow: fetch with depth 0').toBe(expected);
});

describe('success cases', () => {
  it('finds no disagreement between the files of the sample Episode', () => {
    // ARRANGE
    const sample = readFolder(SAMPLE);
    // ACT
    const findings = checkStagingFolder(sample, knownVisuals());
    // ASSERT
    expect(findings).toEqual([]);
  });

  it('shapes every verified entry of the sample Episode as { by, at } with an actor and a datetime', () => {
    // ARRANGE
    const files = Object.entries(readFolder(SAMPLE)).filter(([file]) => file.endsWith('.md'));
    // ACT
    const problems = files.flatMap(([file, text]) => verifiedProblems(text).map((problem) => `${file}: ${problem}`));
    // ASSERT
    expect(files.length).toBeGreaterThan(0);
    expect(problems).toEqual([]);
  });

  it('gives every Run its own checks test, so no staging folder goes unchecked', () => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const unchecked = subfolders(EPISODES)
      .filter((run) => !existsSync(path.join(run, RUN_CHECKS_TEST)))
      .map(
        (run) =>
          `${path.relative(ROOT, run)} has no ${RUN_CHECKS_TEST}: copy skills/new-episode/assets/${RUN_CHECKS_TEST}.txt there`,
      );
    // ASSERT
    expect(unchecked).toEqual(expected);
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
    const findings = checkPipeline(file, yaml, pipelineContext(PENDING, TEMPLATE_STAGING, [yaml]));
    // ASSERT
    expect(findings).toEqual([]);
  });

  it('makes the research plan retrieval writes the foreach source of write-research, and no template job reads a run log', () => {
    // ARRANGE
    const yaml = readFileSync(TEMPLATE, 'utf8');
    const jobs = readPipeline(yaml)?.jobs ?? [];
    const plan = `${TEMPLATE_STAGING}/research-plan.md`;
    // ACT
    const retrievalOutputs = jobs.find(({ id }) => id === 'retrieval')?.outputs;
    const foreach = jobs.find(({ id }) => id === 'write-research')?.foreach;
    // ASSERT
    expect(retrievalOutputs).toEqual([plan]);
    expect(foreach).toBe(`${plan}#research-jobs`);
    expect(yaml).not.toContain('run-log.md');
  });

  it('finds the template well formed as the draft begin-run copies, foreach jobs unexpanded', () => {
    // ARRANGE
    const staging = 'docs/episodes/scaffold-demo';
    const yaml = readFileSync(TEMPLATE, 'utf8')
      .replaceAll('<slug>', 'scaffold-demo')
      .replace('status: draft', 'status: draft\ntemplate: 6426e9c');
    // ACT
    const findings = checkPipeline(`${staging}/pipeline.yml`, yaml, pipelineContext(PENDING, staging, [yaml]));
    // ASSERT
    expect(findings).toEqual([]);
  });

  it('finds the rubric heading every reviewer names in the template', () => {
    // ARRANGE
    const yaml = TEMPLATE_YAML;
    // ACT
    const missing = rubricsWithoutHeading(yaml);
    // ASSERT
    expect(missing).toEqual([]);
  });

  it("keeps no Not settled section in the sample's approved Brief, so the orchestrator never starts on one", () => {
    // ARRANGE
    const brief = readFileSync(path.join(SAMPLE, 'brief.md'), 'utf8');
    const expectedTier = 'approved';
    // ACT
    const unsettled = unsettledBriefSections(brief);
    // ASSERT
    expect(gateTier(brief)).toBe(expectedTier);
    expect(unsettled).toEqual([]);
  });

  it('finds every research folder on disk named by its category, number and question, each ID used once', () => {
    // ARRANGE
    const categories = researchCategories(readFileSync(path.join(ROOT, 'GLOSSARY.md'), 'utf8'));
    // ACT
    const findings = checkResearchFolders(researchFolderNamesAcrossRuns(), categories);
    // ASSERT
    expect(categories.length).toBeGreaterThan(0);
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
  it('checks the template against the real markdown-harness rules, so an ungoverned markdown output fails', () => {
    // ARRANGE
    const yaml = readFileSync(TEMPLATE, 'utf8').replace(
      'outputs: [docs/episodes/<slug>/dossier.md]',
      'outputs: [docs/episodes/<slug>/dosier.md]',
    );
    const expected = [
      'Job "write-dossier" writes "docs/episodes/<slug>/dosier.md", which no markdown-harness rule governs; its implementor would query no intents.',
    ];
    // ACT
    const messages = checkPipeline('pipeline.yml', yaml, pipelineContext(PENDING, TEMPLATE_STAGING, [yaml])).map(
      ({ message }) => message,
    );
    // ASSERT
    expect(messages).toEqual(expect.arrayContaining(expected));
  });

  it('checks the template against the real skills, so a misspelled skill fails', () => {
    // ARRANGE
    const yaml = readFileSync(TEMPLATE, 'utf8').replace(
      'skills: [research, writing-for-agents]',
      'skills: [reserch, writing-for-agents]',
    );
    const expected = ['Job "write-research", agent 1 names the skill "reserch", which does not exist.'];
    // ACT
    const messages = checkPipeline('pipeline.yml', yaml, pipelineContext(PENDING, TEMPLATE_STAGING, [yaml])).map(
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
  it("excuses only a branch in flight's run-log.md that is on disk, never another file or a missing one", () => {
    // ARRANGE
    const paths = ['docs/episodes/no-such-run/run-log.md', 'docs/episodes/runs.csv'];
    const expected = [false, false];
    // ACT
    const excused = paths.map(isRunLogOfBranchInFlightThatNoRuleGoverns);
    // ASSERT
    expect(excused).toEqual(expected);
  });

  it('keeps the pending list to files that are still missing', () => {
    // ARRANGE
    const pending = PENDING;
    // ACT
    const landed = pending.filter((file) => existsSync(path.join(ROOT, file)));
    // ASSERT
    expect(landed).toEqual([]);
  });

  it('reads the sample Episode, a frame component and a slide-master Slide, and the library motions folder', () => {
    // ARRANGE
    const expected = { masters: ['basic-page', 'grid-2x2'], sample: 'brief.md' };
    // ACT
    const walked = readdirSync(SAMPLE);
    const names = knownVisuals();
    // ASSERT
    expect(walked).toContain(expected.sample);
    expect(names.masters).toEqual(expect.arrayContaining(expected.masters));
    expect(names.motions).toEqual([]);
  });
});
