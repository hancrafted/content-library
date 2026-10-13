// `npm run episode:status -- <slug>`: prints each job of the Episode's
// per-run pipeline with its state, derived from pipeline.yml and run-log.md.
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { frontmatterStatus, runStatus } from './status.pure.ts';

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
/** The `status:` of a staging output's frontmatter; null for a file that is missing or has none. */
function outputStatus(output: string): string | null {
  const file = output.replace('<slug>', slug as string);
  if (!existsSync(file)) return null;
  return frontmatterStatus(readFileSync(file, 'utf8'));
}
for (const { id, state } of runStatus(readFileSync(pipeline, 'utf8'), runLog, outputStatus)) console.log(`${state.padEnd(8)}${id}`);
