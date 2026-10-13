// `npm run episode:status -- <slug>`: prints each job of the Episode's
// per-run pipeline with its state, derived from pipeline.yml and run-log.md.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { outputGate, runStatus, subIssuesApproved, type SubIssue } from './status.pure.ts';

const slug = process.argv[2];
if (!slug) {
  console.error('✖ usage: npm run episode:status -- <slug>');
  process.exit(1);
}
const folder = path.join('docs/episodes', slug);
const pipeline = path.join(folder, 'pipeline.yml');
if (!existsSync(pipeline)) {
  console.error(`✖ ${pipeline} does not exist; run this from the Episode's worktree root.`);
  process.exit(1);
}
const runLogFile = path.join(folder, 'run-log.md');
const runLog = existsSync(runLogFile) ? readFileSync(runLogFile, 'utf8') : '';
/** The gate state of a staging output (`outputGate`); null for a file that is missing. */
function outputStatus(output: string): string | null {
  const file = output.replace('<slug>', slug as string);
  if (!existsSync(file)) return null;
  return outputGate(file, readFileSync(file, 'utf8'));
}
/**
 * True when the Episode's spec issue (the one labelled `episode:<slug>`) has sub-issues and none open is
 * `needs-triage` (`subIssuesApproved`). Any gh failure reads as not approved, so the gate stays shut.
 */
function ticketsApproved(): boolean {
  try {
    const gh = (args: string[]) => execFileSync('gh', args, { encoding: 'utf8' });
    const [spec] = JSON.parse(gh(['issue', 'list', '--label', `episode:${slug}`, '--state', 'all', '--json', 'number'])) as { number: number }[];
    if (spec === undefined) return false;
    return subIssuesApproved(JSON.parse(gh(['api', `repos/{owner}/{repo}/issues/${spec.number}/sub_issues`])) as SubIssue[]);
  } catch {
    return false;
  }
}
for (const { id, state } of runStatus(readFileSync(pipeline, 'utf8'), runLog, { outputStatus, labelApproved: ticketsApproved })) console.log(`${state.padEnd(8)}${id}`);
