// `npm run episode:status -- <slug>`: prints each job of the Episode's per-run pipeline with its state,
// derived from pipeline.yml and events.jsonl. The reading is `readEpisodeStatus`; this file hands it gh and prints.
import { execFileSync } from 'node:child_process';
import { readEpisodeStatus } from './episode-status.ts';
import { renderStatus } from './status.pure.ts';

const slug = process.argv[2];
if (!slug) {
  console.error('✖ usage: npm run episode:status -- <slug>');
  process.exit(1);
}
const result = readEpisodeStatus('.', slug, {
  now: new Date().toISOString(),
  gh: (args) => execFileSync('gh', args, { encoding: 'utf8' }),
});
if (result.kind === 'no-pipeline') {
  console.error(`✖ ${result.file} does not exist; run this from the Episode's worktree root.`);
  process.exit(1);
}
if (result.kind === 'no-jobs') {
  console.error(`✖ ${result.file} has no job list; run npm run verify for the pipeline check's findings.`);
  process.exit(1);
}
for (const error of result.errors) console.error(`! ${error}`);
console.log(renderStatus(result.status));
