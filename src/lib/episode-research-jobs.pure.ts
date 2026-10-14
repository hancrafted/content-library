/*
 * A per-run pipeline writes research only where retrieval asked for it: retrieval decides per research question
 * whether the llm-wiki answers it (reuse, no job), answers it but is stale (a refresh job) or does not (a new job),
 * and lists each question needing a job under `### Research jobs` in its run-log entry, one item per job naming its
 * research folder. customize-pipeline expands the template's `write-research` into one job per item (design-ADR-0008).
 * This keeps the two in step: every listed folder has a job writing it, and every job writes a listed folder.
 */

import { readPipeline } from './episode-pipeline-jobs.pure';
import type { Finding } from './finding.pure';

const TEMPLATE_JOB = 'write-research';
const RESEARCH_JOB = `${TEMPLATE_JOB}-`;
const HEADING = '### Research jobs';
const FOLDER = /[A-Z]+-\d{4}__[a-z0-9]+(?:-[a-z0-9]+)*/;

/** The research folders the latest `### Research jobs` list of the run log names, one per item. */
function listedFolders(runLog: string): string[] {
  const lines = runLog.split('\n');
  const start = lines.map((line) => line.trim()).lastIndexOf(HEADING);
  if (start === -1) return [];
  const end = lines.findIndex((line, at) => at > start && /^#{1,3} /.test(line));
  return lines
    .slice(start + 1, end === -1 ? undefined : end)
    .filter((line) => /^[-*] /.test(line))
    .flatMap((line) => FOLDER.exec(line)?.[0] ?? []);
}

/** The research folder a job's output names, `research/<folder>/research.md`, if any. */
function folderOf(outputs: readonly string[]): string | undefined {
  return outputs.map((output) => /\/research\/([^/]+)\/research\.md$/.exec(output)?.[1]).find(Boolean);
}

/**
 * Checks one per-run pipeline against its run log, `undefined` before the log exists. A pipeline that does not
 * parse is the schema check's finding, and a scaffold that still holds the template's `write-research` job is not
 * expanded yet, so neither has findings here.
 */
export function checkResearchJobs(file: string, yaml: string, runLog: string | undefined): Finding[] {
  const pipeline = readPipeline(yaml);
  if (pipeline === null || pipeline.jobs.some(({ id }) => id === TEMPLATE_JOB)) return [];
  const listed = listedFolders(runLog ?? '');
  const jobs = pipeline.jobs
    .filter(({ id }) => id.startsWith(RESEARCH_JOB))
    .map(({ id, outputs }) => ({ id, folder: folderOf(outputs) }));
  const written = new Set(jobs.map(({ folder }) => folder));
  const messages = [
    ...listed
      .filter((folder) => !written.has(folder))
      .map(
        (folder) =>
          `The run log lists the research job ${folder}, which no write-research job writes; customize-pipeline writes one job per item under retrieval's Research jobs.`,
      ),
    ...jobs
      .filter(({ folder }) => folder === undefined || !listed.includes(folder))
      .map(
        ({ id, folder }) =>
          `Job "${id}" writes ${folder ?? 'no research folder'}, which the run log's Research jobs do not list; retrieval reuses that question's research.`,
      ),
  ];
  return messages.map((message): Finding => ({ kind: 'pipeline', file, message }));
}
