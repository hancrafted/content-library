import { readPipeline } from './episode-pipeline-definition.pure';
import type { Finding } from './finding.pure';

const JOB = 'convert-references';
const REFERENCE_LINK = /\]\((reference\/[^)\s]+\/design-reference\.md)\)/g;

function briefReferences(brief: string): string[] {
  const lines = brief.split('\n');
  const start = lines.findIndex((line) => line.trim() === '## Episode Design Reference');
  if (start === -1) return [];
  const end = lines.findIndex((line, at) => at > start && line.startsWith('## '));
  const section = lines.slice(start + 1, end === -1 ? undefined : end).join('\n');
  return [...section.matchAll(REFERENCE_LINK)].map((match) => match[1]);
}

export function checkReferenceJobs(file: string, yaml: string, brief: string): Finding[] {
  const pipeline = readPipeline(yaml);
  if (pipeline === null) return [];
  const converted = pipeline.jobs.filter(({ id }) => id === JOB).flatMap(({ outputs }) => outputs);
  if (converted.some((output) => output.includes('*'))) return [];
  const staging = file.slice(0, file.lastIndexOf('/'));
  const listed = briefReferences(brief).map((reference) => `${staging}/${reference}`);
  const written = converted.filter((output) => output.endsWith('/design-reference.md'));
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
