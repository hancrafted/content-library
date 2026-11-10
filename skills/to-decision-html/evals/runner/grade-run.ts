// Grades one run folder into grading.json. It reads only that folder: run.json (case mode and workspace roots),
// tools.json, transcript.jsonl and the pages in pages/. Each grader adds expectations; a new grader (the judge,
// the reader probe) appends its own in `expectationsOf`.
import type { Browser } from '@playwright/test';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
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
  return [
    ...(await mechanical(graders, path.join(runDir, 'pages'), record.mode)),
    isolationExpectation(isolationProblems(tools, record.roots)),
  ];
}

/**
 * The viewer shows outputs/. It embeds text files inside a <script>, where a page's own </script> would end it
 * early, so outputs/ holds a screenshot of the graded page on load, offline, at 1440 px.
 */
async function screenshot({ browser }: Graders, runDir: string): Promise<void> {
  const [page] = pagesOf(path.join(runDir, 'pages'));
  if (page === undefined) return;
  const url = pathToFileURL(path.join(runDir, 'pages', page)).href;
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  try {
    await context.route('**/*', (route) => (route.request().url() === url ? route.continue() : route.abort()));
    const tab = await context.newPage();
    await tab.goto(url, { waitUntil: 'networkidle' });
    await tab.screenshot({ path: path.join(runDir, 'outputs', page.replace(/\.html$/, '.png')) });
  } finally {
    await context.close();
  }
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
  const grading = gradingOf({
    expectations: await expectationsOf(graders, runDir, record),
    tools: readJson<ToolCall[]>(path.join(runDir, 'tools.json')),
    outputChars: pagesOf(pages).reduce((total, page) => total + statSync(path.join(pages, page)).size, 0),
    error,
    notes: notesOf(pages, error),
  });
  writeFileSync(path.join(runDir, 'grading.json'), `${JSON.stringify(grading, null, 2)}\n`);
  await screenshot(graders, runDir);
  return grading;
}
