// decision: docs/adr/0008-pipeline-jobs-belong-to-stages.md
import { readPipeline } from './episode-pipeline-definition.pure';
import type { Finding } from './finding.pure';

const TEMPLATE_JOB = 'write-research';
const RESEARCH_JOB = `${TEMPLATE_JOB}-`;
const HEADING = /^#{2,3} Research jobs$/;
const FOLDER = /[A-Z]+-\d{4}__[a-z0-9]+(?:-[a-z0-9]+)*/;

function listedFolders(plan: string): string[] {
  const lines = plan.split('\n');
  const start = lines.map((line) => HEADING.test(line.trim())).lastIndexOf(true);
  if (start === -1) return [];
  const end = lines.findIndex((line, at) => at > start && /^#{1,3} /.test(line));
  return lines
    .slice(start + 1, end === -1 ? undefined : end)
    .filter((line) => /^[-*] /.test(line))
    .flatMap((line) => FOLDER.exec(line)?.[0] ?? []);
}

function folderOf(outputs: readonly string[]): string | undefined {
  return outputs.map((output) => /\/research\/([^/]+)\/research\.md$/.exec(output)?.[1]).find(Boolean);
}

export function checkResearchJobs(file: string, yaml: string, researchPlan: string | undefined): Finding[] {
  const pipeline = readPipeline(yaml);
  if (pipeline === null || pipeline.jobs.some(({ id }) => id === TEMPLATE_JOB)) return [];
  const listed = listedFolders(researchPlan ?? '');
  const jobs = pipeline.jobs
    .filter(({ id }) => id.startsWith(RESEARCH_JOB))
    .map(({ id, outputs }) => ({ id, folder: folderOf(outputs) }));
  const written = new Set(jobs.map(({ folder }) => folder));
  const messages = [
    ...listed
      .filter((folder) => !written.has(folder))
      .map(
        (folder) =>
          `The research plan lists the research job ${folder}, which no write-research job writes; customize-pipeline writes one job per item under the research plan's Research jobs.`,
      ),
    ...jobs
      .filter(({ folder }) => folder === undefined || !listed.includes(folder))
      .map(
        ({ id, folder }) =>
          `Job "${id}" writes ${folder ?? 'no research folder'}, which the research plan's Research jobs do not list; retrieval reuses that question's research.`,
      ),
  ];
  return messages.map((message): Finding => ({ kind: 'pipeline', file, message }));
}
