/*
 * A per-run pipeline answers each research question of its Brief with one
 * write-research job: customize-pipeline expands the template's `foreach`
 * into named jobs, so each research file is named at the pipeline gate. The
 * Brief and the pipeline are approved separately; this keeps their counts
 * equal.
 */

import { readPipeline } from './episode-pipeline-jobs.pure';
import type { Finding } from './finding.pure';

const RESEARCH_JOB = 'write-research-';

/** The ordered items under the Brief's `## Research questions`, up to the next h2. */
function researchQuestions(brief: string): number {
  const lines = brief.split('\n');
  const start = lines.findIndex((line) => line.trim() === '## Research questions');
  if (start === -1) return 0;
  const end = lines.findIndex((line, at) => at > start && line.startsWith('## '));
  return lines.slice(start + 1, end === -1 ? undefined : end).filter((line) => /^\d+\. /.test(line)).length;
}

/**
 * Checks one per-run pipeline against its Brief. A pipeline that does not
 * parse is the schema check's finding, not this one's.
 */
export function checkResearchJobs(file: string, yaml: string, brief: string): Finding[] {
  const pipeline = readPipeline(yaml);
  if (pipeline === null) return [];
  const jobs = pipeline.jobs.filter(({ id }) => id.startsWith(RESEARCH_JOB)).length;
  const questions = researchQuestions(brief);
  if (jobs === questions) return [];
  const noun = jobs === 1 ? 'job' : 'jobs';
  const message = `The pipeline has ${jobs} write-research ${noun} for ${questions} research questions in the Brief; customize-pipeline writes one job per question.`;
  return [{ kind: 'pipeline', file, message }];
}
