import { checkPipeline } from '@/pipeline/lib/episode-pipeline.pure';
import { checkReferenceJobs } from '@/pipeline/lib/episode-reference-jobs.pure';
import { checkResearchJobs } from '@/pipeline/lib/episode-research-jobs.pure';
import { unsettledBriefSections } from '@/pipeline/lib/episode-staging-brief.pure';
import { checkStagingFolder } from '@/pipeline/lib/episode-staging.pure';
import { checkVoiceScriptDiff } from '@/pipeline/lib/episode-voice-script.pure';
import { type Finding } from '@/pipeline/lib/finding.pure';
import { checkResearchFolders, researchCategories } from '@/pipeline/lib/research-folder.pure';
import { gateTier, verifiedProblems } from '@/pipeline/lib/staging-file.pure';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import {
  dossierBeforeAndAfterVoice,
  knownVisuals,
  LLM_WIKI,
  outputsOf,
  pipelineContext,
  readFolder,
  ROOT,
  rubricsWithoutHeading,
  subfolders,
} from './episode-staging.fixture.ts';

/*
 * The Run-level checks (ARCH-003 §4.7): every staging check that holds inside one Run's staging folder,
 * `docs/episodes/<slug>/`, run on that folder alone. Each Run carries a `run-checks.test.ts` (copied from
 * `skills/new-episode/assets/run-checks.test.ts.txt` by begin-run) that hands its folder here and globs its text files
 * into its import graph, so `vitest --changed` runs only the checks of the Run an edit touched, and each test's cost stays one Run. The template's
 * and the sample Episode's checks, and the invariants that span Runs, stay in `episode-staging.test.ts`.
 *
 * A check returns findings and never throws, so a broken Run's test names what broke. Add a new Run-level check here:
 * every Run's test runs it without being edited.
 */

/** One check: the test name it runs under, and its findings, empty when it holds. */
export interface RunCheck {
  readonly name: string;
  readonly findings: () => Promise<readonly string[]>;
}

/** The test file beside every Run, which the checks never read as a staging file. */
export const RUN_CHECKS_TEST = 'run-checks.test.ts';

const shown = (staging: string, findings: readonly Finding[]): string[] =>
  findings.map(({ file, message }) => `${staging}/${file}: ${message}`);

/** The Run's files by their path inside its folder, `/`-separated, its checks test left out. */
function contentsOf(dir: string): Record<string, string> {
  return Object.fromEntries(Object.entries(readFolder(dir)).filter(([file]) => file !== RUN_CHECKS_TEST));
}

/** Every research folder of the llm-wiki and of every Run but this one, as repo paths: folder names only. */
function researchFoldersElsewhere(staging: string): string[] {
  const runs = subfolders(path.join(ROOT, 'docs/episodes'))
    .filter((run) => path.relative(ROOT, run) !== staging)
    .flatMap((run) => subfolders(path.join(run, 'research')));
  const llmWiki = subfolders(path.join(LLM_WIKI, 'research')).flatMap(subfolders);
  return [...runs, ...llmWiki].map((folder) => path.relative(ROOT, folder));
}

/** The research folders this Run holds or its pipeline will write, as repo paths; a promoted one is the wiki's. */
function ownResearchFolders(staging: string, files: Readonly<Record<string, string>>, elsewhere: readonly string[]) {
  const onDisk = [
    ...new Set(
      Object.keys(files)
        .filter((file) => file.startsWith('research/') && file.split('/').length > 2)
        .map((file) => `${staging}/${file.split('/').slice(0, 2).join('/')}`),
    ),
  ];
  const yaml = files['pipeline.yml'];
  const planned = (yaml === undefined ? [] : outputsOf([yaml]))
    // A draft keeps write-research's foreach glob; only a named folder is a planned one.
    .filter((output) => output.endsWith('/research.md') && !output.includes('*'))
    .map((output) => path.dirname(output));
  // A planned folder that Promotion already moved into the llm-wiki, under the same name, is that wiki folder.
  const promoted = new Set(elsewhere.map((folder) => path.basename(folder)));
  return [...onDisk, ...planned.filter((folder) => !promoted.has(path.basename(folder)))];
}

