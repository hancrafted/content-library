import { readPipeline } from '@/pipeline/lib/episode-pipeline-definition.pure';
import { checkPipeline } from '@/pipeline/lib/episode-pipeline.pure';
import { checkReferenceJobs } from '@/pipeline/lib/episode-reference-jobs.pure';
import { checkResearchJobs } from '@/pipeline/lib/episode-research-jobs.pure';
import { unsettledBriefSections } from '@/pipeline/lib/episode-staging-brief.pure';
import { checkResearchIndex, checkRunsCsv, checkStagingFolder } from '@/pipeline/lib/episode-staging.pure';
import { checkVoiceScriptDiff } from '@/pipeline/lib/episode-voice-script.pure';
import { checkResearchFolders, researchCategories } from '@/pipeline/lib/research-folder.pure';
import { gateTier } from '@/pipeline/lib/staging-file.pure';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  dossierBeforeAndAfterVoice,
  knownVisuals,
  LLM_WIKI,
  llmWikiResearch,
  PENDING,
  perRunPipelines,
  pipelineContext,
  readFolder,
  researchFolders,
  ROOT,
  rubricsWithoutHeading,
  RUNS_CSV,
  SAMPLE,
  stagingFolders,
  TEMPLATE,
  TEMPLATE_STAGING,
} from './episode-staging.fixture.ts';

/*
 * The cross-file checks (design-ADR 0004) applied to the real corpus: every
 * staging folder under docs/episodes/, the new-episode skill's sample Episode,
 * the llm-wiki index against its research files, the runs CSV header, and the
 * pipeline schema of the skill's template and every per-run pipeline.yml.
 * markdown-harness checks each file alone; this test checks them against each
 * other, so a disagreement fails `npm run verify`. The two checks that walk every
 * staging folder and every per-run pipeline take seconds: they run in the slow
 * lane, episode-staging.slow.test.ts.
 */

it('reads the history in full, so the Voice script check never passes on a shallow clone', () => {
  // ARRANGE
  const expected = 'false';
  // ACT
  const shallow = execFileSync('git', ['rev-parse', '--is-shallow-repository'], { cwd: ROOT, encoding: 'utf8' });
  // ASSERT
  expect(shallow.trim(), 'the checkout is shallow: fetch with depth 0').toBe(expected);
});

describe('success cases', () => {
  it('finds that write-voice-script changed only Voice script lines of what write-dossier committed', () => {
    // ARRANGE
    const pairs = Object.keys(stagingFolders())
      .filter((folder) => folder.startsWith('docs/'))
      .flatMap((folder) => dossierBeforeAndAfterVoice(folder) ?? []);
    // ACT
    const findings = pairs.flatMap(({ draft, voiced }) => checkVoiceScriptDiff(draft, voiced));
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
    const findings = checkPipeline(`${staging}/pipeline.yml`, yaml, pipelineContext(PENDING, staging));
    // ASSERT
    expect(findings).toEqual([]);
  });

  it('finds one write-research job per research job the research plan lists, in every per-run pipeline', () => {
    // ARRANGE
    const pairs = Object.entries(perRunPipelines()).map(([file, yaml]) => {
      // A branch in flight keeps its run-log.md, whose Research jobs list stands in for the plan.
      const source = ['research-plan.md', 'run-log.md']
        .map((name) => path.join(ROOT, path.dirname(file), name))
        .find((candidate) => existsSync(candidate));
      return [file, yaml, source === undefined ? undefined : readFileSync(source, 'utf8')] as const;
    });
    // ACT
    const findings = pairs.flatMap(([file, yaml, plan]) => checkResearchJobs(file, yaml, plan));
    // ASSERT
    expect(findings).toEqual([]);
  });

  it('finds one convert-references output per reference the Brief lists, in every per-run pipeline', () => {
    // ARRANGE
    const pairs = Object.entries(perRunPipelines()).map(
      ([file, yaml]) => [file, yaml, readFileSync(path.join(ROOT, path.dirname(file), 'brief.md'), 'utf8')] as const,
    );
    // ACT
    const findings = pairs.flatMap(([file, yaml, brief]) => checkReferenceJobs(file, yaml, brief));
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
      .filter(([, text]) => gateTier(text) === 'approved');
    // ACT
    const unsettled = briefs.flatMap(([where, text]) =>
      unsettledBriefSections(text).map((heading) => `${where}: ${heading}`),
    );
    // ASSERT
    expect(briefs.length).toBeGreaterThan(0);
    expect(unsettled).toEqual([]);
  });

  it('finds every research folder named by its category, number and question, each ID used once', () => {
    // ARRANGE
    const categories = researchCategories(readFileSync(path.join(ROOT, 'GLOSSARY.md'), 'utf8'));
    // ACT
    const findings = checkResearchFolders(researchFolders(), categories);
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
    const messages = checkPipeline('pipeline.yml', yaml, pipelineContext(PENDING, TEMPLATE_STAGING)).map(
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

  it('walks the sample Episode and reads a frame component and a slide-master Slide, and reads the library motions folder', () => {
    // ARRANGE
    const sample = path.relative(ROOT, SAMPLE);
    const expected = { masters: ['basic-page', 'grid-2x2'] };
    // ACT
    const walked = Object.keys(stagingFolders());
    const names = knownVisuals();
    // ASSERT
    expect(walked).toContain(sample);
    expect(names.masters).toEqual(expect.arrayContaining(expected.masters));
    expect(names.motions).toEqual([]);
  });
});
