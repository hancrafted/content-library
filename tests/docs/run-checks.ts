import type { NamedCheck } from '@/episodes/lib/composed-page-checks';
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

// decision: ARCH-003 §4.7
export const RUN_CHECKS_TEST = 'run-checks.test.ts';

const shown = (staging: string, findings: readonly Finding[]): string[] =>
  findings.map(({ file, message }) => `${staging}/${file}: ${message}`);

function contentsOf(dir: string): Record<string, string> {
  return Object.fromEntries(Object.entries(readFolder(dir)).filter(([file]) => file !== RUN_CHECKS_TEST));
}

const wikiResearchFolders = (): string[] =>
  subfolders(path.join(LLM_WIKI, 'research'))
    .flatMap(subfolders)
    .map((folder) => path.relative(ROOT, folder));

export const isPlannedResearchOutput = (output: string): boolean =>
  output.endsWith('/research.md') && !output.includes('*');

export function researchFoldersOfRun(
  onDisk: readonly string[],
  pipeline: string | undefined,
  wiki: readonly string[],
): string[] {
  const planned = (pipeline === undefined ? [] : outputsOf([pipeline]))
    .filter(isPlannedResearchOutput)
    .map((output) => path.posix.dirname(output));
  const promoted = new Set(wiki.map((folder) => path.posix.basename(folder)));
  return [...new Set([...onDisk, ...planned.filter((folder) => !promoted.has(path.posix.basename(folder)))])];
}

function researchFoldersElsewhere(staging: string, wiki: readonly string[]): string[] {
  const runs = subfolders(path.join(ROOT, 'docs/episodes'))
    .map((run) => path.relative(ROOT, run).split(path.sep).join('/'))
    .filter((run) => run !== staging)
    .flatMap((run) => {
      const onDisk = subfolders(path.join(ROOT, run, 'research')).map((folder) => path.relative(ROOT, folder));
      const pipeline = path.join(ROOT, run, 'pipeline.yml');
      return researchFoldersOfRun(onDisk, existsSync(pipeline) ? readFileSync(pipeline, 'utf8') : undefined, wiki);
    });
  return [...runs, ...wiki];
}

export function researchIdFindings(
  own: readonly string[],
  elsewhere: readonly string[],
  categories: readonly string[],
): string[] {
  const namesThisRunsFolder = ({ message }: { message: string }): boolean =>
    own.some((folder) => message.includes(folder));
  return checkResearchFolders([...own, ...elsewhere], categories)
    .filter(namesThisRunsFolder)
    .map(({ message }) => message);
}

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
  const runLogOfBranchInFlight = run.files['run-log.md'];
  const plan = run.files['research-plan.md'] ?? runLogOfBranchInFlight;
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
  const wiki = wikiResearchFolders();
  const onDisk = [
    ...new Set(
      Object.keys(files)
        .filter((file) => file.startsWith('research/') && file.split('/').length > 2)
        .map((file) => `${staging}/${file.split('/').slice(0, 2).join('/')}`),
    ),
  ];
  const own = researchFoldersOfRun(onDisk, files['pipeline.yml'], wiki);
  return researchIdFindings(own, researchFoldersElsewhere(staging, wiki), categories);
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

// decision: ARCH-003 §4.6
export function runChecks(dir: string): NamedCheck[] {
  const staging = path.relative(ROOT, dir).split(path.sep).join('/');
  return CHECKS.map(([name, findings]) => ({
    name,
    findings: async () => findings({ staging, files: contentsOf(dir) }),
  }));
}
