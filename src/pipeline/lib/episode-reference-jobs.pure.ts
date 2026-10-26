/*
 * A per-run pipeline converts each file the Brief lists under `## Episode Design Reference`
 * with its convert-references job: customize-pipeline names one design-reference.md
 * output per item, so each is named in the finalized pipeline. The Brief and the
 * pipeline are finalized separately; this keeps the two lists equal.
 */

import { readPipeline } from './episode-pipeline-definition.pure';
import type { Finding } from './finding.pure';

const JOB = 'convert-references';
const REFERENCE_LINK = /\]\((reference\/[^)\s]+\/design-reference\.md)\)/g;

/** The design-reference.md paths the Brief's `## Episode Design Reference` links, relative to its staging folder. */
function briefReferences(brief: string): string[] {
  const lines = brief.split('\n');
  const start = lines.findIndex((line) => line.trim() === '## Episode Design Reference');
  if (start === -1) return [];
  const end = lines.findIndex((line, at) => at > start && line.startsWith('## '));
  const section = lines.slice(start + 1, end === -1 ? undefined : end).join('\n');
  return [...section.matchAll(REFERENCE_LINK)].map((match) => match[1]);
}

/**
 * Checks one per-run pipeline against its Brief. A pipeline that does not
 * parse is the schema check's finding, not this one's.
 */
export function checkReferenceJobs(file: string, yaml: string, brief: string): Finding[] {
  const pipeline = readPipeline(yaml);
  if (pipeline === null) return [];
  const staging = file.slice(0, file.lastIndexOf('/'));
  const listed = briefReferences(brief).map((reference) => `${staging}/${reference}`);
  const written = pipeline.jobs
    .filter(({ id }) => id === JOB)
    .flatMap(({ outputs }) => outputs)
    .filter((output) => output.endsWith('/design-reference.md'));
  const finding = (message: string): Finding => ({ kind: 'pipeline', file, message });
  return [
    ...listed
      .filter((reference) => !written.includes(reference))
      .map((reference) =>
        finding(
          `The Brief lists ${reference} under Episode Design Reference, which no ${JOB} output names; customize-pipeline writes one per reference.`,
        ),
      ),
    ...written
      .filter((output) => !listed.includes(output))
      .map((output) =>
        finding(`${JOB} writes ${output}, which the Brief does not list under Episode Design Reference.`),
      ),
  ];
}
