// `npm run episode:trace -- <slug|events.jsonl> [span-id]`: prints the Run's span tree from the Episode's log
// with statuses, durations, models and tokens, or the subtree under a span id. A span with no end line reads
// as running while the Run has no end line, and crashed once it has one.
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fold, parseLog, renderTree } from './run-log.pure.ts';

const target = process.argv[2];
const spanId = process.argv[3];
if (!target) {
  console.error('✖ usage: npm run episode:trace -- <slug|events.jsonl> [span-id]');
  process.exit(1);
}
const file = target.endsWith('.jsonl') ? target : path.join('docs/episodes', target, 'events.jsonl');
if (!existsSync(file)) {
  console.error(`✖ ${file} does not exist; run this from the Episode's worktree root.`);
  process.exit(1);
}
const { lines, errors } = parseLog(readFileSync(file, 'utf8'));
for (const error of errors) console.error(`! ${error}`);
const finished = lines.some((l) => l.kind === 'end-run');
const folded = fold(lines, { openAs: finished ? 'crashed' : 'running' });
const tree = renderTree(folded, spanId);
if (tree === null) {
  console.error(spanId ? `✖ no span ${spanId} in ${file}` : `✖ ${file} holds no spans`);
  process.exit(1);
}
console.log(tree);
if (folded.orphans.length > 0) console.error(`! ${folded.orphans.length} end line(s) name a span that never started`);
