// Grades one run folder into grading.json. It reads only that folder (run.json for the case, mode and workspace
// roots, tools.json, transcript.jsonl and the pages in pages/) plus the case's frozen checklist and probe. Each grader
// adds expectations in `expectationsOf`: mechanical, isolation, then the checklist judge and the reader probe.
import type { Browser } from '@playwright/test';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { Check } from '../../scripts/grader/check.ts';
import { gradeFile } from '../../scripts/grader/run.ts';
import {
  gradingOf,
  isolationExpectation,
  mechanicalExpectations,
  ungradedReport,
  type Grading,
} from './grading.pure.ts';
import { isolationProblems } from './isolation.pure.ts';
import { gradeQuality } from './quality.ts';
import { runFacts, type ToolCall } from './transcript.pure.ts';

/** What the runner records about a run before grading; run.json. */
export interface RunRecord {
  readonly case: string;
  /** skill-creator's numeric eval id for the case. */
  readonly evalId: number;
  readonly mode: string;
  /** The model the agent reported; null when it never started. */
  readonly model: string | null;
  readonly arm: string;
  readonly run: number;
  /** The sandbox's spellings; tool paths must stay under one of them. */
  readonly roots: readonly string[];
  /** The skill version the arm ran, or null for the no-skill arm. */
  readonly skillDigest: string | null;
}

const readJson = <T>(file: string): T => JSON.parse(readFileSync(file, 'utf8')) as T;

/** The run's pages, largest first: when the agent wrote several, the largest is graded and the rest noted. */
function pagesOf(pages: string): string[] {
  const found = readdirSync(pages).filter((file) => file.endsWith('.html'));
  return found.sort((a, b) => statSync(path.join(pages, b)).size - statSync(path.join(pages, a)).size);
}

interface Graders {
  readonly browser: Browser;
  readonly checks: readonly Check[];
}

async function mechanical({ browser, checks }: Graders, pages: string, mode: string) {
  const [page] = pagesOf(pages);
  const report =
    page === undefined
      ? ungradedReport(checks, 'the run wrote no .html page')
      : await gradeFile(browser, checks, path.join(pages, page));
  return mechanicalExpectations(report, mode, checks);
}

async function expectationsOf(graders: Graders, runDir: string, record: RunRecord) {
  const tools = readJson<ToolCall[]>(path.join(runDir, 'tools.json'));
  const pages = path.join(runDir, 'pages');
  const [page] = pagesOf(pages);
  const mechanicalAndIsolation = [
    ...(await mechanical(graders, pages, record.mode)),
    isolationExpectation(isolationProblems(tools, record.roots)),
  ];
  // The quality graders write the views into outputs/: the viewer embeds text files inside a <script>, where a
  // page's own </script> would end it early, so it shows the page only as screenshots.
  const quality = await gradeQuality({
    browser: graders.browser,
    page: page && path.join(pages, page),
    runDir,
    record,
  });
  return { expectations: [...mechanicalAndIsolation, ...quality.expectations], quality };
}

function notesOf(pages: string, error: string | null): string[] {
  const [graded, ...others] = pagesOf(pages);
  return [
    ...(error === null ? [] : [error]),
    ...(others.length === 0 ? [] : [`graded ${graded}; also wrote ${others.join(', ')}`]),
  ];
}

export async function gradeRun(graders: Graders, runDir: string): Promise<Grading> {
  const record = readJson<RunRecord>(path.join(runDir, 'run.json'));
  const pages = path.join(runDir, 'pages');
  const { error } = runFacts(readFileSync(path.join(runDir, 'transcript.jsonl'), 'utf8').split('\n'));
  const { expectations, quality } = await expectationsOf(graders, runDir, record);
  const grading = gradingOf({
    expectations,
    tools: readJson<ToolCall[]>(path.join(runDir, 'tools.json')),
    outputChars: pagesOf(pages).reduce((total, page) => total + statSync(path.join(pages, page)).size, 0),
    error,
    notes: [...notesOf(pages, error), ...quality.notes],
    judge: quality.judge,
  });
  writeFileSync(path.join(runDir, 'grading.json'), `${JSON.stringify(grading, null, 2)}\n`);
  return grading;
}