/** One Run's staging folder, repo-relative, and its files by their path inside it. */
interface Run {
  readonly staging: string;
  readonly files: Readonly<Record<string, string>>;
}

const pipelineOf = ({ staging }: Run): string => `${staging}/pipeline.yml`;

function pipelineFindings(run: Run): string[] {
  const yaml = run.files['pipeline.yml'];
  if (yaml === undefined) return [];
  return checkPipeline(pipelineOf(run), yaml, pipelineContext([], run.staging, [yaml])).map(({ message }) => message);
}

function researchJobFindings(run: Run): string[] {
  const yaml = run.files['pipeline.yml'];
  // A branch in flight keeps its run-log.md, whose Research jobs list stands in for the plan.
  const plan = run.files['research-plan.md'] ?? run.files['run-log.md'];
  return yaml === undefined ? [] : shown(run.staging, checkResearchJobs(pipelineOf(run), yaml, plan));
}

function referenceJobFindings(run: Run): string[] {
  const yaml = run.files['pipeline.yml'];
  const brief = run.files['brief.md'] ?? '';
  return yaml === undefined ? [] : shown(run.staging, checkReferenceJobs(pipelineOf(run), yaml, brief));
}

function unsettledBriefFindings({ staging, files }: Run): string[] {
  const brief = files['brief.md'];
  if (brief === undefined || gateTier(brief) !== 'approved') return [];
  return unsettledBriefSections(brief).map((heading) => `${staging}/brief.md: ${heading}`);
}

function researchFolderFindings({ staging, files }: Run): string[] {
  const categories = researchCategories(readFileSync(path.join(ROOT, 'GLOSSARY.md'), 'utf8'));
  const elsewhere = researchFoldersElsewhere(staging);
  const own = ownResearchFolders(staging, files, elsewhere);
  // Every folder elsewhere is checked by its own Run or the template test: report only findings that name this Run's.
  return checkResearchFolders([...own, ...elsewhere], categories)
    .filter(({ message }) => own.some((folder) => message.includes(folder)))
    .map(({ message }) => message);
}

function verifiedFindings({ staging, files }: Run): string[] {
  return Object.entries(files)
    .filter(([file]) => file.endsWith('.md'))
    .flatMap(([file, text]) => verifiedProblems(text).map((problem) => `${staging}/${file}: ${problem}`));
}

function voiceScriptFindings({ staging }: Run): string[] {
  const pair = existsSync(path.join(ROOT, staging)) ? dossierBeforeAndAfterVoice(staging) : undefined;
  return pair === undefined ? [] : shown(staging, checkVoiceScriptDiff(pair.draft, pair.voiced));
}

/** Every Run-level check, by the test name it runs under. */
const CHECKS: readonly (readonly [string, (run: Run) => readonly string[]])[] = [
  [
    'finds no disagreement between the files of this staging folder',
    ({ staging, files }) => shown(staging, checkStagingFolder(files, knownVisuals())),
  ],
  ['finds its per-run pipeline well formed, with no pending file tolerated', pipelineFindings],
  ['finds one write-research job per research job the research plan lists', researchJobFindings],
  ['finds one convert-references output per reference the Brief lists', referenceJobFindings],
  [
    'finds the rubric heading every reviewer names',
    ({ files }) => (files['pipeline.yml'] === undefined ? [] : rubricsWithoutHeading(files['pipeline.yml'])),
  ],
  [
    'keeps no Not settled section in an approved Brief, so the orchestrator never starts on one',
    unsettledBriefFindings,
  ],
  ['names every research folder by its category, number and question, each ID used once', researchFolderFindings],
  ['shapes every verified entry as { by, at } with an actor and a datetime', verifiedFindings],
  [
    'finds that write-voice-script changed only Voice script lines of what write-dossier committed',
    voiceScriptFindings,
  ],
];

/**
 * The checks of the Run whose staging folder is `dir`, read from disk as the staging checks always read it. The Run's
 * test globs its text files only to put them in its import graph, which `--changed` follows.
 */
export function runChecks(dir: string): RunCheck[] {
  const staging = path.relative(ROOT, dir).split(path.sep).join('/');
  return CHECKS.map(([name, findings]) => ({
    name,
    findings: async () => findings({ staging, files: contentsOf(dir) }),
  }));
}
