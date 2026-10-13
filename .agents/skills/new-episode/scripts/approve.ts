// `node .agents/skills/new-episode/scripts/approve.ts <file> [--by <actor>]`: appends `{ by, at: <now UTC> }`
// to a staging file's `verified` list; never typed by hand. `by` defaults to `human:han` (Han's approval at a
// gate); the orchestrator passes `--by process:markdown-harness` for a machine-confirmed pass.
import { readFileSync, writeFileSync } from 'node:fs';
import { approveText, parseApproveArgs } from './verified.pure.ts';

const USAGE = '✖ usage: node .agents/skills/new-episode/scripts/approve.ts <file> [--by <human:id|process:id>]';
const args = parseApproveArgs(process.argv.slice(2));
if (typeof args === 'string') {
  console.error(`${args}\n${USAGE}`);
  process.exit(1);
}
const at = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
writeFileSync(args.file, approveText(readFileSync(args.file, 'utf8'), args.by, at));
console.log(`✔ ${args.file}: verified by ${args.by} at ${at}`);
