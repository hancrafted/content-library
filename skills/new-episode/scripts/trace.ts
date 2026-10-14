// `npm run episode:trace -- <slug|events.jsonl> [span-id]`: prints the Run's span tree from the Episode's log
// with statuses, durations, models and tokens, or the subtree under a span id. A span with no end line reads
// as running only while the active-run marker names its Run, and crashed otherwise.
import { existsSync } from 'node:fs';
import { episodeLogPath, readLog } from './episode-run-log.ts';
import { renderTree } from './run-log.pure.ts';

const target = process.argv[2];
const spanId = process.argv[3];
if (!target) {
  console.error('✖ usage: npm run episode:trace -- <slug|events.jsonl> [span-id]');
  process.exit(1);
}
const file = target.endsWith('.jsonl') ? target : episodeLogPath(target);
if (!existsSync(file)) {
  console.error(`✖ ${file} does not exist; run this from the Episode's worktree root.`);
  process.exit(1);
}
const { folded, errors } = readLog(file);
for (const error of errors) console.error(`! ${error}`);
const tree = renderTree(folded, spanId);
if (tree === null) {
  console.error(spanId ? `✖ no span ${spanId} in ${file}` : `✖ ${file} holds no spans`);
  process.exit(1);
}
console.log(tree);
if (folded.orphans.length > 0) console.error(`! ${folded.orphans.length} end line(s) name a span that never started`);
